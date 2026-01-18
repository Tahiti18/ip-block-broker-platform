import React, { useEffect, useState } from 'react';
import { api, Metrics } from '../services/api';
import { Lead } from '../types';
import LeadTable from '../components/LeadTable';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  Database, 
  RefreshCw, 
  Cpu, 
  Globe, 
  Zap, 
  Layers 
} from 'lucide-react';

const TelemetryItem = ({ label, value, status }: { label: string, value: string | number, status: 'active' | 'idle' }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
    <div className="flex items-center space-x-3">
      <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-600'}`}></div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
    </div>
    <span className="text-xs font-mono font-bold text-slate-100">{value}</span>
  </div>
);

const Dashboard: React.FC<{ onLeadSelect: (l: Lead) => void, onNavigate: (p: string) => void }> = ({ onLeadSelect, onNavigate }) => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMetrics().then(m => { 
      setMetrics(m); 
      setLoading(false); 
    });
  }, []);

  if (loading || !metrics) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <Zap className="w-16 h-16 text-blue-500 animate-pulse" />
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl animate-pulse"></div>
        </div>
        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Syncing Command Center</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen bg-[#F8FAFC]">
      {/* Main Terminal View */}
      <div className="flex-1 p-8 lg:p-14 space-y-14 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Operational OS v1.2</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tight">Sourcing Command</h1>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="group flex items-center space-x-3 px-8 py-4 bg-white rounded-[1.5rem] shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:rotate-180 transition-all duration-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Global Refresh</span>
          </button>
        </header>

        {/* Tactical KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_40px_80px_rgba(0,0,0,0.04)] transition-all">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 blur-[100px] rounded-full -mr-24 -mt-24 group-hover:bg-blue-100 transition-colors"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Asset Pool</h4>
                   <div className="flex items-center space-x-2">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Feed Active</span>
                   </div>
                </div>
              </div>
              <p className="text-5xl font-black text-slate-900 tracking-tighter">
                {(metrics.totalInventoryIps / 1000000).toFixed(1)}M <span className="text-2xl text-slate-300 font-bold ml-1 uppercase">IPv4 Assets</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_40px_80px_rgba(0,0,0,0.04)] transition-all">
             <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/50 blur-[100px] rounded-full -mr-24 -mt-24 group-hover:bg-emerald-100 transition-colors"></div>
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-4 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualified Targets</h4>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">+12% vs last sync</span>
                    </div>
                  </div>
                </div>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">
                  {metrics.activeLeads} <span className="text-2xl text-slate-300 font-bold ml-1 uppercase">Identified</span>
                </p>
             </div>
          </div>
        </div>

        {/* Pipeline Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-slate-900 flex items-center tracking-tight">
              <Zap className="w-6 h-6 mr-4 text-blue-600 fill-blue-600" />
              Sourcing Pipeline Deltas
            </h3>
            <button onClick={() => onNavigate('leads')} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b-2 border-blue-600/20 hover:border-blue-600 transition-all">
              View Global Table
            </button>
          </div>
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
             <div className="p-16 text-center">
               <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                 <Database className="w-10 h-10 text-slate-200" />
               </div>
               <h4 className="text-xl font-black text-slate-900 mb-2">Ingestion Buffer Empty</h4>
               <p className="text-slate-400 max-w-sm mx-auto font-medium text-sm leading-relaxed mb-10">
                 The sourcing engine is synchronized but requires a targeting job to identify legacy blocks.
               </p>
               <button 
                 onClick={() => onNavigate('jobs')}
                 className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
               >
                 Start Ingestion Job
               </button>
             </div>
          </div>
        </section>
      </div>

      {/* iPadOS Style Telemetry Sidebar */}
      <div className="w-full lg:w-[420px] bg-slate-900 p-10 lg:p-14 flex flex-col space-y-12 shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto custom-scrollbar">
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-white">
              <div className="p-3 bg-blue-500/20 rounded-2xl">
                <Cpu className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-[0.25em]">Telemetry Engine</h3>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest">
              Stable
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5 space-y-2">
             <TelemetryItem label="BGP Global Feed" value="SYNCHRONIZED" status="active" />
             <TelemetryItem label="RDAP Authority" value="ENCRYPTED" status="active" />
             <TelemetryItem label="Whois Legacy Delta" value="+4.2k Blocks" status="active" />
             <TelemetryItem label="Network Reputation" value="CLEAN" status="active" />
             <TelemetryItem label="M&A Resolver" value="WAITING" status="idle" />
          </div>
        </div>

        {/* Global Stats Block */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-blue-900/40">
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 blur-[60px] group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative z-10 space-y-8">
            <div>
              <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em] mb-4">Pipeline Valuation</h4>
              <p className="text-4xl font-black tracking-tight leading-none">${(metrics.pipelineValueUsd / 1000000).toFixed(1)}M USD</p>
            </div>
            <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
              <div>
                <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Deltas (24h)</p>
                <p className="text-2xl font-black">+{metrics.newCandidates24h}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Route Shifts</p>
                <p className="text-2xl font-black">{metrics.routingShifts24h}</p>
              </div>
            </div>
            <p className="text-[10px] text-blue-100/60 leading-relaxed font-bold italic tracking-wide">
              Market valuation updated via verified brokerage index. Legacy blocks prioritized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;