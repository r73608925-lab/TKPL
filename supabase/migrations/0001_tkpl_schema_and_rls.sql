-- ============================================================================
-- TKPL (Tennisball Kadapa Premier League)
-- Migration 0001: Core Schema, Server-Side ID Generation, RPCs & RLS Policies
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Sequence for deterministic, collision-free server-side registration IDs
create sequence if not exists public.tkpl_registration_seq start 101 increment 1;

-- 2. Admin Users Table (Role-based access control)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('super_admin', 'registration_reviewer', 'payment_verifier', 'read_only_helper')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Tournament Settings Table (Single-row configuration id = 1)
create table if not exists public.tournament_settings (
  id integer primary key default 1 check (id = 1),
  tournament_name text not null default 'TKPL · Tennisball Kadapa Premier League',
  organizer_line text not null default 'Organized by Tournament Founders [Confirm Brother''s Full Name]',
  partner_line text not null default 'In association with Sultan Sports & Partner Sports Business [Confirm Name]',
  season text not null default 'Season 1 · 2026',
  fee_paise integer not null default 50000 check (fee_paise >= 0),
  currency text not null default 'INR',
  upi_id text not null default 'sultansports.tkpl@upi',
  registration_open boolean not null default true,
  deadline timestamptz not null default '2026-11-30T18:29:59Z',
  min_age integer not null default 15,
  max_age integer not null default 50,
  rules_text text not null default 'Open to eligible tennis-ball cricket players subject to organizer verification. Submitting a registration or payment reference does not guarantee approval or auction selection until verified by authorized TKPL admins.',
  refund_policy text not null default 'Registration fees are verified against actual bank/UPI statements. Refund eligibility for rejected registrations or tournament cancellation is governed by the official organizer policy.',
  privacy_notice text not null default 'Player photos, cricket profiles and contact details are collected solely for tournament administration, identity verification and the TKPL player auction.',
  contact_text text not null default '+91 90000 00000 (Official TKPL Helpdesk · 10:00 AM to 8:00 PM IST)',
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

-- 4. Players Table
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  registration_no text unique not null,
  full_name text not null check (char_length(trim(full_name)) >= 2),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  date_of_birth date not null,
  locality text not null check (char_length(trim(locality)) >= 2),
  role text not null check (role in ('batter', 'bowler', 'all_rounder', 'wicketkeeper')),
  batting_hand text not null default 'right_hand' check (batting_hand in ('right_hand', 'left_hand')),
  bowling_style text not null default 'none' check (bowling_style in ('right_arm_pace', 'right_arm_spin', 'left_arm_pace', 'left_arm_spin', 'none')),
  experience text not null default '',
  emergency_contact text not null default '',
  photo_path text not null,
  registration_status text not null default 'submitted' check (
    registration_status in ('submitted', 'under_review', 'needs_correction', 'approved', 'rejected', 'withdrawn')
  ),
  auction_status text not null default 'not_reviewed' check (
    auction_status in ('not_reviewed', 'eligible', 'ineligible', 'drafted')
  ),
  review_notes text not null default '',
  rules_acknowledged boolean not null default true check (rules_acknowledged = true),
  marketing_consent boolean not null default false,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint players_unique_phone unique (phone)
);

create index if not exists idx_players_registration_status on public.players(registration_status);
create index if not exists idx_players_auction_status on public.players(auction_status);
create index if not exists idx_players_locality on public.players(locality);

-- 5. Payments Table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  amount_paise integer not null check (amount_paise >= 0),
  currency text not null default 'INR',
  method text not null default 'upi' check (method in ('upi', 'bank_transfer', 'cash_organizer')),
  transaction_ref text not null default '',
  receipt_path text not null default '',
  status text not null default 'pending' check (
    status in ('pending', 'submitted', 'verified', 'failed', 'refunded')
  ),
  verified_by uuid references auth.users(id),
  verifier_name text not null default '',
  verified_at timestamptz,
  refund_ref text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_player_id on public.payments(player_id);
