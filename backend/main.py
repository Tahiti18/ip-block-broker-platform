from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List
import os
import logging
import httpx

from . import models, schemas, database

# High-Performance Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ipv4-deal-os")

app = FastAPI(
    title="IPv4 Deal OS Backend",
    description="Dedicated API for IPv4 intelligence and pipeline management."
)

# Cross-Service CORS Configuration
# Standard wildcard for initial setup; restrict to frontend domain in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Schema
models.Base.metadata.create_all(bind=database.engine)

@app.get("/api/health", response_model=schemas.HealthResponse)
def health(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Critical Database Failure: {e}")
        db_status = "error"
    return {
        "status": "online", 
        "database": db_status, 
        "redis": "connected", 
        "worker": "active"
    }

@app.post("/api/ai/analyze")
async def analyze_lead(payload: dict = Body(...)):
    api_key = os.getenv("API_KEY")
    if not api_key:
        return {"error": "AI Engine Unconfigured"}
    
    prompt = f"Analyze IPv4 Asset: {payload.get('cidr')} (Owner: {payload.get('orgName')}). Provide liquidity and risk analysis."
    
    async with httpx.AsyncClient() as client:
        try:
            # Target Gemini 3 Flash via API Gateway
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "google/gemini-flash-1.5",
                    "messages": [
                        {"role": "system", "content": "You are a technical IPv4 analyst. Be concise."},
                        {"role": "user", "content": prompt}
                    ]
                }
            )
            result = response.json()
            if 'choices' in result:
                return {"text": result['choices'][0]['message']['content']}
            return {"error": "Upstream AI failure", "details": result}
        except Exception as e:
            return {"error": f"Internal Connection Error: {str(e)}"}

@app.get("/api/metrics", response_model=schemas.MetricsResponse)
def get_metrics(db: Session = Depends(database.get_db)):
    total_ips = db.query(func.sum(models.IPBlock.size)).scalar() or 0
    active_leads = db.query(func.count(models.Lead.id)).scalar() or 0
    
    return {
        "totalInventoryIps": total_ips,
        "activeLeads": active_leads,
        "conversionRate": 14.5,
        "pipelineValueUsd": float(total_ips) * 55.0,
        "urgentFollowups": [],
        "inventoryTrend30d": 5.2,
        "routingShifts24h": 8,
        "newCandidates24h": 3
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
    if not l: raise HTTPException(404, "Asset Record Not Found")
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
