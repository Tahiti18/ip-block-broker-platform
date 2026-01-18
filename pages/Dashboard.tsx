import React, { useEffect, useState } from 'react';
import { api, Metrics } from '../services/api';
import { Lead } from '../types';
import LeadTable from '../components/LeadTable';
import { TrendingUp, Target, Activity, AlertCircle, Database, PackageSearch, RefreshCw, Cpu, Globe, Zap } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 transition-all duration-500 group">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-[1.5rem] shadow-lg ${color} group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-[11px] font-black text-emerald-600 flex items-center bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
        <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
        {change}
      </div>
    </div>
    <h4 className="text-slate-400 text-xs font-black uppercase tracking-[0.15em] mb-2">{title}</h4>
    <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
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
      setTimeout(() => setIsSyncing(false), 1000);
    }).catch(err => {
      console.error("Dashboard Sync Error:", err);
      setLoading(false);
      setIsSyncing(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return (
    <div className="p-10 space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1,2,3,4].map(i => <div key={i} className="h-44 bg-slate-200/50 animate-pulse rounded-[2.5rem]"></div>)}
      </div>
      <div className="h-[500px] bg-slate-200/50 animate-pulse rounded-[3rem]"></div>
    </div>
  );

  if (!metrics || metrics.totalInventoryIps === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] text-center p-12">
        <div className="bg-white p-16 rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_rgba(0,0,0,0.08)] max-w-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/5 blur-[100px] -mr-24 -mt-24"></div>
           <div className="bg-slate-50 p-8 rounded-[2.5rem] w-28 h-28 flex items-center justify-center mx-auto mb-10 relative z-10">
              <PackageSearch className="w-14 h-14 text-slate-300" />
           </div>
           <h2 className="text-3xl font-black text-slate-900 mb-6 relative z-10 tracking-tight">System Idle: No Assets Found</h2>
           <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed px-4">
             The global sourcing engine is synchronized but requires an initial ingestion job to identify legacy blocks.
           </p>
           <button 
             onClick={() => onNavigate('jobs')}
             className="w-full flex items-center justify-center space-x-3 px-10 py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl shadow-slate-900/20 active:scale-[0.98] hover:bg-slate-800 transition-all relative z-10"
           >
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Initialize Sourcing Protocol</span>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-14 space-y-14 max-w-[1600px] mx-auto pb-32">
      {/* Visual Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-40"></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full absolute"></div>
            </div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">Operational Phase 1.5.0</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Command Center</h1>
        </div>
        
        <div className="flex items-center bg-white/60 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-sm">
          <button 
            onClick={loadData}
            className="flex items-center space-x-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] hover:bg-slate-800 font-black text-sm shadow-xl active:scale-[0.97] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Live Sync'}</span>
          </button>
        </div>
      </div>

      {/* High-Performance KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Global Inventory" 
          value={`${((metrics.totalInventoryIps || 0) / 1000000).toFixed(1)}M IPs`} 
          change={`${(metrics.inventoryTrend30d || 0).toFixed(1)}%`} 
          icon={Globe} 
          color="bg-gradient-to-br from-blue-500 to-blue-700" 
        />
        <StatCard 
          title="Qualified Leads" 
          value={metrics.activeLeads || 0} 
          change="+14% WoW" 
          icon={Target} 
          color="bg-gradient-to-br from-indigo-500 to-indigo-700" 
        />
        <StatCard 
          title="Engine Yield" 
          value={`${(metrics.conversionRate || 0).toFixed(1)}%`} 
          change="Optimal" 
          icon={Activity} 
          color="bg-gradient-to-br from-emerald-500 to-emerald-700" 
        />
        <StatCard 
          title="Pipeline Value" 
          value={`$${((metrics.pipelineValueUsd || 0) / 1000000).toFixed(1)}M`} 
          change="Bullish" 
          icon={Database} 
          color="bg-gradient-to-br from-slate-700 to-slate-900" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Main Pipeline Table */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-slate-900 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-blue-600 fill-blue-600" />
              Real-time Sourcing Queue
            </h3>
            <button className="text-sm font-black text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-2xl transition-all border border-transparent hover:border-blue-100">
              Export Ledger
            </button>
          </div>
          <div className="rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] bg-white border border-slate-100 overflow-hidden">
             <LeadTable leads={leads} onSelectLead={onLeadSelect} />
          </div>
        </div>
        
        {/* Side Actions & Telemetry */}
        <div className="xl:col-span-4 space-y-10">
          {/* Priority Task Center */}
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-sm border border-slate-100 relative group overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/5 blur-[60px] group-hover:bg-amber-400/10 transition-colors duration-700"></div>
            <h3 className="font-black text-slate-900 mb-8 flex items-center text-xl tracking-tight">
              <AlertCircle className="w-6 h-6 mr-3 text-amber-500" />
              High Priority
            </h3>
            <div className="space-y-5">
              {metrics.urgentFollowups && metrics.urgentFollowups.length > 0 ? metrics.urgentFollowups.map(lead => (
                <div 
                  key={lead.id} 
                  onClick={() => onLeadSelect(lead)}
                  className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:border-blue-200 hover:bg-white hover:shadow-xl hover:-translate-x-1 cursor-pointer transition-all duration-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-black text-slate-900 truncate tracking-tight">{lead.orgName}</p>
                    <div className="flex items-center mt-1.5 space-x-3">
                      <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">Due Today</span>
                      <p className="text-[11px] text-slate-400 font-mono tracking-tighter">{lead.cidr}</p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-16 text-center">
                  <p className="text-sm text-slate-400 font-bold italic opacity-60">No pending alerts.</p>
                </div>
              )}
            </div>
          </div>

          {/* System Telemetry Console */}
          <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-600/20 blur-[100px] group-hover:bg-blue-600/30 transition-all duration-1000"></div>
            <div className="relative z-10 space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Cpu className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Engine Status</h4>
                </div>
                <div className="flex items-center space-x-4 mt-6">
                  <div className="relative flex items-center justify-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute opacity-40"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
                  </div>
                  <span className="text-2xl font-black tracking-tight">Scanning Active</span>
                </div>
                <p className="text-xs text-slate-400 mt-6 leading-relaxed font-bold opacity-80 uppercase tracking-wide">
                  Processing BGP Global Routing Deltas & RDAP Authority Logs...
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">24h Deltas</p>
                  <p className="text-3xl font-black text-white tracking-tighter">{metrics.newCandidates24h}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">Route Shifts</p>
                  <p className="text-3xl font-black text-white tracking-tighter">{metrics.routingShifts24h}</p>
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