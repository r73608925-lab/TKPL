-- ============================================================================
-- T-KPL: make Mansoor and Sunil real admins.
-- Run this AFTER the main setup script, and AFTER you have created their
-- logins in Supabase -> Authentication -> Users -> "Add user" (tick "Auto
-- Confirm User"). Replace the two emails below with the exact emails you used.
-- ============================================================================

insert into public.admin_users (user_id, email, full_name, role)
select id, email, 'Mansoor · Sultan Sports Kadapa', 'super_admin'
from auth.users
where email = 'REPLACE-WITH-MANSOOR-EMAIL@example.com'
on conflict (user_id) do update set role = excluded.role, full_name = excluded.full_name, active = true;

insert into public.admin_users (user_id, email, full_name, role)
select id, email, 'Sunil · NR Sports Vempalli', 'super_admin'
from auth.users
where email = 'REPLACE-WITH-SUNIL-EMAIL@example.com'
on conflict (user_id) do update set role = excluded.role, full_name = excluded.full_name, active = true;

-- Optional: a helper who can verify payments only
-- insert into public.admin_users (user_id, email, full_name, role)
-- select id, email, 'Payment Desk', 'payment_verifier'
-- from auth.users where email = 'REPLACE-WITH-HELPER-EMAIL@example.com';

-- Check the result (should list your admins):
select email, full_name, role, active from public.admin_users;
