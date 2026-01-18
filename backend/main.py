from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
import os

from . import models, schemas, database
from .worker import queue_job

app = FastAPI(title="IPv4 Deal OS Backend")

# Initialize database
models.Base.metadata.create_all(bind=database.engine)

@app.get("/api/health", response_model=schemas.HealthResponse)
def health(db: Session = Depends(database.get_db)):
    try:
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception:
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

@app.patch("/api/leads/{id}", response_model=schemas.LeadResponse)
def update_lead(id: int, updates: schemas.LeadUpdate, db: Session = Depends(database.get_db)):
    lead = db.query(models.Lead).filter(models.Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if updates.stage is not None:
        lead.stage = updates.stage
    if updates.nextActionDate is not None:
        lead.next_action_date = updates.nextActionDate
    if updates.notes is not None:
        lead.notes = updates.notes
    
    db.commit()
    db.refresh(lead)
    return {
        "id": str(lead.id),
        "orgName": lead.org_name,
        "cidr": lead.cidr,
        "size": lead.size,
        "score": lead.score,
        "stage": lead.stage,
        "owner": lead.owner,
        "nextActionDate": lead.next_action_date,
        "scoreBreakdown": lead.score_breakdown,
        "lastUpdated": lead.last_updated
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

# Robust static file serving from the project root
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
app.mount("/", StaticFiles(directory=ROOT_DIR, html=True), name="static")
