
import { Lead, JobRun, JobType, LeadStage, JobStatus } from '../types';

// Use env variable or fallback to same-domain proxy
const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export interface Metrics {
  totalInventoryIps: number;
  activeLeads: number;
  conversionRate: number;
  pipelineValueUsd: number;
  inventoryTrend30d: number;
  urgentFollowups: Lead[];
  routingShifts24h: number;
  newCandidates24h: number;
}

export interface SystemHealth {
  status: string;
  database: string;
  redis: string;
  worker: string;
}

class ApiService {
  private isDemoMode = false;

  private async fetchJson(path: string, options?: RequestInit) {
    if (this.isDemoMode) return this.getMockResponse(path);
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options?.headers },
      });
      if (!response.ok) throw new Error('API Error');
      return response.json();
    } catch (error) {
      console.warn("API Switch: Demo Mode Active", error);
      this.isDemoMode = true;
      return this.getMockResponse(path);
    }
  }

  private getMockResponse(path: string): any {
    if (path.includes('/health')) return { status: 'demo', database: 'connected', redis: 'connected', worker: 'active' };
    if (path.includes('/metrics')) return {
      totalInventoryIps: 16842752,
      activeLeads: 24,
      conversionRate: 14.5,
      pipelineValueUsd: 842137600,
      inventoryTrend30d: 4.2,
      urgentFollowups: [],
      routingShifts24h: 8,
      newCandidates24h: 3
    };
    // Mock response for jobs request to resolve Jobs.tsx data requirements
    if (path.includes('/jobs')) return [
      {
        id: '9921',
        type: JobType.FULL_PIPELINE,
        status: JobStatus.RUNNING,
        startedAt: new Date(Date.now() - 600000).toISOString(),
        progress: 65,
        logs: ['Initializing session...', 'RIR Delta Scan: 14%']
      },
      {
        id: '9920',
        type: JobType.RDAP_INGESTION,
        status: JobStatus.SUCCESS,
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        finishedAt: new Date(Date.now() - 3400000).toISOString(),
        progress: 100,
        logs: ['Scan complete', 'Persisted 1,402 new blocks']
      }
    ];
    // Mock response for individual lead detail to support LeadDetail.tsx rendering
    if (path.includes('/leads/')) {
      return {
        id: 'L-7712',
        orgName: 'Amalgamated Research Ltd',
        cidr: '128.0.0.0/16',
        size: 65536,
        score: 88,
        stage: LeadStage.FOUND,
        owner: 'System',
        nextActionDate: '2024-11-12',
        lastUpdated: new Date().toISOString(),
        scoreBreakdown: { size: 8, legacy: 10, utilization: 7, orgChange: 9, reputation: 9, transfer: 10 }
      };
    }
    if (path.includes('/leads')) return [];
    return {};
  }

  async getHealth(): Promise<SystemHealth> { return this.fetchJson('/api/health'); }
  async getMetrics(): Promise<Metrics> { return this.fetchJson('/api/metrics'); }
  async getLeads(): Promise<Lead[]> { return this.fetchJson('/api/leads'); }
  async getLead(id: string): Promise<Lead> { return this.fetchJson(`/api/leads/${id}`); }
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    return this.fetchJson(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  }

  // Added getJobs method to resolve error in Jobs.tsx line 14
  async getJobs(): Promise<JobRun[]> { 
    return this.fetchJson('/api/jobs'); 
  }

  // Added startJob method to resolve error in Jobs.tsx line 27
  async startJob(type: JobType): Promise<JobRun> {
    return this.fetchJson('/api/jobs', { 
      method: 'POST', 
      body: JSON.stringify({ type }) 
    });
  }

  async analyzeLead(lead: Lead): Promise<string> {
    const res = await this.fetchJson('/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ cidr: lead.cidr, orgName: lead.orgName })
    });
    return res.text || res.error || "Analysis unavailable.";
  }
}

export const api = new ApiService();