create index if not exists idx_payments_status on public.payments(status);

-- 6. Audit Logs Table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  actor_name text not null default 'System',
  actor_role text not null default 'system',
  action text not null,
  entity_type text not null,
  entity_id text not null,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- 7. Phase 2 Auction-Ready Tables (Scaffolded for smooth post-MVP expansion)
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name text unique not null,
  owner_name text not null,
  captain_player_id uuid references public.players(id),
  purse_paise integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  sold_price_paise integer not null default 0,
  assigned_at timestamptz not null default now(),
  unique (player_id)
);

create table if not exists public.auction_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date timestamptz,
  status text not null default 'planned' check (status in ('planned', 'live', 'completed')),
  rules_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.auction_bids (
  id uuid primary key default gen_random_uuid(),
  auction_event_id uuid not null references public.auction_events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  amount_paise integer not null check (amount_paise > 0),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Trigger: Server-Side Registration Number & Updated Timestamp
-- ============================================================================
create or replace function public.assign_registration_no()
returns trigger
language plpgsql
security definer
as $$
declare
  seq_val bigint;
begin
  if new.registration_no is null or trim(new.registration_no) = '' then
    seq_val := nextval('public.tkpl_registration_seq');
    new.registration_no := 'TKPL-2026-' || lpad(seq_val::text, 4, '0');
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_players_assign_reg_no on public.players;
create trigger trg_players_assign_reg_no
before insert on public.players
for each row
execute function public.assign_registration_no();

-- ============================================================================
-- Helper Function: Check Admin Role in RLS Policies
-- ============================================================================
create or replace function public.has_admin_role(allowed_roles text[])
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.active = true
      and au.role = any(allowed_roles)
  );
$$;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================
alter table public.admin_users enable row level security;
alter table public.tournament_settings enable row level security;
alter table public.players enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;
alter table public.teams enable row level security;
alter table public.team_memberships enable row level security;
alter table public.auction_events enable row level security;
alter table public.auction_bids enable row level security;

-- Tournament Settings: Public can read; only super_admin can update
create policy "Public can view tournament settings"
  on public.tournament_settings for select
  using (true);

create policy "Super admin can update tournament settings"
  on public.tournament_settings for update
  using (public.has_admin_role(array['super_admin']))
  with check (public.has_admin_role(array['super_admin']));

-- Admin Users: Only active admins can view their own record; super_admin views/manages all
create policy "Admins can view own admin profile"
  on public.admin_users for select
  using (auth.uid() = user_id or public.has_admin_role(array['super_admin']));

create policy "Super admin manages admin users"
  on public.admin_users for all
  using (public.has_admin_role(array['super_admin']))
  with check (public.has_admin_role(array['super_admin']));

-- Players: NO public select! Only active admins can list/view players.
-- Public registration happens exclusively through controlled RPC or restricted insert.
create policy "Authorized admins can read players"
  on public.players for select
  using (public.has_admin_role(array['super_admin', 'registration_reviewer', 'payment_verifier', 'read_only_helper']));

create policy "Reviewers and super admins can update players"
  on public.players for update
  using (public.has_admin_role(array['super_admin', 'registration_reviewer']))
  with check (public.has_admin_role(array['super_admin', 'registration_reviewer']));

-- Payments: NO public select or status override!
create policy "Authorized admins can read payments"
  on public.payments for select
  using (public.has_admin_role(array['super_admin', 'payment_verifier', 'registration_reviewer', 'read_only_helper']));

create policy "Payment verifiers and super admins can update payments"
  on public.payments for update
  using (public.has_admin_role(array['super_admin', 'payment_verifier']))
  with check (public.has_admin_role(array['super_admin', 'payment_verifier']));

-- Audit Logs: Admins can read; reviewers/verifiers/super_admin can insert
create policy "Admins can read audit logs"
  on public.audit_logs for select
  using (public.has_admin_role(array['super_admin', 'registration_reviewer', 'payment_verifier']));

