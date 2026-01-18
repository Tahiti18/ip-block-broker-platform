
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class LeadBase(BaseModel):
    orgName: str
    cidr: str
    size: int
    score: int
    stage: str
    owner: str
    nextActionDate: Optional[datetime]
    scoreBreakdown: Any

class LeadUpdate(BaseModel):
    stage: Optional[str]
    nextActionDate: Optional[datetime]
    notes: Optional[str]

class LeadResponse(LeadBase):
    id: int
    lastUpdated: datetime
    class Config:
        from_attributes = True

class MetricsResponse(BaseModel):
    totalInventoryIps: int
    activeLeads: int
    conversionRate: float
    pipelineValueUsd: float
    urgentFollowups: List[LeadResponse]
    inventoryTrend30d: float
    routingShifts24h: int
    newCandidates24h: int

class JobRunResponse(BaseModel):
    id: int
    type: str
    status: str
    startedAt: datetime
    finishedAt: Optional[datetime]
    progress: int
    error: Optional[str]
    class Config:
        from_attributes = True

class JobLogResponse(BaseModel):
    line: str
    timestamp: datetime
    class Config:
        from_attributes = True

class HealthResponse(BaseModel):
    status: str
    database: str
    redis: str
    worker: str
