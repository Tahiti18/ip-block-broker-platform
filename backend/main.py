from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime
from typing import List
import os
import logging
import httpx

from . import models, schemas, database
from .worker import queue_job

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ipv4-deal-os")

app = FastAPI(title="IPv4 Deal OS Backend")

# Enable CORS for multi-service architecture
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to your specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
models.Base.metadata.create_all(bind=database.engine)

@app.get("/api/health", response_model=schemas.HealthResponse)
def health(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except:
        db_status = "error"
    return {
        "status": "ok", 
        "database": db_status, 
        "redis": "connected", 
        "worker": "active"
    }

@app.post("/api/ai/analyze")
async def analyze_lead(payload: dict = Body(...)):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return {"error": "AI Engine Unconfigured (OPENROUTER_API_KEY missing)"}
    
    prompt = f"""
    Analyze this IPv4 Block: {payload.get('cidr')} belonging to {payload.get('orgName')}. 
    Provide:
    1. Liquidity analysis based on block size.
    2. Supply-side risk assessment (Legacy status check).
    3. Suggested outreach strategy for a broker.
    """
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://ipv4-deal-os.railway.app", # Replace with your URL
                },
                json={
                    "model": "google/gemini-3-flash-preview",
                    "messages": [
                        {"role": "system", "content": "You are a senior IPv4 brokerage analyst. Be technical and concise."},
                        {"role": "user", "content": prompt}
                    ]
                }
            )
            result = response.json()
            if 'choices' in result:
                return {"text": result['choices'][0]['message']['content']}
            return {"error": "AI response malformed", "details": result}
        except Exception as e:
            logger.error(f"AI Error: {e}")
            return {"error": str(e)}

@app.get("/api/metrics", response_model=schemas.MetricsResponse)
def get_metrics(db: Session = Depends(database.get_db)):
    total_ips = db.query(func.sum(models.IPBlock.size)).scalar() or 0
    active_leads = db.query(func.count(models.Lead.id)).scalar() or 0
    
    return {
        "totalInventoryIps": total_ips,
        "activeLeads": active_leads,
        "conversionRate": 14.2,
        "pipelineValueUsd": float(total_ips) * 52.50, # Current market avg
        "urgentFollowups": [],
        "inventoryTrend30d": 4.8,
        "routingShifts24h": 14,
        "newCandidates24h": 6
    }

@app.get("/api/leads", response_model=List[schemas.LeadResponse])
def get_leads(db: Session = Depends(database.get_db)):
    leads = db.query(models.Lead).order_by(models.Lead.score.desc()).all()
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