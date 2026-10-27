# TKPL (Tennisball Kadapa Premier League) - Step-by-Step User Guide

Welcome to the official **TKPL Player Registration Portal & Organizer Dashboard**. This guide explains how to launch, test, and operate the application in plain, simple steps.

---

## 1. How to Start the App on Your Computer (One Click)

1. Open the **`TKPL`** folder on your Desktop (`C:\Users\liter\Desktop\TKPL`).
2. Double-click the **`run.bat`** file.
3. A command window will open, start the server, and automatically open your web browser to **`http://localhost:5173`**.

*(Tip: Keep the black command window open while you are using the website. Close it when you are done.)*

---

## 2. How Players Use the Website

### A. Registering as a Player (`/register`)
1. Click **Register Player** at the top right of the Home page.
2. Fill in your **Full Name**, **10-digit WhatsApp/Mobile Number**, **Date of Birth**, **Locality/Town** (e.g., Kadapa, Proddatur, Rayachoti), and **Cricket Profile** (Batter, Bowler, All-Rounder, or Wicketkeeper).
3. Upload a clear **Player Photograph** (JPEG, PNG, or WebP under 5 MB).
4. If you have already paid the registration fee via UPI or cash at the organizer counter, enter your **UPI UTR / Cash Receipt Reference**. (If you haven't paid yet, leave it blank and submit it later!)
5. Tick the **Tournament Rules & Eligibility** box and click **Submit Registration**.
6. Save your unique **Registration Number** (for example, `TKPL-2026-0106`) shown on the confirmation screen.

### B. Checking Status or Submitting Payment Proof Later (`/check-status`)
1. Click **Check Status** in the top navigation bar.
2. For privacy protection, enter all three details together:
   - **Registration Number** (e.g., `TKPL-2026-0101`)
   - **Mobile Number**
   - **Date of Birth**
   *(When testing locally, you can also click one of the **Quick Test Profiles** buttons at the top of the Check Status box to fill in sample player details with one click!)*
3. You will see three separate status badges:
   - **1. Profile Review Status** (*Submitted -> Under Review -> Approved / Needs Correction*)
   - **2. Fee Verification Status** (*Pending -> Ref Submitted -> Payment Verified*)
   - **3. Auction Pool Status** (*Not in Pool Yet -> Auction Eligible*)
4. If your payment is still **Pending**, you can enter your 12-digit UPI UTR or cash receipt number right on that page.

---

## 3. How Organizers & Admins Use the Dashboard (`/admin`)

1. Click **Admin** (or **Dashboard**) in the top navigation bar.
2. Choose which **Organizer Role** you want to sign in as:
   - **Super Admin / Tournament Lead:** Can do everything (change fees/deadlines/settings, approve players, verify payments, export CSVs, and download full JSON backups).
   - **Registration Reviewer:** Can inspect player photos and details, approve/reject/request corrections, and export CSVs. *Cannot verify or alter payments.*
   - **Payment Verifier (Sultan Sports / Partner Desk):** Can reconcile UPI UTRs and cash receipts against bank statements and mark payments as **Verified**, **Failed**, or **Refunded**. *Cannot edit player profiles.*
   - **Read-Only Helper:** Can view roster counts with masked phone numbers (`98******23`), but cannot change any status or export personal data.
   *(Note: Once logged in, you can switch roles anytime using the **Test Role Permissions** dropdown at the top right of the admin bar!)*

### Key Admin Tasks:
- **Reconcile a Payment (`/admin/payments`):** Click **Reconcile** next to a player's payment, check their 12-digit UPI reference against your real bank statement, and mark it **Verified**.
- **Approve a Player for the Auction (`/admin/players`):** Click **Inspect** next to any player, check their uploaded photo and cricket details, change their Registration Status to **Approved**, and set Auction Pool Eligibility to **Auction Eligible**. *(The system automatically blocks marking anyone "Auction Eligible" until their fee payment is Verified!)*
- **Export the Final Auction Sheet (`/admin/players`):** Click **Export Auction-Eligible CSV** to download a clean Excel-ready `.csv` file containing only approved players with verified payments.
- **Update Fee, Deadline, or Partner Credits (`/admin/settings`):** Open **Tournament Settings** as Super Admin to update the registration fee, deadline, official UPI ID, or open/close registrations immediately.

---

## 4. Connecting to Cloud Supabase for Production Launch

By default, the app works immediately on your computer using local browser storage (with a **Reset Demo Data** button in the Admin bar). When you are ready to go live on the internet:

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard, paste the contents of [`supabase/migrations/0001_tkpl_schema_and_rls.sql`](file:///c:/Users/liter/Desktop/TKPL/supabase/migrations/0001_tkpl_schema_and_rls.sql) and [`supabase/admin_setup.sql`](file:///c:/Users/liter/Desktop/TKPL/supabase/admin_setup.sql) (after creating the admin logins), and click **Run**.
3. Copy `.env.example` to `.env.local` in this folder and paste your **Supabase Project URL** and **Anon Public Key**.
4. Deploy the folder to **Cloudflare Pages** (`npm run build` -> output directory `dist`).

