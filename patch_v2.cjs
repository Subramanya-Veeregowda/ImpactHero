const fs = require('fs');

const path = 'supabase/migrations/20260624000000_initial_schema.sql';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;`;

const replacementStr = `create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(path, content, 'utf8');
console.log('Patch v2 applied to migration file.');
