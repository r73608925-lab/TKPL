# T-KPL Database Plan (Supabase)

## Tables
| Table | What it stores | Who can read | Who can change |
|---|---|---|---|
| `tournament_settings` (1 row) | Fee, deadline, UPI ID, rules, open/closed | Everyone | Super admin |
| `players` | Player profile, photo path, review + auction status | Admins only | Reviewers, super admin |
| `payments` | UPI/cash reference, verification status, who verified | Admins only | Payment verifiers, super admin |
| `admin_users` | Mansoor, Sunil and helpers, with their role | Self / super admin | Super admin |
| `audit_logs` | Automatic record of every approval, payment and settings change | Admins | Nobody by hand (triggers only) |
| `franchise_enquiries` | Team owner enquiries (Rs 1.6L deposit) | Reviewers, super admin | Super admin |
| `teams`, `team_memberships`, `auction_events`, `auction_bids` | Phase 2 auction (empty for now) | Locked | Locked |

## How the public website reaches the data (functions, not tables)
- `submit_player_registration` creates a player and a payment, checks deadline, age and duplicate phone, and makes the `TKPL-2026-XXXX` number.
- `lookup_registration_status` needs registration number, phone and date of birth together.
- `submit_payment_reference` lets a player add a UTR later. A player can never mark it verified.
- `get_public_stats` returns counts only, no personal data.
- `submit_franchise_enquiry` takes a team-owner enquiry.
- `log_export` records CSV exports (admins only).

## Rules the database enforces by itself
- Auction Eligible needs profile Approved and payment Verified.
- Verifying a payment needs a reference number, and stamps who and when.
- If a payment stops being Verified, the player leaves the auction pool.
- Only the super admin can edit a player's name, phone, date of birth or photo.
- Photos: private bucket `player-photos`, 5 MB, jpeg/png/webp, public upload only into `registrations/`, only admins can view.

## Build order
1. Run `supabase/migrations/0001_tkpl_schema_and_rls.sql`.
2. Create admin logins in Authentication, then run `supabase/admin_setup.sql`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel and in `.env.local`.
4. Switch the website from browser storage to Supabase.
5. Test on two phones, then share the link.
