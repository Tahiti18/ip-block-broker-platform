
# IPv4 Deal Sourcing OS

A high-performance platform for IPv4 brokers to source, score, and manage legacy IP block deals using only public, ToS-compliant telemetry.

## 🚀 One-Click Deploy: Railway

1.  **Create a New Project** on Railway.
2.  **Add Services**:
    *   **PostgreSQL**: Provision a managed database.
    *   **Redis**: Provision a managed instance for the job queue.
    *   **FastAPI Backend**: Connect your repo.
        *   Build Command: `pip install -r requirements.txt`
        *   Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
    *   **RQ Worker**: Same repo as backend.
        *   Start Command: `python backend/worker.py`
    *   **Next.js Frontend**: Connect your repo.
        *   Build Command: `npm run build`
        *   Start Command: `npm run start`
3.  **Environment Variables**:
    *   `DATABASE_URL`: (Railway auto-injects from PG)
    *   `REDIS_URL`: (Railway auto-injects from Redis)
    *   `API_KEY`: Your Gemini API Key for AI features.
    *   `JWT_SECRET`: A secure random string.
    *   `API_URL`: URL of your FastAPI service.

## 🚀 One-Click Deploy: Render

1.  **PostgreSQL**: Create a "New PostgreSQL".
2.  **Redis**: Create a "New Redis".
3.  **Backend (Web Service)**:
    *   Build Command: `pip install -r requirements.txt`
    *   Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4.  **Worker (Background Worker)**:
    *   Build Command: `pip install -r requirements.txt`
    *   Start Command: `python backend/worker.py`
5.  **Frontend (Static Site or Web Service)**:
    *   Build Command: `npm run build`
    *   Start Command: `npm run start`

## 🛠 Demo Mode
The application includes a built-in "Demo Mode" button in the Admin/Jobs panel. This seeds the database with curated sample data from `/seed/` files, allowing for an immediate "Zero-Key" experience.

## ⚖️ Security & Compliance
*   **Data Provenance**: Every IP block record includes a `raw_snapshot` field storing the original RDAP/BGP response with a timestamp.
*   **Legal Ingestion**: No scraping of private registries. Uses standard RDAP bootstrap (RFC 7480) and public BGP feeds.
*   **Rate Limiting**: Outbound calls are managed via the Worker queue with exponential backoff and persistent caching.
