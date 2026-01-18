# IPv4 Deal Sourcing OS

A high-performance platform for IPv4 brokers to source, score, and manage legacy IP block deals using public telemetry and AI insights.

## 🚀 Production Deployment: Railway (Manual UI Configuration)

This project is architected as a multi-service system. Follow these precise steps in the Railway Dashboard for deployment. 

### 1. Project Initialization
Connect your GitHub repository to a new Railway project. Create two separate services from this single repository.

### 2. Service A: API Backend (FastAPI)
- **Root Directory**: `backend/`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Required Environment Variables**:
  - `DATABASE_URL`: Your PostgreSQL connection string.
  - `API_KEY`: Your Google Gemini API Key.
  - `REDIS_URL`: Your Redis connection string.

### 3. Service B: User Interface (React/Vite)
- **Root Directory**: `/` (Project Root)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Required Environment Variables**:
  - `NEXT_PUBLIC_API_BASE_URL`: The public URL of your Backend Service.
  - `API_KEY`: Your Google Gemini API Key.

### 4. Service C: Task Worker (Optional)
- **Root Directory**: `backend/`
- **Start Command**: `python -m rq worker`
- **Environment Variables**: Same as Service A.

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Vite.
- **Backend**: FastAPI (Python 3.11), SQLAlchemy (PostgreSQL).
- **AI**: Google Gemini (via `@google/genai` and direct API).
- **Aesthetics**: High-fidelity, iPad-first interface designed for tactical brokerage operations.