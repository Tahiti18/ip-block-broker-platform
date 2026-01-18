# IPv4 Deal Sourcing OS

A high-performance platform for IPv4 brokers to source, score, and manage legacy IP block deals using public telemetry and AI insights.

## 🚀 Production Deployment: Railway (Manual UI Entry)

This project is deployed as two separate services from the same GitHub repository. All configuration must be performed manually within the Railway dashboard.

### SERVICE A: BACKEND (FastAPI)
- **Root Directory**: `backend/`
- **Build Settings**: Railway automatically detects `requirements.txt`.
- **Custom Start Command** (Enter in Railway UI):
  `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `DATABASE_URL`: Your Postgres connection string.
  - `API_KEY`: Google Gemini API Key.

### SERVICE B: FRONTEND (React/Vite)
- **Root Directory**: `/` (Project Root)
- **Build Command** (Enter in Railway UI):
  `npm install && npm run build`
- **Custom Start Command** (Enter in Railway UI):
  `npm run start`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_BASE_URL`: The URL of your Backend Service (Service A).
  - `API_KEY`: Google Gemini API Key.

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python 3.11), SQLAlchemy.
- **AI**: Google Gemini (via `@google/genai`).