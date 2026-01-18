import React, { useEffect, useState } from 'react';
import { api, Metrics } from '../services/api';
import { Lead } from '../types';
import LeadTable from '../components/LeadTable';
import { TrendingUp, Target, Activity, AlertCircle, Database, PackageSearch, RefreshCw, Cpu, Globe } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl shadow-inner ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-[10px] font-black text-green-600 flex items-center bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
        <TrendingUp className="w-3 h-3 mr-1" />
        {change}
      </div>
    </div>
    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</h4>
    <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
  </div>
);

interface DashboardProps {
  onLeadSelect: (lead: Lead) => void;
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLeadSelect, onNavigate }) => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = () => {
    setIsSyncing(true);
    Promise.all([
      api.getMetrics(),
      api.getLeads()
    ]).then(([m, l]) => {
      setMetrics(m);
      setLeads(l || []);
      setLoading(false);
      setTimeout(() => setIsSyncing(false), 800);
    }).catch(err => {
      console.error("Failed to load dashboard data:", err);
      setLoading(false);
      setIsSyncing(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return (
    <div className="p-8 animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>)}
      </div>
      <div className="h-96 bg-slate-200 rounded-3xl"></div>
    </div>
  );

  if (!metrics || metrics.totalInventoryIps === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-10">
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl max-w-md relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-3xl rounded-full -mr-16 -mt-16"></div>
           <div className="bg-slate-100 p-6 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-6 relative z-10">
              <PackageSearch className="w-12 h-12 text-slate-400" />
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-4 relative z-10">No IP Inventory Detected</h2>
           <p className="text-slate-500 mb-10 text-balance leading-relaxed">The deal engine is primed but requires legacy block ingestion to generate sourcing leads.</p>
           <button 
             onClick={() => onNavigate('jobs')}
             className="w-full inline-block px-8 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 active:scale-95 transition-all relative z-10"
           >
              Initialize Ingestion Job
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto pb-24">
      {/* Header with Visual Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-6 sm:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Sourcing Protocol 1.4.1 Active</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Brokerage Command Center</h1>
        </div>
        
        <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={loadData}
            className="flex items-center space-x-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-xs shadow-lg active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Live Refresh'}</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Global Inventory" 
          value={`${((metrics.totalInventoryIps || 0) / 1000000).toFixed(1)}M IPs`} 
          change={`${(metrics.inventoryTrend30d || 0).toFixed(1)}%`} 
          icon={Globe} 
          color="bg-gradient-to-br from-blue-600 to-blue-700" 
        />
        <StatCard 
          title="High Confidence Leads" 
          value={metrics.activeLeads || 0} 
          change="+12% WoW" 
          icon={Target} 
          color="bg-gradient-to-br from-indigo-600 to-indigo-700" 
        />
        <StatCard 
          title="Broker Conversion" 
          value={`${(metrics.conversionRate || 0).toFixed(1)}%`} 
          change="Optimal" 
          icon={Activity} 
          color="bg-gradient-to-br from-emerald-600 to-emerald-700" 
        />
        <StatCard 
          title="Pipeline Est. Value" 
          value={`$${((metrics.pipelineValueUsd || 0) / 1000000).toFixed(1)}M`} 
          change="Bullish" 
          icon={Database} 
          color="bg-gradient-to-br from-amber-500 to-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Sourcing Pipeline
            </h3>
            <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">View Detailed Ledger</button>
          </div>
          <LeadTable leads={leads} onSelectLead={onLeadSelect} />
        </div>
        
        <div className="space-y-6">
          {/* Urgent Action Center */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-3xl group-hover:bg-amber-400/10 transition-colors duration-500"></div>
            <h3 className="font-black text-slate-900 mb-6 flex items-center text-lg">
              <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
              High Priority Tasks
            </h3>
            <div className="space-y-4">
              {metrics.urgentFollowups && metrics.urgentFollowups.length > 0 ? metrics.urgentFollowups.map(lead => (
                <div 
                  key={lead.id} 
                  onClick={() => onLeadSelect(lead)}
                  className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-amber-200 hover:bg-white hover:shadow-md cursor-pointer transition-all duration-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 truncate">{lead.orgName}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mr-2 uppercase">Action Required</span>
                      <p className="text-[10px] text-slate-400 font-mono tracking-tight">{lead.cidr}</p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-400 font-medium italic">Sourcing queue clear.</p>
                </div>
              )}
            </div>
          </div>

          {/* Engine Telemetry Visualization */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-600/15 blur-[80px]"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">System Telemetry</h4>
              </div>
              <div className="flex items-center space-x-3 mt-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute opacity-75"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full relative"></div>
                </div>
                <span className="text-lg font-black tracking-tight">Engine Operational</span>
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">
                Scanning global BGP table shifts and RDAP delta-logs. Real-time sourcing active.
              </p>
              
              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Deltas</p>
                  <p className="text-lg font-black text-white">{metrics.newCandidates24h}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">BGP Shifts</p>
                  <p className="text-lg font-black text-white">{metrics.routingShifts24h}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;