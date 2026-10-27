-- ============================================================================
-- TKPL Seed Data for Local / Staging Verification
-- ============================================================================

insert into public.tournament_settings (
  id,
  tournament_name,
  organizer_line,
  partner_line,
  season,
  fee_paise,
  currency,
  upi_id,
  registration_open,
  deadline,
  min_age,
  max_age,
  rules_text,
  refund_policy,
  privacy_notice,
  contact_text
) values (
  1,
  'TKPL · Tennisball Kadapa Premier League',
  'Organized by Tournament Founders [Confirm Brother''s Full Name]',
  'In association with Sultan Sports & Partner Sports Business [Confirm Name]',
  'Season 1 · 2026',
  50000,
  'INR',
  'sultansports.tkpl@upi',
  true,
  '2026-11-30T18:29:59Z',
  15,
  50,
  'Open to eligible tennis-ball cricket players subject to published tournament rules and organizer verification. Submitting a registration or UPI reference does not guarantee approval or auction eligibility until verified against official bank statements.',
  'Registration fees are reconciled manually against official bank/UPI statements. Refund eligibility for rejected profiles or event postponement is governed by the organizing partners'' published policy.',
  'Player details and photographs are stored in private storage for identity verification, roster management and the official TKPL player auction.',
  '+91 90000 00000 (Official TKPL Helpdesk · 10:00 AM to 8:00 PM IST)'
)
on conflict (id) do nothing;
