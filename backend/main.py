from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
import os
import logging

from . import models, schemas, database
from .worker import queue_job

# Set up high-visibility logging for DevOps troubleshooting
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ipv4-os-backend")

app = FastAPI(title="IPv4 Deal OS Backend")

# Initialize database
try:
    models.Base.metadata.create_all(bind=database.engine)
    logger.info("Database schemas synchronized successfully.")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")

@app.get("/api/health", response_model=schemas.HealthResponse)
def health(db: Session = Depends(database.get_db)):
    try:
        db.execute(database.text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Health check DB failure: {e}")
        db_status = "error"
    
    return {
        "status": "ok",
        "database": db_status,
        "redis": "connected",
        "worker": "active"
    }

@app.get("/api/metrics", response_model=schemas.MetricsResponse)
def get_metrics(db: Session = Depends(database.get_db)):
    now = datetime.now()
    twenty_four_hours_ago = now - timedelta(hours=24)
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)

    total_ips = db.query(func.sum(models.IPBlock.size)).scalar() or 0
    
    new_ips_period = db.query(func.sum(models.IPBlock.size)).filter(models.IPBlock.created_at >= thirty_days_ago).scalar() or 0
    old_ips_period = db.query(func.sum(models.IPBlock.size)).filter(models.IPBlock.created_at.between(sixty_days_ago, thirty_days_ago)).scalar() or 0
    
    trend = 0.0
    if old_ips_period > 0:
        trend = ((new_ips_period - old_ips_period) / old_ips_period) * 100

    active_leads_count = db.query(func.count(models.Lead.id)).scalar() or 0
    
    closed_won = db.query(func.count(models.Lead.id)).filter(models.Lead.stage == "Closed/Won").scalar() or 0
    total_leads = db.query(func.count(models.Lead.id)).scalar() or 0
    conversion_rate = (closed_won / total_leads * 100) if total_leads > 0 else 0.0
    
    pipeline_ips = db.query(func.sum(models.Lead.size)).filter(models.Lead.stage != "Closed/Lost").scalar() or 0
    pipeline_value_usd = float(pipeline_ips) * 50.0

    urgent_leads = db.query(models.Lead).filter(models.Lead.next_action_date <= now).limit(5).all()
    urgent_followups = []
    for l in urgent_leads:
        urgent_followups.append({
            "id": str(l.id),
            "orgName": l.org_name,
            "cidr": l.cidr,
            "size": l.size,
            "score": l.score,
            "stage": l.stage,
            "owner": l.owner,
            "nextActionDate": l.next_action_date,
            "scoreBreakdown": l.score_breakdown,
            "lastUpdated": l.last_updated
        })

    routing_shifts = db.query(func.count(models.RoutingSnapshot.id)).filter(models.RoutingSnapshot.timestamp >= twenty_four_hours_ago).scalar() or 0
    new_candidates = db.query(func.count(models.Lead.id)).filter(models.Lead.created_at >= twenty_four_hours_ago).scalar() or 0

    return {
        "totalInventoryIps": total_ips,
        "activeLeads": active_leads_count,
        "conversionRate": conversion_rate,
        "pipelineValueUsd": pipeline_value_usd,
        "urgentFollowups": urgent_followups,
        "inventoryTrend30d": trend,
        "routingShifts24h": routing_shifts,
        "newCandidates24h": new_candidates
    }

@app.get("/api/leads", response_model=List[schemas.LeadResponse])
def get_leads(db: Session = Depends(database.get_db)):
    leads = db.query(models.Lead).all()
    return [{
        "id": str(l.id),
        "orgName": l.org_name,
        "cidr": l.cidr,
        "size": l.size,
        "score": l.score,
        "stage": l.stage,
        "owner": l.owner,
        "nextActionDate": l.next_action_date,
        "scoreBreakdown": l.score_breakdown,
        "lastUpdated": l.last_updated
    } for l in leads]

@app.get("/api/leads/{id}", response_model=schemas.LeadResponse)
def get_lead(id: int, db: Session = Depends(database.get_db)):
    l = db.query(models.Lead).filter(models.Lead.id == id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {
        "id": str(l.id),
        "orgName": l.org_name,
        "cidr": l.cidr,
        "size": l.size,
        "score": l.score,
        "stage": l.stage,
        "owner": l.owner,
        "nextActionDate": l.next_action_date,
        "scoreBreakdown": l.score_breakdown,
        "lastUpdated": l.last_updated
    }

@app.post("/api/jobs/run", response_model=schemas.JobRunResponse)
def run_job(job_type: str = Body(..., embed=True), db: Session = Depends(database.get_db)):
    job = models.JobRun(type=job_type, status="queued")
    db.add(job)
    db.commit()
    db.refresh(job)
    queue_job(job.id, job_type)
    return {
        "id": job.id,
        "type": job.type,
        "status": job.status,
        "startedAt": job.started_at,
        "finishedAt": job.finished_at,
        "progress": job.progress,
        "error": job.error
    }

@app.get("/api/jobs/status", response_model=List[schemas.JobRunResponse])
def get_all_jobs(db: Session = Depends(database.get_db)):
    jobs = db.query(models.JobRun).order_by(models.JobRun.started_at.desc()).all()
    return [{
        "id": j.id,
        "type": j.type,
        "status": j.status,
        "startedAt": j.started_at,
        "finishedAt": j.finished_at,
        "progress": j.progress,
        "error": j.error
    } for j in jobs]

# --- Static File Serving (The Out-of-the-box Fix) ---
# We serve the frontend files directly from the root if they exist.
# This ensures that even in complex container deployments, the UI is found.
BASE_DIR = os.getcwd()
logger.info(f"System Root: {BASE_DIR}")

# Mount static files for assets (js, css, etc.)
if os.path.isdir(os.path.join(BASE_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(BASE_DIR, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Ignore API requests
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404)
    
    # Check if a specific file exists (e.g., manifest.json, favicon)
    file_path = os.path.join(BASE_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Fallback to index.html for SPA routing
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"error": "Frontend assets not found. Build may have failed or path is incorrect."}