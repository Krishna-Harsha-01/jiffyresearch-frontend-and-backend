# 🚀 NexusResearch AI — Complete Deployment Guide

> A step-by-step guide to deploy **NexusResearch AI** from zero → fully live on Vercel, Render, and Supabase.

---

## 📖 Table of Contents
1. [Architecture & Deployment Overview](#1-architecture--deployment-overview)
2. [Prerequisites & Free Cloud Accounts](#2-prerequisites--free-cloud-accounts)
3. [PART A — Supabase Database Setup (PostgreSQL)](#part-a--supabase-database-setup-postgresql)
4. [PART B — Google Gemini API Setup](#part-b--google-gemini-api-setup)
5. [PART C — Local Testing & Execution](#part-c--local-testing--execution)
6. [PART D — Deploy Backend API on Render](#part-d--deploy-backend-api-on-render)
7. [PART E — Deploy Frontend Web App on Vercel](#part-e--deploy-frontend-web-app-on-vercel)
8. [PART F — Final Wiring & Verification](#part-f--final-wiring--verification)
9. [Environment Variables Cheat Sheet](#environment-variables-cheat-sheet)

---

## 1. Architecture & Deployment Overview

| Component | Technology Stack | Hosting Platform |
| --------- | ---------------- | ---------------- |
| **Frontend Website** | React 18, Vite, Tailwind CSS, React Router | **Vercel** |
| **Backend API** | Node.js, Express, JWT, Zod, Multer | **Render** |
| **Database** | Supabase (PostgreSQL) / SQLite | **Supabase Cloud** |
| **AI Synthesis** | Google Gemini API (Gemini 1.5 Flash) | Secure Backend Invocation |

```
[ User Browser ] ---> [ Vercel Frontend ] ---> [ Render Backend API ] ---> [ Google Gemini API ]
                                                                      ---> [ Supabase Database ]
```

---

## 2. Prerequisites & Free Cloud Accounts

Create these free accounts (all support GitHub Sign-In):
- **GitHub**: https://github.com
- **Supabase**: https://supabase.com
- **Google AI Studio**: https://aistudio.google.com
- **Render**: https://render.com
- **Vercel**: https://vercel.com

---

## PART A — Supabase Database Setup (PostgreSQL)

1. Log into https://supabase.com → Click **New Project**.
2. Project Name: `nexus-research-db`
3. Set a strong Database Password.
4. Copy credentials from **Project Settings → API**:
   - `SUPABASE_URL` (e.g. `https://xyz.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` (Secret Key — backend only)
5. Open **SQL Editor** in Supabase, copy the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), paste into SQL Editor, and click **Run**.

---

## PART B — Google Gemini API Setup

1. Go to Google AI Studio: https://aistudio.google.com
2. Click **Get API Key** → Create key in a new project.
3. Save as `GEMINI_API_KEY`.
> 🔒 **Security Notice:** Store `GEMINI_API_KEY` ONLY in backend environment variables. Never commit to public frontend code.

---

## PART C — Local Testing & Execution

1. Clone project:
```bash
git clone https://github.com/<your-username>/nexus-research-ai.git
cd nexus-research-ai
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Setup Backend `.env` file (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=nexus_research_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key
```

4. Run locally:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## PART D — Deploy Backend API on Render

1. Log into https://render.com → Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configuration settings:
   - **Name:** `nexus-research-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `your_secure_jwt_secret`
   - `GEMINI_API_KEY`: `your_google_gemini_api_key`
5. Click **Create Web Service**. Copy the backend URL (e.g. `https://nexus-research-backend.onrender.com`).

---

## PART E — Deploy Frontend Web App on Vercel

1. Log into https://vercel.com → Click **Add New...** → **Project**.
2. Import your GitHub repository.
3. Configuration settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://nexus-research-backend.onrender.com/api`
5. Click **Deploy**. Copy your live site link (e.g. `https://nexus-research-ai.vercel.app`).

---

## PART F — Final Wiring & Verification

1. In Render (Backend Settings), verify CORS allows your Vercel frontend URL.
2. Open your Vercel URL, register a new account, upload a research PDF, and test:
   - ✅ Document AI Summarization
   - ✅ Gemini Contextual Chat Assistant
   - ✅ Interactive 2D Knowledge Graph
   - ✅ Literature Review Matrix Report Generation

---

## Environment Variables Cheat Sheet

### Backend Environment Variables (`backend/.env`)
| Variable | Description | Where to get |
| -------- | ----------- | ------------ |
| `PORT` | Server listening port | `5000` |
| `NODE_ENV` | Environment mode | `production` or `development` |
| `JWT_SECRET` | Secret key for signing tokens | Any long random string |
| `GEMINI_API_KEY` | Google Gemini AI Key | https://aistudio.google.com |
| `SUPABASE_URL` | Supabase Project URL | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secret Key | Supabase Settings -> API |

### Frontend Environment Variables (`frontend/.env`)
| Variable | Description | Value |
| -------- | ----------- | ----- |
| `VITE_API_URL` | Render backend API endpoint | `https://nexus-research-backend.onrender.com/api` |
