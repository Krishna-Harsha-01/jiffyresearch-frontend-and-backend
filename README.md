# 🔬 NexusResearch AI — Intelligent Knowledge Synthesis & Multi-Source Research Workspace

> **Hackathon Challenge:** AI for Research & Knowledge Discovery  
> **Solution:** An AI-powered research workspace that accelerates information retrieval, simplifies literature review workflows, visualizes concept networks, and produces publication-ready evidence synthesis reports using Google Gemini API.

---

## 📌 Problem Statement

Researchers, academics, healthcare professionals, and policy analysts face extreme **information overload**. Reviewing dozens of dense scientific publications, PDFs, empirical datasets, and clinical papers is highly time-consuming, fragmented, and prone to knowledge gaps:
- **Time-Consuming Literature Reviews:** Manual reading and cross-referencing papers takes days or weeks.
- **Fragmented Context & Silos:** Insights remain isolated inside separate PDFs without cross-document semantic connection.
- **Hallucination & Lack of Evidence:** Existing standard AI chatbots lack strict citation grounding, leading to unverified claims.

---

## 💡 Solution Description & Detailed Feature Breakdown

**NexusResearch AI** provides a unified research intelligence studio equipped with 5 core workspace capabilities:

### 1. 📄 Documents & Summaries
- **What it does:** Ingests uploaded PDF papers, TXT, Markdown, CSV datasets, or raw text. Using `pdf-parse` and Google Gemini 1.5, the backend automatically extracts:
  - **Executive Summaries:** Concise 2-3 paragraph overviews of each paper.
  - **Key Empirical Findings:** Bulleted lists of primary empirical results and methodology details.
  - **Entity & Concept Tags:** Extracted technical concepts, datasets, and author entities.

### 2. 🤖 Gemini Research Assistant (AI Chat)
- **What it does:** Context-aware Q&A dialogue grounded across all uploaded workspace documents. Ask complex multi-paper queries (e.g., *"Compare methodology limitations across Paper A and Paper B"*).
- **Grounded Citations:** Every AI answer includes exact document titles and direct quote snippets from your files to verify evidence without hallucination.

### 3. 🕸️ Knowledge Mesh Graph
- **What it does:** Renders an interactive 2D visual network diagram mapping extracted research concepts, methodologies, datasets, and paper relationships. Clicking any node opens a detail drawer revealing its connection to your workspace documents.

### 4. 📝 Evidence & Research Notes
- **What it does:** Allows researchers to write, tag, and organize custom evidence blocks, hypotheses, and synthetic observations (e.g. tagged as *"Key Finding"*, *"Methodology Gap"*, or *"Empirical Citation"*). These notes are directly integrated into report synthesis.

### 5. 📊 Synthesis Reports Generator
- **What it does:** One-click generation of publication-ready research synthesis reports in formatted Markdown. Choose between:
  - **Literature Review & Synthesis Matrix:** Comparative Markdown table mapping source documents, core methodologies, primary findings, and confidence levels.
  - **Executive Evidence Briefing:** High-grade summary tailored for executive decision-makers.
  - **Methodological Analysis & Gaps:** In-depth critique of research gaps and potential scientific biases.

---

## 📖 User Manual & Onboarding Guide

The platform includes two built-in guidance systems for first-time users:
1. **Interactive Onboarding Walkthrough Wizard:** Step-by-step 5-step modal that opens automatically upon registration or login, with a **"Skip Tutorial"** button.
2. **Comprehensive User Manual Modal:** Accessible via the **`📖 User Guide`** button in the top navigation bar and under **"Explore Platform Features"** on the landing page.

---

## 🛠️ Assignment Tech Stack

### Frontend
- **Framework:** React.js (v18) + Vite
- **Routing:** React Router DOM (v6)
- **Styling:** Tailwind CSS + Lucide Icons + Glassmorphic UI System
- **API Client:** Axios with JWT Interceptor

### Backend
- **Runtime:** Node.js + Express.js
- **Authentication:** JSON Web Token (JWT) + bcryptjs
- **Validation:** Zod Schema Middleware
- **File Uploads:** Multer (PDF parsing via `pdf-parse`)

### Database
- **Primary / Local:** SQLite (`sqlite3`) auto-initializing database
- **Cloud Compatible:** Supabase PostgreSQL with RLS Policies (Schema included in `supabase/migrations/0001_init.sql`)

### Artificial Intelligence
- **Model:** Google Gemini API (`gemini-1.5-flash`) via `@google/generative-ai`
- **Security:** AI API Key stored strictly in backend environment variables (`GEMINI_API_KEY`).

---

## ⚡ Quick Start & Execution Steps

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Git**: Installed

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/<your-username>/nexus-research-ai.git
cd nexus-research-ai
npm run install:all
```

### 3. Configure Environment Variables
Create `.env` inside the `backend` folder:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=nexus_research_super_secret_jwt_key_2026_hackathon
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Start Local Server
Run both frontend and backend concurrently:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| `POST` | `/api/auth/register` | Register new researcher account | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes |
| `DELETE` | `/api/auth/account` | Delete user account & workspace data | Yes |
| `GET` | `/api/workspaces` | Get user research workspaces | Yes |
| `POST` | `/api/workspaces` | Create new research project | Yes |
| `POST` | `/api/documents/upload` | Upload PDF/TXT & trigger Gemini AI analysis | Yes |
| `POST` | `/api/ai/chat` | Contextual Q&A over documents with citations | Yes |
| `GET` | `/api/ai/graph/:workspaceId` | Fetch 2D Knowledge Mesh JSON | Yes |
| `POST` | `/api/reports/generate` | Generate Literature Matrix / Executive Brief | Yes |

---

## 🎥 Demo Video Guide (3–5 Minutes)

When recording your submission video:
1. **0:00 - 0:45**: Introduce the **Problem Statement** (information overload in literature review) and **NexusResearch AI Solution**.
2. **0:45 - 1:45**: Demonstrate **Account Authentication**, Eye password toggle, Account Deletion option, and creating a new **Research Workspace**.
3. **1:45 - 2:45**: Upload a **Research Paper (PDF/TXT)**. Show automatic **Gemini AI Summary, Key Findings, and Entity Extraction**.
4. **2:45 - 3:45**: Demonstrate **Gemini Research Assistant Chat** answering questions with **Grounded Citations** and exploring the **Interactive 2D Knowledge Graph**.
5. **3:45 - 4:30**: Generate an **Automated Literature Review Matrix Synthesis Report**. Highlight deployment architecture (Vercel + Render + Gemini API).

---

## 🌐 Submission Links Checklist

- **Problem Statement**: Included above & in application landing page.
- **Solution Description**: Detailed in README & live landing page.
- **GitHub Repository**: Public GitHub Repository link.
- **Deployed Frontend (Vercel)**: `https://nexus-research-ai.vercel.app`
- **Deployed Backend (Render)**: `https://nexus-research-backend.onrender.com`
- **Demo Video Link**: 3-5 Minute demonstration video link.
