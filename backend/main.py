from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime, timedelta
from typing import List
import os
import logging

from . import models, schemas, database
from .worker import queue_job

# Set up logging for DevOps visibility
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("ipv4-os-api")

app = FastAPI(title="IPv4 Deal OS Backend")

# Initialize database
try:
    models.Base.metadata.create_all(bind=database.engine)
    logger.info("Database synchronized.")
except Exception as e:
    logger.error(f"DB Init Error: {e}")

@app.get("/api/health", response_model=schemas.HealthResponse)
def health(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Health DB Error: {e}")
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
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)
    yesterday = now - timedelta(hours=24)

    total_ips = db.query(func.sum(models.IPBlock.size)).scalar() or 0
    
    new_ips = db.query(func.sum(models.IPBlock.size)).filter(models.IPBlock.created_at >= thirty_days_ago).scalar() or 0
    old_ips = db.query(func.sum(models.IPBlock.size)).filter(models.IPBlock.created_at.between(sixty_days_ago, thirty_days_ago)).scalar() or 0
    
    trend = ((new_ips - old_ips) / old_ips * 100) if old_ips > 0 else 0.0
    active_leads = db.query(func.count(models.Lead.id)).scalar() or 0
    
    closed_won = db.query(func.count(models.Lead.id)).filter(models.Lead.stage == "Closed/Won").scalar() or 0
    total_leads = db.query(func.count(models.Lead.id)).scalar() or 0
    conv_rate = (closed_won / total_leads * 100) if total_leads > 0 else 0.0
    
    pipeline_val = float(db.query(func.sum(models.Lead.size)).filter(models.Lead.stage != "Closed/Lost").scalar() or 0) * 50.0

    urgent_leads = db.query(models.Lead).filter(models.Lead.next_action_date <= now).limit(5).all()
    urgent_followups = [{
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
    } for l in urgent_leads]

    shifts = db.query(func.count(models.RoutingSnapshot.id)).filter(models.RoutingSnapshot.timestamp >= yesterday).scalar() or 0
    new_cand = db.query(func.count(models.Lead.id)).filter(models.Lead.created_at >= yesterday).scalar() or 0

    return {
        "totalInventoryIps": total_ips,
        "activeLeads": active_leads,
        "conversionRate": conv_rate,
        "pipelineValueUsd": pipeline_val,
        "urgentFollowups": urgent_followups,
        "inventoryTrend30d": trend,
        "routingShifts24h": shifts,
        "newCandidates24h": new_cand
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
    if not l: raise HTTPException(404, "Not found")
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

@app.patch("/api/leads/{id}", response_model=schemas.LeadResponse)
def update_lead(id: int, updates: schemas.LeadUpdate, db: Session = Depends(database.get_db)):
    l = db.query(models.Lead).filter(models.Lead.id == id).first()
    if not l: raise HTTPException(404, "Not found")
    if updates.stage: l.stage = updates.stage
    if updates.nextActionDate: l.next_action_date = updates.nextActionDate
    db.commit()
    db.refresh(l)
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
    job = models.JobRun(type=job_type, status="queued", progress=0)
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
def get_jobs(db: Session = Depends(database.get_db)):
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

# --- Out-of-the-Box Static Asset Handling ---
BASE_DIR = os.getcwd()

# Catch-all for Frontend SPA
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Exclude API calls
    if full_path.startswith("api"):
        raise HTTPException(status_code=404)
    
    # Check if requested path is a real file (manifest, favicon, etc)
    local_path = os.path.join(BASE_DIR, full_path)
    if os.path.isfile(local_path):
        return FileResponse(local_path)
    
    # Default to index.html for all other routes (SPA behavior)
    index_file = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    return {"error": "Frontend assets not found. Check deployment build step."}