# IPv4 Deal Sourcing OS

A high-performance platform for IPv4 brokers to source, score, and manage legacy IP block deals using public telemetry and AI insights.

## 🚀 Production Deployment: Railway

This project is optimized for **Railway Nixpacks**. It is a single-service deployment that builds the React frontend and serves it via a FastAPI backend.

### Prerequisites
- A Railway account.
- `OPENROUTER_API_KEY` or `API_KEY` for AI intelligence features.
- A Postgres database (Railway's managed Postgres is recommended).

### One-Click Deploy Logic
1. Connect your repository to Railway.
2. Railway will detect the `nixpacks.toml` and `Procfile`.
3. It will install Node.js, build the frontend (`dist/`), install Python dependencies, and start the FastAPI server.

### Environment Variables
- `DATABASE_URL`: Your Postgres connection string.
- `API_KEY`: Google Gemini API Key for asset intelligence.
- `PORT`: Automatically handled by Railway.

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python 3.11), SQLAlchemy.
- **AI**: Google Gemini (via `@google/genai`).
- **Build System**: Nixpacks (No Docker required).