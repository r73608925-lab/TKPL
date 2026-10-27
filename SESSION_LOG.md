# TKPL Project Session Log

## Session: 2026-10-27 - Tournament Launch, Mobile Optimization & Deployment Prep

### 1. Executive Summary & Why Changes Were Made
- **Organizer Header Symmetrical Redesign**:
  - *Why*: In mobile view (~380px), the 3-column organizer bar overflowed, cutting off Sunil's contact card. Organizers needed equal prominence for both partners on mobile screens.
  - *What*: Refactored `src/modules/core/components/Navbar.tsx` into a strict 50/50 responsive grid (`grid-cols-2`). Added photo avatars for **Mansoor** (Sultan Sports, Kadapa · `9110744945`) and **Sunil** (NR Sports, Vempalli · `8919155512`) with tap-to-call, tap-to-WhatsApp, and in-browser avatar photo replacement.
- **Accurate Rules & Fee Extraction from Video/Telugu Poster**:
  - *Why*: Official launch media specified exact tournament figures that differed from initial drafts.
  - *What*: Updated official registration fee to **₹399/-** (from ₹500), confirmed Guru Laser Ball specification, added New & Old Kadapa District boundary requirement, embedded Grand Launch video reel, added Telugu franchise guidelines (₹1.60L deposit, ₹80,000 purse, 15 players per squad, 3-year agreement), and highlighted mega cash prizes (₹2,00,000 1st / ₹1,50,000 2nd).
- **Client Cache Invalidation (`tkpl_v2_*`)**:
  - *Why*: Testers opening the app still saw old draft ₹500 fees stored in `localStorage`.
  - *What*: Bumped storage keys in `src/modules/core/context/TournamentContext.tsx` to `tkpl_v2_*` to force clean loading of the updated rules.
- **Complete Supabase Cloud Backend & Database Plan**:
  - *Why*: The application needed a production-ready database schema that protects player privacy, allows private photo uploads, and gives organizers a secure dashboard for payment reconciliation.
  - *What*: Created `supabase/migrations/0001_tkpl_schema_and_rls.sql` with tables (`players`, `payments`, `tournament_settings`, `admin_users`, `audit_logs`, `franchise_enquiries`), automatic registration number generator (`TKPL-2026-XXXX`), RLS policies, private bucket `player-photos`, and secure RPCs (`submit_player_registration`, `lookup_registration_status`, `submit_payment_reference`, `get_public_stats`).
  - *What*: Created `supabase/admin_setup.sql` to elevate Mansoor and Sunil to `super_admin`. Documented the schema in `docs/database-plan.md`.
- **Vercel Single-Page App (SPA) Routing Configuration**:
  - *Why*: Direct access to routes like `/register`, `/check-status`, or `/admin` on Vercel would return 404 without rewrite rules.
  - *What*: Added `vercel.json` with rewrite rule `/(.*) -> /index.html`.
- **Repository Setup & Helper Scripts**:
  - *Why*: Code needed to be synced to GitHub (`https://github.com/r73608925-lab/TKPL.git`) while maintaining clean folder hygiene and simple one-click operations for non-technical organizers.
  - *What*: Provided `run.bat` for one-click local testing, `scripts/push-to-github.bat` for interactive push to GitHub, and updated `guide.md` with simple step-by-step instructions.

---

### 2. Immediate Next Steps (For Next Session / Tool)
1. **Push Remaining Local Commits**:
   - Run `scripts\push-to-github.bat` (or `git push origin main`) to sync `SESSION_LOG.md`, `vercel.json`, `supabase/`, and docs to GitHub.
2. **Deploy to Vercel (Free)**:
   - In [vercel.com](https://vercel.com), import repository `r73608925-lab/TKPL`. Preset: Vite. Click Deploy. (Works immediately in demo mode).
3. **Connect Supabase Database (When Ready)**:
   - Create project in [supabase.com](https://supabase.com). Run `supabase/migrations/0001_tkpl_schema_and_rls.sql` in the SQL Editor.
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Project Settings -> Environment Variables.

---

### 3. Architecture & Key Files Map
- **Frontend Architecture**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Phosphor Icons + Motion.
  - `src/modules/core/`: Types (`tkpl.ts`), Validation (`validation.ts`), Context & State (`TournamentContext.tsx`), Navigation (`Navbar.tsx`), Footer (`Footer.tsx`).
  - `src/modules/registration/`: Home Page (`HomePage.tsx`), Registration Form (`RegisterPage.tsx`), Status Checker (`CheckStatusPage.tsx`), Success Card (`RegistrationSuccessPage.tsx`).
  - `src/modules/admin/`: Organizer dashboard with 4 access roles, Player inspection, Payment reconciliation, and Settings editor.
- **Backend / Database**:
  - `supabase/migrations/0001_tkpl_schema_and_rls.sql`: Full production PostgreSQL schema.
  - `supabase/admin_setup.sql`: Super admin elevation script for organizers.
  - `docs/database-plan.md`: Database structure documentation.
- **Root Operations**:
  - `run.bat`: One-click local launch.
  - `guide.md`: Step-by-step user and organizer manual.
  - `vercel.json`: Vercel SPA routing rules.
  - `scripts/push-to-github.bat`: Interactive GitHub push script.
