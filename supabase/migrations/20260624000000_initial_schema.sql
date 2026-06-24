-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-------------------------------------------------------------------------------
-- 1. FUNCTIONS & TRIGGERS FOR UPDATED_AT
-------------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-------------------------------------------------------------------------------
-- 2. TABLES & CONSTRAINTS
-------------------------------------------------------------------------------

-- PROFILES TABLE
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    full_name text,
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();

-- CHARITIES TABLE
create table public.charities (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    logo_url text,
    website_url text,
    is_featured boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger set_charities_updated_at before update on public.charities for each row execute procedure public.handle_updated_at();

-- SUBSCRIPTIONS TABLE
create table public.subscriptions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    stripe_customer_id text unique,
    stripe_subscription_id text unique,
    plan_type text not null check (plan_type in ('monthly', 'yearly')),
    status text not null default 'active' check (status in ('active', 'past_due', 'canceled')),
    charity_id uuid references public.charities(id) on delete set null,
    contribution_percentage numeric not null default 10.0 check (contribution_percentage >= 10.0 and contribution_percentage <= 100.0),
    current_period_end timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.handle_updated_at();

-- SCORES TABLE
create table public.scores (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    value integer not null check (value >= 1 and value <= 45),
    date date not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_user_date unique(user_id, date) -- Only 1 score per day per user
);
create trigger set_scores_updated_at before update on public.scores for each row execute procedure public.handle_updated_at();

-- DRAWS TABLE
create table public.draws (
    id uuid primary key default uuid_generate_v4(),
    month date not null unique, 
    winning_numbers integer[] check (
        array_length(winning_numbers, 1) = 5 
        and winning_numbers <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45]
    ),
    jackpot_amount numeric not null default 0,
    status text not null default 'pending' check (status in ('pending', 'completed')),
    created_at timestamptz not null default now()
);

-- DRAW_RUNS TABLE (Simulations and Executions)
create table public.draw_runs (
    id uuid primary key default uuid_generate_v4(),
    draw_id uuid not null references public.draws(id) on delete cascade,
    run_type text not null check (run_type in ('simulation', 'execution')),
    parameters jsonb,
    results jsonb,
    executed_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now()
);

-- WINNERS TABLE
create table public.winners (
    id uuid primary key default uuid_generate_v4(),
    draw_id uuid not null references public.draws(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    match_type integer not null check (match_type in (3, 4, 5)),
    prize_amount numeric not null,
    proof_url text,
    status text not null default 'pending' check (status in ('pending', 'verified', 'paid', 'rejected')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger set_winners_updated_at before update on public.winners for each row execute procedure public.handle_updated_at();

-- NOTIFICATIONS TABLE
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    message text not null,
    type text not null check (type in ('info', 'warning', 'success', 'draw_result')),
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

-------------------------------------------------------------------------------
-- 3. INDEXES
-------------------------------------------------------------------------------
create index idx_profiles_email on public.profiles(email);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_scores_user_id on public.scores(user_id);
create index idx_scores_date on public.scores(date desc);
create index idx_draws_month on public.draws(month desc);
create index idx_draw_runs_draw_id on public.draw_runs(draw_id);
create index idx_winners_draw_id on public.winners(draw_id);
create index idx_winners_user_id on public.winners(user_id);
create index idx_notifications_user_id on public.notifications(user_id);

-------------------------------------------------------------------------------
-- 4. TRIGGERS: Auth & Rolling Scores
-------------------------------------------------------------------------------

-- Auto-create profile on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, role)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Enforce Rolling 5-Score Limit
create or replace function public.enforce_rolling_scores()
returns trigger as $$
declare
    score_count integer;
begin
    select count(*) into score_count from public.scores where user_id = new.user_id;
    
    if score_count > 5 then
        -- Keep only the 5 most recent dates. Delete everything else.
        delete from public.scores
        where id in (
            select id from public.scores
            where user_id = new.user_id
            order by date asc, created_at asc
            limit (score_count - 5)
        );
    end if;
    return new;
end;
$$ language plpgsql;

create trigger tr_enforce_rolling_scores
    after insert on public.scores
    for each row execute procedure public.enforce_rolling_scores();


-------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES & UTILS
-------------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean as $
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$ language sql security definer;


alter table public.profiles enable row level security;
alter table public.charities enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.draw_runs enable row level security;
alter table public.winners enable row level security;
alter table public.notifications enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());
create policy "Admins can update all profiles" on public.profiles for update using (public.is_admin());

-- Charities
create policy "Charities are publicly viewable" on public.charities for select using (true);
create policy "Admins can manage charities" on public.charities for all using (public.is_admin());

-- Subscriptions
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Admins can view all subscriptions" on public.subscriptions for select using (public.is_admin());

-- Scores
create policy "Users can view own scores" on public.scores for select using (auth.uid() = user_id);
create policy "Users can insert own scores" on public.scores for insert with check (auth.uid() = user_id);
create policy "Users can update own scores" on public.scores for update using (auth.uid() = user_id);
create policy "Users can delete own scores" on public.scores for delete using (auth.uid() = user_id);
create policy "Admins can view all scores" on public.scores for select using (public.is_admin());

-- Draws & Draw Runs
create policy "Draws are publicly viewable" on public.draws for select using (true);
create policy "Admins can manage draws" on public.draws for all using (public.is_admin());
create policy "Admins can manage draw runs" on public.draw_runs for all using (public.is_admin());

-- Winners
create policy "Users can view own winner record" on public.winners for select using (auth.uid() = user_id);
create policy "Admins can view all winners" on public.winners for select using (public.is_admin());
create policy "Users can update own winner proof" on public.winners for update using (auth.uid() = user_id and status = 'pending');
create policy "Admins can update winners" on public.winners for update using (public.is_admin());

-- Notifications
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Users can delete own notifications" on public.notifications for delete using (auth.uid() = user_id);
create policy "Admins can insert notifications" on public.notifications for insert with check (public.is_admin());

-------------------------------------------------------------------------------
-- 6. PUBLIC WINNERS VIEW (For Anonymized Access)
-------------------------------------------------------------------------------
create view public.anonymized_winners as
select 
    w.id, 
    w.draw_id, 
    w.match_type, 
    w.prize_amount, 
    w.status,
    w.created_at
from public.winners w
where w.status in ('verified', 'paid');

-------------------------------------------------------------------------------
-- 7. STORAGE STRATEGY (WINNER PROOFS)
-------------------------------------------------------------------------------
insert into storage.buckets (id, name, public) 
values ('winner_proofs', 'winner_proofs', false)
on conflict do nothing;

create policy "Users can upload their own proofs" on storage.objects for insert
with check (bucket_id = 'winner_proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view their own proofs" on storage.objects for select
using (bucket_id = 'winner_proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own proofs" on storage.objects for delete
using (bucket_id = 'winner_proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Admins can view all proofs" on storage.objects for select
using (bucket_id = 'winner_proofs' and public.is_admin());

create policy "Admins can delete all proofs" on storage.objects for delete
using (bucket_id = 'winner_proofs' and public.is_admin());
