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

## 4. Deploying to Vercel (Free Hosting)

You can deploy the app to Vercel right away without needing Supabase first. It will run in local demo mode until you add your database keys:

1. Double-click `scripts\push-to-github.bat` to make sure all your latest files are on GitHub.
2. Go to **[vercel.com](https://vercel.com)** and log in (sign in with your GitHub account).
3. Click **"Add New..."** -> **"Project"**.
4. Find and import your repository: **`r73608925-lab/TKPL`**.
5. Vercel will automatically detect **Vite**. Keep all default build settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click **Deploy**. Your website will be live on a free `vercel.app` link within 1 minute!

---

## 5. Connecting to Supabase Cloud Database (When You Are Ready)

The website works immediately out-of-the-box. When you want real player registrations and photos saved in the cloud:

1. Create a free account and project at **[supabase.com](https://supabase.com)**.
2. In your Supabase Dashboard, click **SQL Editor** on the left menu.
3. Open [`supabase/migrations/0001_tkpl_schema_and_rls.sql`](file:///c:/Users/liter/Desktop/TKPL/supabase/migrations/0001_tkpl_schema_and_rls.sql), copy everything, paste it into the Supabase SQL Editor, and click **Run**. This creates all tables, security policies, and photo storage.
4. Under **Authentication** -> **Users**, invite or sign up organizer logins for Mansoor and Sunil.
5. In the SQL Editor, run [`supabase/admin_setup.sql`](file:///c:/Users/liter/Desktop/TKPL/supabase/admin_setup.sql) with their exact emails to give them Super Admin rights.
6. In Supabase, go to **Project Settings** -> **API**, copy:
   - **Project URL**
   - **anon public key**
7. In Vercel, go to **Settings** -> **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
8. For testing on your laptop, create `.env.local` in this folder with the same two keys.


