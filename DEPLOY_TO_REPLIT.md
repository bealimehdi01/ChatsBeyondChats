# ☁️ How to Deploy to Replit

This project is configured to run as a **Monorepo** on Replit:
1.  **Backend (Laravel)**: Runs on Port 8000
2.  **Worker (Node.js)**: Runs in the background (Port 7860)

The **Frontend** (React) should be deployed separately to **Vercel** (Recommended) or Netlify, pointing to your Replit Backend URL.

---

## Part 1: Replit Setup (Backend + Worker)

1.  **Create a New Repl**:
    *   Click **+ Create Repl**.
    *   Select **"Import from GitHub"**.
    *   Paste your Repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
    *   Click **Import**.

2.  **Wait for Install**:
    *   Replit will read `replit.nix` and install PHP, Composer, SQLite, and Node.js automatically.
    *   It might take 2-3 minutes.

3.  **Configure Secrets (Environment Variables)**:
    *   Go to **Tools** -> **Secrets** in the Replit sidebar.
    *   Add the following secrets (Copy from your local `.env` files):
        *   `APP_KEY`: (Copy from `backend/.env` - e.g., `base64:....`)
        *   `DB_CONNECTION`: `sqlite`
        *   `GEMINI_API_KEY`: (Your Google Key)
        *   `PERPLEXITY_API_KEY`: (Your Perplexity Key)
        *   `LLM_PROVIDER`: `gemini`

4.  **Run**:
    *   Click the big green **RUN** button.
    *   The console will show:
        *   Composer installing dependencies...
        *   Database migrating...
        *   Backend starting at port 8000...
        *   Worker starting...

5.  **Get Your Backend URL**:
    *   A "Webview" window will verify the app is running.
    *   Copy the URL from the address bar of that Webview.
    *   It will look like: `https://assignment-004-yourname.replit.co`
    *   **Keep this URL handy.**

---

## Part 2: Vercel Setup (Frontend)

1.  **Go to Vercel**:
    *   [https://vercel.com/new](https://vercel.com/new)
    *   Import the **SAME** GitHub Repository.

2.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" and select `frontend`. (Important!)

3.  **Environment Variables**:
    *   Add a new variable:
        *   **Name**: `VITE_API_URL`
        *   **Value**: `https://assignment-004-yourname.replit.co/api`  <-- **Paste your Replit URL here and add `/api` at the end.**

4.  **Deploy**:
    *   Click **Deploy**.
    *   Wait ~1 minute.

---

## Part 3: Verify

1.  Open your **Vercel App URL**.
2.  Go to the **About** page.
3.  Go to the **Admin** page.
    *   Click **"Fetch Original"**.
    *   You should see logs in your Replit Console indicating the scraper is working!

## ⚠️ Troubleshooting

*   **Replit Sleeping**: Replit puts free apps to sleep. If your Frontend says "Network Error", simply open your Replit tab to wake it up.
*   **Database Locked**: SQLite on Replit can rarely get locked. Restarting the Repl fixes it.

