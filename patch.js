const fs = require('fs');

const path = 'supabase/migrations/20260624000000_initial_schema.sql';
let content = fs.readFileSync(path, 'utf8');

const targetStr = "exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')";
const replacementStr = "public.is_admin()";

// 1. Add the function before the RLS section
const functionStr = `
-------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES & UTILS
-------------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;
`;

content = content.replace(
  "-------------------------------------------------------------------------------\r\n-- 5. ROW LEVEL SECURITY (RLS) POLICIES\r\n-------------------------------------------------------------------------------",
  functionStr
);
content = content.replace(
  "-------------------------------------------------------------------------------\n-- 5. ROW LEVEL SECURITY (RLS) POLICIES\n-------------------------------------------------------------------------------",
  functionStr
);

// 2. Replace all policy subqueries
content = content.split(targetStr).join(replacementStr);

fs.writeFileSync(path, content, 'utf8');
console.log('Migration file patched successfully!');