create policy "Admins can insert audit logs"
  on public.audit_logs for insert
  with check (public.has_admin_role(array['super_admin', 'registration_reviewer', 'payment_verifier']));

-- ============================================================================
-- Controlled Public RPCs (Prevents Enumeration & Enforces Server Deadlines)
-- ============================================================================
create or replace function public.submit_player_registration(
  p_full_name text,
  p_phone text,
  p_date_of_birth date,
  p_locality text,
  p_role text,
  p_batting_hand text,
  p_bowling_style text,
  p_experience text,
  p_emergency_contact text,
  p_photo_path text,
  p_rules_acknowledged boolean,
  p_marketing_consent boolean,
  p_payment_method text default 'upi',
  p_transaction_ref text default ''
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_settings public.tournament_settings%rowtype;
  v_player public.players%rowtype;
  v_pay_status text;
begin
  select * into v_settings from public.tournament_settings where id = 1;

  if not found or not v_settings.registration_open then
    raise exception 'REGISTRATIONS_CLOSED: Player registrations are currently closed by the organizers.';
  end if;

  if now() > v_settings.deadline then
    raise exception 'DEADLINE_PASSED: The registration deadline for TKPL has passed.';
  end if;

  if exists (select 1 from public.players where phone = trim(p_phone)) then
    raise exception 'DUPLICATE_PHONE: A registration already exists with this mobile number. Use Check Status with your Registration ID and Date of Birth.';
  end if;

  insert into public.players (
    registration_no, full_name, phone, date_of_birth, locality,
    role, batting_hand, bowling_style, experience, emergency_contact,
    photo_path, registration_status, auction_status, rules_acknowledged, marketing_consent
  ) values (
    '', trim(p_full_name), trim(p_phone), p_date_of_birth, trim(p_locality),
    p_role, p_batting_hand, p_bowling_style, coalesce(trim(p_experience), ''), coalesce(trim(p_emergency_contact), ''),
    p_photo_path, 'submitted', 'not_reviewed', p_rules_acknowledged, coalesce(p_marketing_consent, false)
  )
  returning * into v_player;

  v_pay_status := case when trim(coalesce(p_transaction_ref, '')) <> '' then 'submitted' else 'pending' end;

  insert into public.payments (
    player_id, amount_paise, currency, method, transaction_ref, status
  ) values (
    v_player.id, v_settings.fee_paise, v_settings.currency,
    coalesce(p_payment_method, 'upi'), trim(coalesce(p_transaction_ref, '')), v_pay_status
  );

  return jsonb_build_object(
    'player_id', v_player.id,
    'registration_no', v_player.registration_no,
    'full_name', v_player.full_name,
    'registration_status', v_player.registration_status,
    'payment_status', v_pay_status,
    'created_at', v_player.created_at
  );
end;
$$;

-- Safe Public Status Lookup: Requires BOTH registration_no AND (phone OR date_of_birth)
-- Prevents strangers from checking if someone else's phone number is registered.
create or replace function public.lookup_registration_status(
  p_registration_no text,
  p_phone text,
  p_date_of_birth date
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_player public.players%rowtype;
  v_payment public.payments%rowtype;
begin
  select * into v_player
  from public.players
  where upper(trim(registration_no)) = upper(trim(p_registration_no))
    and trim(phone) = trim(p_phone)
    and date_of_birth = p_date_of_birth;

  if not found then
    return null;
  end if;

  select * into v_payment
  from public.payments
  where player_id = v_player.id
  order by created_at desc
  limit 1;

  return jsonb_build_object(
    'registration_no', v_player.registration_no,
    'full_name', v_player.full_name,
    'locality', v_player.locality,
    'role', v_player.role,
    'registration_status', v_player.registration_status,
    'auction_status', v_player.auction_status,
    'review_notes', v_player.review_notes,
    'payment_status', coalesce(v_payment.status, 'pending'),
    'transaction_ref', coalesce(v_payment.transaction_ref, ''),
    'submitted_at', v_player.created_at
  );
end;
$$;
