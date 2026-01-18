import { Lead, JobRun, JobType, LeadStage, JobStatus } from '../types';

/**
 * Resolves the API base URL for the backend service.
 * In a production multi-service environment (like Railway), this must point 
 * to the publicly accessible URL of the FastAPI service.
 */
const API_BASE = (import.meta as any).env?.NEXT_PUBLIC_API_BASE_URL || '';

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
      const url = `${API_BASE}${path}`;
      const response = await fetch(url, {
        ...options,
        headers: { 
          'Content-Type': 'application/json',
          ...options?.headers 
        },
      });

      if (!response.ok) {
        throw new Error(`API Connection Failed: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.warn(`[API] Remote host ${API_BASE} unreachable. Engaging local simulation.`, error);
      this.isDemoMode = true;
      return this.getMockResponse(path);
    }
  }

  private getMockResponse(path: string): any {
    if (path.includes('/health')) return { status: 'simulated', database: 'connected', redis: 'connected', worker: 'active' };
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
    if (path.includes('/leads/')) {
        if (path.split('/').length > 3) {
            return this.generateMockLead('DEMO-X', LeadStage.FOUND);
        }
        return [
            this.generateMockLead('1', LeadStage.FOUND, 'Legacy Research Corp', '12.0.0.0/8', 92, 'High'),
            this.generateMockLead('2', LeadStage.VERIFIED, 'Tech Global Systems', '44.128.0.0/16', 85, 'High'),
            this.generateMockLead('3', LeadStage.CONTACTED, 'Oceanic Networking', '103.45.0.0/22', 78, 'Medium'),
            this.generateMockLead('4', LeadStage.NDA, 'Vintage Cloud Solutions', '8.8.4.0/24', 98, 'High'),
            this.generateMockLead('5', LeadStage.NEGOTIATING, 'AeroSpace Telecom', '192.0.2.0/24', 88, 'Medium'),
        ];
    }
    return [];
  }

  private generateMockLead(id: string, stage: LeadStage, org = 'Mock Asset', cidr = '1.0.0.0/8', score = 50, priority: any = 'Medium'): Lead {
      return {
          id,
          orgName: org,
          cidr: cidr,
          size: 65536,
          score,
          stage,
          priority,
          owner: 'System',
          nextActionDate: new Date(Date.now() + 172800000).toISOString(),
          lastUpdated: new Date().toISOString(),
          scoreBreakdown: { size: 10, legacy: 10, utilization: 8, orgChange: 9, reputation: 10, transfer: 10 }
      };
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
    return res.text || res.error || "Analysis offline.";
  }
}

export const api = new ApiService();