import { Lead, JobRun, JobType, LeadStage, JobStatus } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.NEXT_PUBLIC_API_BASE_URL || '';

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
        headers: { 
          'Content-Type': 'application/json',
          ...options?.headers 
        },
      });
      if (!response.ok) throw new Error(`API Connection Failed: ${response.statusText}`);
      return response.json();
    } catch (error) {
      console.warn("API Node Unreachable - Activating Demo Simulation:", error);
      this.isDemoMode = true;
      return this.getMockResponse(path);
    }
  }

  private getMockResponse(path: string): any {
    if (path.includes('/health')) return { status: 'demo', database: 'connected', redis: 'connected', worker: 'active' };
    if (path.includes('/metrics')) return {
      totalInventoryIps: 16777216,
      activeLeads: 48,
      conversionRate: 15.2,
      pipelineValueUsd: 922746880,
      inventoryTrend30d: 4.8,
      urgentFollowups: [],
      routingShifts24h: 12,
      newCandidates24h: 5
    };
    if (path.includes('/leads/')) return {
        id: 'DEMO-88', orgName: 'Legacy Research Institute', cidr: '12.0.0.0/8', size: 16777216, score: 92, 
        stage: LeadStage.FOUND, owner: 'System', nextActionDate: '2025-01-25', 
        lastUpdated: new Date().toISOString(), scoreBreakdown: { size: 10, legacy: 10, utilization: 8, orgChange: 9, reputation: 10, transfer: 10 }
    };
    return [];
  }

  async getHealth(): Promise<SystemHealth> { return this.fetchJson('/api/health'); }
  async getMetrics(): Promise<Metrics> { return this.fetchJson('/api/metrics'); }
  async getLeads(): Promise<Lead[]> { return this.fetchJson('/api/leads'); }
  async getLead(id: string): Promise<Lead> { return this.fetchJson(`/api/leads/${id}`); }
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    return this.fetchJson(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  }
  async getJobs(): Promise<JobRun[]> { return this.fetchJson('/api/jobs'); }
  async startJob(type: JobType): Promise<JobRun> {
    return this.fetchJson('/api/jobs', { method: 'POST', body: JSON.stringify({ type }) });
  }
  async analyzeLead(lead: Lead): Promise<string> {
    const res = await this.fetchJson('/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ cidr: lead.cidr, orgName: lead.orgName })
    });
    return res.text || res.error || "Analysis engine offline.";
  }
}

export const api = new ApiService();
