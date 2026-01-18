export enum LeadStage {
  FOUND = 'Found',
  VERIFIED = 'Verified',
  CONTACTED = 'Contacted',
  NDA = 'NDA',
  NEGOTIATING = 'Negotiating',
  CLOSED_WON = 'Closed/Won',
  CLOSED_LOST = 'Closed/Lost'
}

export enum JobStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  SUCCESS = 'succeeded',
  FAILED = 'failed'
}

export enum JobType {
  RDAP_INGESTION = 'RDAP Ingestion',
  ROUTING_SNAPSHOT = 'Routing Snapshot',
  REPUTATION_SCAN = 'Reputation Scan',
  COMPANY_ENRICHMENT = 'Company Enrichment',
  SCORING_RUN = 'Scoring Run',
  FULL_PIPELINE = 'Full Pipeline'
}

export interface Lead {
  id: string;
  orgName: string;
  cidr: string;
  size: number;
  score: number;
  stage: LeadStage;
  owner: string;
  nextActionDate: string;
  lastUpdated: string;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
  scoreBreakdown: {
    size: number;
    legacy: number;
    utilization: number;
    orgChange: number;
    reputation: number;
    transfer: number;
  };
}

export interface JobRun {
  id: string;
  type: JobType;
  status: JobStatus;
  startedAt: string;
  finishedAt?: string;
  progress: number;
  error?: string;
  logs: string[];
}

export interface Evidence {
  type: 'rdap' | 'bgp' | 'reputation' | 'company';
  timestamp: string;
  source: string;
  data: any;
}
