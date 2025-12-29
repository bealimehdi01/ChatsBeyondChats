# BeyondChats - AI-Powered Content Enhancement Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Live-green.svg)
![React](https://img.shields.io/badge/frontend-React_Vite-cyan)
![Laravel](https://img.shields.io/badge/backend-Laravel_11-red)
![Node](https://img.shields.io/badge/worker-Node.js-green)

A full-stack AI content platform that scrapes, enhances, and displays articles using Google Search, Puppeteer web scraping, and Google Gemini LLM.

## 🚀 Live Deployment

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | [https://chats-beyond-chats.vercel.app/](https://chats-beyond-chats.vercel.app/) | ✅ Live |
| **Backend API** | [https://chats-beyond-chats--sayyedalimehdi0.replit.app/api/articles](https://chats-beyond-chats--sayyedalimehdi0.replit.app/api/articles) | ✅ Live |
| **Worker** | Running on Replit (background service) | ✅ Active |

## 💡 What Does This App Do?

Think of this as an **"Automatic Blog Improver"** - it takes old, outdated articles and uses AI to rewrite them to match the quality of top-ranking Google results.

### 1️⃣ The Interface (What You See)

A **React dashboard** that displays articles with a **side-by-side comparison**:

- 📄 **Original**: The old article exactly as it appeared on BeyondChats blog
- ✨ **Enhanced**: The new AI-rewritten version with better formatting and updated information
- 📱 **Responsive**: Works seamlessly on mobile and desktop

### 3️⃣ Admin Control Panel (New!)
A dedicated **/admin** interface for manual control:
- **Manual Mode**: Trigger scraping or enhancement on demand
- **Auto Mode**: Run worker on a configurable schedule (5-60 mins)
- **Fetch Original**: Instantly scrape fresh articles
- **AI Enhance**: Enhances specific articles with a click

## 📋 Assignment Completion

**Phase 1: Laravel Backend ✅**
- Scraped 5 articles from BeyondChats blog
- SQLite database with migrations
- Full CRUD API (`/api/articles`)
- Admin APIs (`/api/settings`, `/scrape`, `/enhance`)

**Phase 2: Node.js Worker ✅**
- Fetches latest article from API
- Searches Google
- Publishes enhanced version with citations stripped ([1][2] removed)

**Phase 3: React Frontend ✅**
- Modern UI with Tailwind CSS
- Displays original + enhanced articles
- Admin Panel for system control
- Deployed on Vercel

## ⚙️ How it Works

The application operates on a 4-step automated cycle:

1.  **📚 Finds Old Content**: Scrapes the oldest blog posts from the target website (BeyondChats). It intelligently paginates to find content that hasn't been enhanced yet.
2.  **🔍 Researches Competitors**: For each article, it searches Google for the top-ranking results on that specific topic to understand what makes them successful.
3.  **🤖 Rewrites Using AI**:
    *   **Primary**: Uses **Google Gemini 2.0 Flash** to rewrite the article for better flow, clarity, and SEO.
    *   **Fallback**: If Gemini hits rate limits (common on free tier), it seamlessly switches to **Perplexity (Sonar)** to ensure the job always completes.
4.  **📝 Publishes**: The enhanced article is saved to the database, with cleaned formatting, ready for comparison.

## 🚀 Getting Started

### Prerequisites

*   **Node.js** (v18+)
*   **PHP** (v8.2+) with Composer
*   **Google Gemini API Key** (Free)
*   **Perplexity API Key** (Optional, for fallback)

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │────────▶│  Laravel Backend │◀────────│  Node.js Worker │
│   (Vercel)      │  HTTP   │    (Replit)      │   API   │    (Replit)     │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                      │                           │
                                      │                           │
                                      ▼                           ▼
                               ┌─────────────┐          ┌──────────────────┐
                               │   SQLite    │          │  Google Search   │
                               │  Database   │          │   + Gemini LLM   │
                               └─────────────┘          └──────────────────┘
```

**Data Flow:**
1. Worker fetches latest "original" article from Backend API
2. Worker searches Google for article title  
3. Worker scrapes top 2 results using Puppeteer
4. Worker sends original + references to Gemini LLM
5. LLM generates enhanced article
6. Worker publishes enhanced article back to Backend
7. Frontend fetches and displays both versions

## 💻 Local Development

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- SQLite

### Quick Start (Windows)

```powershell
# Clone repository
git clone https://github.com/bealimehdi01/ChatsBeyondChats.git
cd ChatsBeyondChats

# Run all services
./start_all.ps1
```

This starts:
- Laravel backend on `http://localhost:8000`
- React frontend on `http://localhost:5173`
- Node.js worker (background)

### Manual Setup

**Backend:**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan scrape:initial
php artisan serve
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Worker:**
```bash
cd worker
npm install
# Add LLM_API_KEY to .env
node index.js
```

## 📡 API Endpoints

### Articles

```http
GET    /api/articles       # List all articles
GET    /api/articles/{id}  # Get specific article
GET    /api/articles/latest # Get latest original article
POST   /api/articles       # Create article
PUT    /api/articles/{id}  # Update article
DELETE /api/articles/{id}  # Delete article

### Admin & Worker Control
GET    /api/settings       # Get worker configuration
PUT    /api/settings       # Update mode/interval
POST   /api/scrape         # Trigger manual scrape
POST   /api/enhance/{id}   # Trigger specific enhancement
```

**Example Response:**
```json
{
  "id": 1,
  "title": "The Evolution of Chatbots (Enhanced)",
  "content": "...",
  "source": "enhanced",
  "original_article_id": 1,
  "reference_links": "[\"url1\", \"url2\"]",
  "created_at": "2025-12-25T16:34:28.000000Z"
}
```

## 🔑 Environment Variables

**Backend (.env):**
```env
APP_NAME=BeyondChats
APP_ENV=production
APP_KEY=[generated]
DB_CONNECTION=sqlite
```

**Frontend (.env.production / Vercel):**
```env
VITE_API_URL=https://[replit-url]/api
# Example: https://chats-beyond-chats--sayyedalimehdi0.replit.app/api
```

**Worker (.env):**
```env
API_URL=http://localhost:8000/api
LLM_API_KEY=[your-gemini-key]
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Axios |
| **Backend** | Laravel 11, PHP 8.2, SQLite |
| **Worker** | Node.js, Puppeteer, Axios |
| **AI/LLM** | Google Gemini API |
| **Deployment** | Vercel (Frontend), Replit (Backend + Worker) |

> **Note on Deployment**: Replit was used solely as a hosting platform for the backend and worker services. All code was developed locally using VS Code and tested with the `start_all.ps1` script. Replit provides free hosting for PHP and Node.js applications, making it ideal for deploying this full-stack system without cost.

## 📦 Project Structure

```
ChatsBeyondChats/
│
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Console/Commands/ScrapeArticles.php
│   │   ├── Http/Controllers/ArticleController.php
│   │   └── Models/Article.php
│   ├── database/
│   │   └── migrations/
│   └── routes/api.php
│
├── frontend/            # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── services/api.js
│   │   └── App.jsx
│   └── package.json
│
├── worker/              # Background processor
│   ├── index.js
│   ├── llm.js
│   ├── scraper.js
│   └── package.json
│
├── deploy.sh            # Replit deployment script
├── start_all.ps1        # Local dev launcher
└── README.md
```

## 🚀 Deployment Guide

### Vercel (Frontend)
1. Fork repository.
2. Import project to Vercel (select `frontend` root).
3. Set Environment Variable: `VITE_API_URL` = `https://[your-replit-url].replit.app/api`
   *   **Important**: Must end with `/api` and use `https`.
   *   Example: `https://chats-beyond-chats--sayyedalimehdi0.replit.app/api`
4. Deploy.

### Replit (Backend + Worker)
1. Import from GitHub: `https://github.com/bealimehdi01/ChatsBeyondChats`
2. **Setup Secrets**:
   - `LLM_API_KEY` (Gemini API Key)
3. **Configure Deployment**:
   - Set **Run Command** to: `bash deploy.sh`
   - Set **Build Command** to: (Empty or default)
4. Click **Deploy**.
5. **Initial Setup**: After first deployment, open Shell and run:
   ```bash
   cd backend && php artisan scrape:initial
   ```

## 🧪 Testing

**Test Backend:**
```bash
curl https://chats-beyond-chats--sayyedalimehdi0.replit.app/api/articles
```

**Test Worker:**
Check the Replit Shell (or Logs) to see the worker picking up jobs if Auto Mode is enabled.

## 👨‍💻 Author

**Ali Mehdi**  
GitHub: [@bealimehdi01](https://github.com/bealimehdi01)

## 📄 License

MIT License - Built for BeyondChats Assignment

---

**Assignment Submission**: December 25, 2024  
**Repository**: [ChatsBeyondChats](https://github.com/bealimehdi01/ChatsBeyondChats)
