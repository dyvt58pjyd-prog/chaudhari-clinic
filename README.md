# Chaudhari Skin & Dental Care Multispeciality Clinic & Medicare Pharmacy

> **Production Hospital Management System (HMS), Clinical EMR & Medicare Pharmacy**  
> Tailored for **Chaudhari Skin & Dental Care**, Shriram Chowk, Khamgaon, Maharashtra – 444303.  
> Architecture: **Vite SPA + Vercel Serverless Functions + Neon Serverless PostgreSQL**.

---

## 🚀 Live Cloud Deployment Stack

- **Hosting & Serverless Functions:** [Vercel](https://vercel.com/) (Zero-config Serverless in `/api`)
- **Cloud Database:** [Neon Serverless PostgreSQL](https://neon.tech/) (`@neondatabase/serverless` over WebSockets/HTTP)
- **Frontend Engine:** Vite 8, Vanilla CSS (Design Tokens & Glassmorphism), Lucide Icons, Canvas Confetti
- **Offline / Local Resilience:** Auto-reconnecting hybrid architecture — if the internet disconnects or database is cold, the clinic runs uninterrupted on local storage and syncs back to Neon upon reconnection.

---

## ⚡ Quick Start: Deploy to Vercel & Neon Database

### Step 1: Create a Neon PostgreSQL Database (Takes 60 seconds)

1. Go to **[https://console.neon.tech/](https://console.neon.tech/)** and sign up / log in.
2. Click **Create Project**.
   - Project Name: `chaudhari-clinic`
   - Region: Select nearest region (e.g. `ap-southeast-1` or `eu-central-1`)
   - Postgres version: 16 (default)
3. On the project dashboard, locate the **Connection Details** box.
4. Copy your connection string (ensure `Pooled connection` or standard is selected). It looks like:
   ```text
   postgresql://neondb_owner:npg_abcdef123456@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. *(Optional)* Open the **SQL Editor** tab in Neon console and paste the contents of `schema.sql` to inspect or pre-seed the database.  
   *(Note: The serverless API automatically executes `CREATE TABLE IF NOT EXISTS` on first request anyway!)*

---

### Step 2: Deploy to Vercel

#### Method A: Deploy via GitHub (Recommended)

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Chaudhari Clinic HMS with Neon DB & Vercel ready"
   git remote add origin https://github.com/<your-username>/chaudhari-clinic.git
   git branch -M main
   git push -u origin main
   ```
2. Go to **[https://vercel.com/new](https://vercel.com/new)** and import your GitHub repository.
3. In the **Configure Project** screen:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Expand **Environment Variables** and add:
   - **Key:** `DATABASE_URL`
   - **Value:** `<Paste your Neon Postgres connection string from Step 1>`
5. Click **Deploy**. Vercel will build and launch your production clinic application in under a minute!

#### Method B: Deploy via Vercel CLI

If you have the Vercel CLI installed:
```bash
npm i -g vercel
vercel login
vercel
```
When prompted, set environment variable `DATABASE_URL`:
```bash
vercel env add DATABASE_URL
# Paste your Neon connection string, select Production & Preview
vercel --prod
```

---

## 🔧 Local Development & Testing

1. Clone or navigate to the directory:
   ```bash
   cd chaudhari-clinic
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Neon `DATABASE_URL` into `.env`. If left empty, the application runs in resilient local cache mode.

4. Start Vite local development server with API proxy:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. Run full system verification:
   ```bash
   node verify_full_system.js
   ```

---

## 🗄️ Neon Database Schema Overview (`schema.sql`)

The application provisions 3 primary tables with auto-indexing:

1. **`hospital_config`**: Key-value store for clinic profile, operational settings, and official UPI VPA (`9049883983@ybl`).
2. **`patients`**: Full EMR record including demographics, vital signs, clinical diagnosis, selective prescriptions JSON, external RVG ID, billing status, and pharmacy dispensing state.
3. **`petty_expenses`**: Clinic operational expense voucher tracking (reception desk petty cash, sanitization, printing, utility expenses).

---

## 🔐 Default Hospital Staff Login Accounts

| Role | Username | Password | Full Name / Description |
| :--- | :--- | :--- | :--- |
| **Reception** | `reception` | `clinic@123` | Reception Desk & Patient Admissions |
| **Dermatology Doctor** | `dr.rajnikant` | `skin@123` | Dr. Rajnikant Chaudhari (MD Skin & VD) |
| **Dental Surgery Doctor** | `dr.priyanka` | `dental@123` | Dr. Priyanka Chaudhari (Anekar) (BDS) |
| **Pediatric Dental Doctor** | `dr.rutika` | `smile@123` | Dr. Rutika Tulaskar (Chaudhari) (BDS) |
| **General Doctor Desk** | `doctor` | `doctor@123` | Consulting Doctor Portal |
| **Medicare Pharmacy** | `pharmacy` | `meds@123` | Medicare Pharmacy Dispensing Desk |
| **Hospital Administrator**| `admin` | `admin@123` | Daily Closing, Doctor Split, Petty Cash & DB Sync |

---

## ☁️ Neon Cloud Status & Live Sync Features

- **Top App Bar Neon Indicator**:
  - `🟢 Neon Live`: Connected to Neon Serverless PostgreSQL.
  - `💾 Local DB (Offline / Standby)`: Operating safely on local cache.
  - Clicking the badge triggers an immediate two-way cloud sync.
- **Admin Cloud Sync Center**:
  - Located in the **Hospital Admin Portal**.
  - **Push Local to Neon**: Uploads all cached patients and expenses to the Neon cloud.
  - **Pull Neon to Local**: Downloads the latest cloud records to the active device.
  - **Test Connection**: Pings Neon over serverless WebSockets and displays latency in milliseconds.
