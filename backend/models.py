
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.sql import func
from .database import Base

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class IPBlock(Base):
    __tablename__ = "ip_blocks"
    id = Column(Integer, primary_key=True, index=True)
    cidr = Column(String, unique=True, index=True)
    size = Column(Integer)
    org_id = Column(Integer, ForeignKey("organizations.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    org_name = Column(String)
    cidr = Column(String)
    size = Column(Integer)
    score = Column(Integer)
    stage = Column(String, default="Found")
    owner = Column(String)
    next_action_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    score_breakdown = Column(JSON)
    notes = Column(Text)

class RoutingSnapshot(Base):
    __tablename__ = "routing_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    cidr = Column(String, index=True)
    raw_data = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class JobRun(Base):
    __tablename__ = "job_runs"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    status = Column(String)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True))
    progress = Column(Integer, default=0)
    error = Column(String)

class JobLog(Base):
    __tablename__ = "job_logs"
    id = Column(Integer, primary_key=True, index=True)
    job_run_id = Column(Integer, ForeignKey("job_runs.id"))
    line = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
