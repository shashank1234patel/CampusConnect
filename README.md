# CampusConnect – Event Management Platform

A complete, modern college event management platform built with React 19, TypeScript, Tailwind CSS, and Lucide icons.

## Features
- **Student & Member Registration**: Support for both college students (with USN verification) and non-student faculty/members.
- **Event Discovery**: Filter by categories (Hackathons, Workshops, Cultural Events, Sports Events, Seminars, Competitions, Technical Events, Other Events), dates, and pricing.
- **Instant Event Registration**: Pre-fills profile details, prevents duplicate registrations, tracks seat capacity in real-time, and generates unique pass IDs (e.g. `CC-2026-X89B2`).
- **Digital Pass & Ticket**: Printable entry pass with barcode and QR scanner simulation.
- **Host an Event**: Submit new campus events with deadline, seat limits, poster upload, and admin review queue.
- **Organizer Dashboard**: View hosted events, attendee rosters, export participant lists to CSV/Excel, toggle registration limits, and broadcast announcements.
- **Admin Directorate Panel**: Approve or reject pending event requests, manage campus members, monitor live registrations, and remove flagged events.

## How to Run on Your Local Desktop

### 1. Requirements
- Node.js (version 18 or higher recommended)
- npm or yarn

### 2. Setup Instructions
1. Extract the downloaded zip file into a new folder on your Desktop (e.g. `Desktop/CampusConnect`).
2. Open a terminal or Command Prompt in that folder:
   ```bash
   cd Desktop/CampusConnect
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Deploying to GitHub Pages with GitHub Actions

The repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the application to GitHub Pages whenever you push to `main` or `master`.

### Step 1: Push Code to your GitHub Repository
```bash
git add .
git commit -m "feat: setup CampusConnect with GitHub Actions deployment"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

### Step 2: Enable GitHub Pages in your Repository Settings
1. Go to your repository on GitHub.
2. Click **Settings** (top navigation tab).
3. In the left sidebar, click **Pages** (under Code and automation).
4. Under **Build and deployment** -> **Source**, select **GitHub Actions** (NOT "Deploy from a branch").

### Step 3: Add Supabase Secrets (Optional if using defaults)
1. In repository **Settings**, go to **Secrets and variables** -> **Actions**.
2. Click **New repository secret**:
   - `VITE_SUPABASE_URL`: `https://rerdtoiflkjczoftrbri.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key (from Project Settings -> API)
3. Once added, push or trigger the workflow manually from the **Actions** tab by clicking **Deploy CampusConnect to GitHub Pages** -> **Run workflow**.

