# IPv4 Deal Sourcing OS

A high-performance, iPad-first platform for IPv4 brokers. This system uses **NATIVE NIXPACKS** deployment. **Docker has been completely purged.**

## 🚀 How to fix "No start command was found" (Railway UI)

The error in your logs happens because Railway needs to know exactly how to start the Python/React services without a container. Use the following settings in the Railway Dashboard:

### 1. Backend Service (FastAPI)
- **Root Directory**: `backend/`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Variables**: `DATABASE_URL`, `API_KEY`, `REDIS_URL`.

### 2. Frontend Service (React)
- **Root Directory**: `/`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Variables**: `NEXT_PUBLIC_API_BASE_URL` (Point this to your Backend's domain).

## 🛠 Native Architecture Components
- **Procfile Support**: Included in both directories to automate start commands if UI is not configured.
- **Zero-Docker Engine**: Running directly on the host OS for maximum throughput.
- **Intelligence**: Gemini 3.0 Pro with real-time Google Search grounding.

## ⚠️ Manual Cleanup
If `Dockerfile` or `docker-compose.yml` still appear in your local file explorer, please delete them manually. This repository has overwritten them with empty placeholders to disable them in production.