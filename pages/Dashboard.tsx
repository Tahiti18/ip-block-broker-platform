import React, { useEffect, useState } from 'react';
import { api, Metrics } from '../services/api';
import { Lead } from '../types';
import LeadTable from '../components/LeadTable';
import { TrendingUp, Target, Activity, AlertCircle, Database, RefreshCw, Cpu, Globe, Zap, Layers } from 'lucide-react';

const TelemetryItem = ({ label, value, status }: { label: string, value: string | number, status: 'active' | 'idle' }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5">
    <div className="flex items-center space-x-3">
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-xs font-mono text-slate-200">{value}</span>
  </div>
);

const Dashboard: React.FC<{ onLeadSelect: (l: Lead) => void, onNavigate: (p: string) => void }> = ({ onLeadSelect, onNavigate }) => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMetrics().then(m => { setMetrics(m); setLoading(false); });
  }, []);

  if (loading || !metrics) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Zap className="w-12 h-12 text-blue-500 animate-pulse" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Command Center...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main Command View */}
      <div className="flex-1 p-6 lg:p-12 space-y-12 overflow-y-auto">
        <header className="flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Operational OS v1.1</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Sourcing Command</h1>
          </div>
          <button onClick={() => window.location.reload()} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-95">
            <RefreshCw className="w-5 h-5 text-slate-400" />
          </button>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors"></div>
            <div className="relative z-10">
              <Globe className="w-8 h-8 text-blue-600 mb-6" />
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Global Inventory</h4>
              <p className="text-4xl font-black text-slate-900">{(metrics.totalInventoryIps / 1000000).toFixed(1)}M <span className="text-xl text-slate-400">IPs</span></p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-100 transition-colors"></div>
             <div className="relative z-10">
                <Target className="w-8 h-8 text-emerald-600 mb-6" />
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Qualified Opportunities</h4>
                <p className="text-4xl font-black text-slate-900">{metrics.activeLeads}</p>
             </div>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900">Priority Sourcing Pipeline</h3>
            <span className="text-xs font-bold text-blue-600">View Global Table</span>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
             <LeadTable leads={[]} onSelectLead={onLeadSelect} />
             <div className="p-12 text-center text-slate-400">
               <Database className="w-8 h-8 mx-auto mb-4 opacity-20" />
               <p className="text-sm font-medium">Global table empty. Start an ingestion job in the <span className="text-blue-600 font-bold cursor-pointer" onClick={() => onNavigate('jobs')}>Jobs Center</span>.</p>
             </div>
          </div>
        </section>
      </div>

      {/* Telemetry Sidebar (iPad OS Style) */}
      <div className="w-full lg:w-80 bg-slate-900 p-8 flex flex-col space-y-12">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-white">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="font-black text-sm uppercase tracking-[0.2em]">Engine Telemetry</h3>
          </div>
          <div className="bg-white/5 rounded-3xl p-6 space-y-2">
             <TelemetryItem label="BGP Global Feed" value="SYNCED" status="active" />
             <TelemetryItem label="RDAP Authority" value="LOGGED" status="active" />
             <TelemetryItem label="Whois Delta" value="+3.2k" status="active" />
             <TelemetryItem label="Reputation" value="SCANNING" status="active" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <h4 className="text-xl font-black mb-4 relative z-10">System Status</h4>
          <div className="flex items-center space-x-2 relative z-10">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Brokerage Engine Online</span>
          </div>
          <p className="text-[10px] text-blue-200 mt-6 leading-relaxed opacity-70">
            Real-time monitoring of RIR transfer logs and legacy block advertisements. AI-scoring primed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;