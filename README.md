# IPv4 Deal Sourcing OS

A high-performance, iPad-first platform for IPv4 brokers to source, score, and manage legacy IP block deals using public telemetry and AI insights.

## 🚀 Native Production Deployment (Manual UI Setup)

This system is architected as a native multi-service application. **This project contains NO Dockerfiles, NO container configurations, and NO automated build scripts.** All deployment is handled manually through the Railway UI to ensure zero-overhead performance.

### 1. Service A: Backend API (FastAPI)
- **Repository**: Connect this GitHub repository.
- **Root Directory**: `backend/`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Required Environment Variables**:
  - `DATABASE_URL`: Your PostgreSQL connection string.
  - `API_KEY`: Your Google Gemini API Key.
  - `REDIS_URL`: Your Redis connection string (if using background workers).

### 2. Service B: User Interface (React/Vite)
- **Repository**: Connect this GitHub repository.
- **Root Directory**: `/` (The project root)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Required Environment Variables**:
  - `NEXT_PUBLIC_API_BASE_URL`: The public "Networking" URL assigned to your Backend Service (Service A).
  - `API_KEY`: Your Google Gemini API Key.

## 🛠 Features
- **Tactical Dashboard**: Real-time telemetry on BGP and RDAP shifts.
- **AI Intelligence**: Gemini-powered market briefings with Google Search grounding.
- **iPad-First Design**: Optimized for touch with large tap targets and a sidebar-focused layout.
- **Native Reliability**: Strictly manual configuration for maximum control and stability.