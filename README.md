# IPv4 Deal Sourcing OS

A high-performance, iPad-first platform for IPv4 brokers to source, score, and manage legacy IP block deals using public telemetry and AI insights.

## 🚀 Production Deployment (Manual UI Setup)

This system is designed as a multi-service architecture. Follow these steps in your cloud dashboard (e.g., Railway) to deploy manually. **Do not use any automated configuration files (Docker, Procfile, etc.).**

### 1. Service A: Backend API (FastAPI)
- **Source**: Connect this repository.
- **Root Directory**: `backend/`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `DATABASE_URL`: Your PostgreSQL connection string.
  - `API_KEY`: Your Google Gemini API Key.
  - `REDIS_URL`: Your Redis connection string (if using workers).

### 2. Service B: User Interface (Vite/React)
- **Source**: Connect this repository.
- **Root Directory**: `/` (Project Root)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_BASE_URL`: The public URL of Service A.
  - `API_KEY`: Your Google Gemini API Key.

### 3. Service C: Worker (Optional)
- **Source**: Connect this repository.
- **Root Directory**: `backend/`
- **Start Command**: `python -m rq worker`

## 🛠 Features
- **Tactical Dashboard**: Real-time telemetry on BGP and RDAP shifts.
- **AI Intelligence**: Gemini-powered market briefings with Google Search grounding.
- **iPad-First Design**: Optimized for touch with large tap targets and a sidebar-focused layout.
- **Compliance First**: Uses only public, compliant data sources for asset identification.