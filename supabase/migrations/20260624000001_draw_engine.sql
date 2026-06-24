-- Migration: Draw Engine Updates

-- 1. Profiles: Add is_banned
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned boolean not null default false;

-- 2. Draws: Add new fields
ALTER TABLE public.draws ADD COLUMN IF NOT EXISTS tier_2_prize numeric not null default 0;
ALTER TABLE public.draws ADD COLUMN IF NOT EXISTS tier_3_prize numeric not null default 0;
ALTER TABLE public.draws ADD COLUMN IF NOT EXISTS cutoff_date timestamptz not null default now();
ALTER TABLE public.draws ADD COLUMN IF NOT EXISTS executed_at timestamptz;
ALTER TABLE public.draws ADD COLUMN IF NOT EXISTS executed_by uuid references public.profiles(id) on delete set null;

-- 3. Draws: Update status check constraint
-- Handle updating the default value and the constraint safely
ALTER TABLE public.draws ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.draws ALTER COLUMN status SET DEFAULT 'draft';

DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'draws' AND con.contype = 'c' 
    AND pg_get_constraintdef(con.oid) LIKE '%status%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.draws DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

UPDATE public.draws SET status = 'draft' WHERE status = 'pending';

ALTER TABLE public.draws ADD CONSTRAINT draws_status_check CHECK (status IN ('draft', 'active', 'completed', 'cancelled'));
