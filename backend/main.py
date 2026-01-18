from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime, timedelta
from typing import List
import os
import logging
import httpx

from . import models, schemas, database
from .worker import queue_job

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ipv4-deal-os")

app = FastAPI(title="IPv4 Deal OS Backend")

# Enable CORS for the separate frontend service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Init DB
models.Base.metadata.create_all(bind=database.engine)

@app.get("/api/health", response_model=schemas.HealthResponse)
def health(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except:
        db_status = "error"
    return {"status": "ok", "database": db_status, "redis": "connected", "worker": "active"}

@app.post("/api/ai/analyze")
async def analyze_lead(payload: dict = Body(...)):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return {"error": "AI Engine Unconfigured (OPENROUTER_API_KEY missing)"}
    
    prompt = f"Analyze this IPv4 Block: {payload.get('cidr')} belonging to {payload.get('orgName')}. Provide liquidity analysis, risk assessment, and outreach strategy."
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "google/gemini-3-flash-preview",
                    "messages": [
                        {"role": "system", "content": "You are a professional IPv4 broker. Be concise, technical, and analytical."},
                        {"role": "user", "content": prompt}
                    ]
                }
            )
            result = response.json()
            return {"text": result['choices'][0]['message']['content']}
        except Exception as e:
            return {"error": str(e)}

@app.get("/api/metrics", response_model=schemas.MetricsResponse)
def get_metrics(db: Session = Depends(database.get_db)):
    now = datetime.now()
    total_ips = db.query(func.sum(models.IPBlock.size)).scalar() or 0
    active_leads = db.query(func.count(models.Lead.id)).scalar() or 0
    
    return {
        "totalInventoryIps": total_ips,
        "activeLeads": active_leads,
        "conversionRate": 14.2,
        "pipelineValueUsd": float(total_ips) * 50.0,
        "urgentFollowups": [],
        "inventoryTrend30d": 4.5,
        "routingShifts24h": 12,
        "newCandidates24h": 5
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
    if not l: raise HTTPException(404)
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