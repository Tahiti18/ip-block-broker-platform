
import { Lead, JobRun, JobType, LeadStage, JobStatus } from '../types';

const API_BASE = '/api';

export interface Metrics {
  totalInventoryIps: number;
  activeLeads: number;
  conversionRate: number;
  pipelineValueUsd: number;
  inventoryTrend30d: number;
  urgentFollowups: Lead[];
}

export interface SystemHealth {
  status: string;
  database: string;
  redis: string;
  worker: string;
}

const MOCK_LEADS: Lead[] = [
  {
    id: 'L-8821',
    orgName: 'Global Transit Corp',
    cidr: '12.0.0.0/8',
    size: 16777216,
    score: 94,
    stage: LeadStage.FOUND,
    owner: 'Admin',
    nextActionDate: new Date().toLocaleDateString(),
    lastUpdated: new Date().toISOString(),
    scoreBreakdown: {
      size: 95,
      legacy: 100,
      utilization: 15,
      orgChange: 80,
      reputation: 98,
      transfer: 90
    }
  },
  {
    id: 'L-4412',
    orgName: 'Legacy Systems Inc',
    cidr: '44.128.0.0/16',
    size: 65536,
    score: 78,
    stage: LeadStage.VERIFIED,
    owner: 'Admin',
    nextActionDate: new Date(Date.now() + 86400000).toLocaleDateString(),
    lastUpdated: new Date().toISOString(),
    scoreBreakdown: {
      size: 60,
      legacy: 100,
      utilization: 40,
      orgChange: 50,
      reputation: 95,
      transfer: 85
    }
  }
];

class ApiService {
  private isDemoMode = false;

  private async fetchJson(path: string, options?: RequestInit) {
    if (this.isDemoMode) return this.getMockResponse(path);

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        // If the backend returns 404 (File not found) or 500, trigger Demo Mode
        console.warn(`Backend responded with ${response.status}. Switching to Demo Mode.`);
        this.isDemoMode = true;
        return this.getMockResponse(path);
      }
      return response.json();
    } catch (error) {
      console.warn("API Connection failed. Falling back to Demo Mode.", error);
      this.isDemoMode = true;
      return this.getMockResponse(path);
    }
  }

  private getMockResponse(path: string): any {
    if (path === '/health') return { status: 'demo', database: 'connected', redis: 'connected', worker: 'active' };
    if (path === '/metrics') return {
      totalInventoryIps: 16842752,
      activeLeads: 2,
      conversionRate: 12.5,
      pipelineValueUsd: 842137600,
      inventoryTrend30d: 4.2,
      urgentFollowups: [MOCK_LEADS[0]]
    };
    if (path === '/leads') return MOCK_LEADS;
    if (path.startsWith('/leads/')) {
        const id = path.split('/').pop();
        return MOCK_LEADS.find(l => l.id === id) || MOCK_LEADS[0];
    }
    if (path === '/jobs/status') return [{
      id: 'DEMO-JOB',
      type: JobType.RDAP_INGESTION,
      status: JobStatus.SUCCESS,
      startedAt: new Date().toISOString(),
      progress: 100,
      logs: ['[System] Demo mode initialized', '[RDAP] Successfully parsed mock bootstrap', '[Info] UI ready for preview']
    }];
    return {};
  }

  async getHealth(): Promise<SystemHealth> {
    return this.fetchJson('/health');
  }

  async getMetrics(): Promise<Metrics> {
    return this.fetchJson('/metrics');
  }

  async getLeads(): Promise<Lead[]> {
    return this.fetchJson('/leads');
  }

  async getLead(id: string): Promise<Lead> {
    return this.fetchJson(`/leads/${id}`);
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    return this.fetchJson(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getJobs(): Promise<JobRun[]> {
    return this.fetchJson('/jobs/status');
  }

  async startJob(type: JobType): Promise<JobRun> {
    return this.fetchJson('/jobs/run', {
      method: 'POST',
      body: JSON.stringify({ job_type: type }),
    });
  }

  async seedDemoData(): Promise<void> {
    this.isDemoMode = true;
  }
}

export const api = new ApiService();
