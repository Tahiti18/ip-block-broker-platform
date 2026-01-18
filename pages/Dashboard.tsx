
import React, { useEffect, useState } from 'react';
import { api, Metrics } from '../services/api';
import { Lead } from '../types';
import LeadTable from '../components/LeadTable';
import { TrendingUp, Target, Activity, AlertCircle, Database, PackageSearch } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-sm font-bold text-green-600 flex items-center">
        {change}
      </div>
    </div>
    <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
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

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getMetrics(),
      api.getLeads()
    ]).then(([m, l]) => {
      if (isMounted) {
        setMetrics(m);
        setLeads(l || []);
        setLoading(false);
      }
    }).catch(err => {
      console.error("Failed to load dashboard data:", err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  if (loading) return (
    <div className="p-8 animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
      </div>
      <div className="h-96 bg-slate-200 rounded-2xl"></div>
    </div>
  );

  if (!metrics || metrics.totalInventoryIps === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-10">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl max-w-md">
           <div className="bg-slate-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <PackageSearch className="w-10 h-10 text-slate-400" />
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-2">No data ingested yet</h2>
           <p className="text-slate-500 mb-8">Your IPv4 OS is empty. Run an ingestion job from the Jobs Center to start sourcing legacy blocks.</p>
           <button 
             onClick={() => onNavigate('jobs')}
             className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
           >
              Go to Jobs Center
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Brokerage Command Center</h1>
          <p className="text-slate-500">Real-time legacy IPv4 telemetry and sourcing pipeline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Inventory" 
          value={`${((metrics.totalInventoryIps || 0) / 1000000).toFixed(1)}M IPs`} 
          change={`${(metrics.inventoryTrend30d || 0).toFixed(1)}%`} 
          icon={Database} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Active Leads" 
          value={metrics.activeLeads || 0} 
          change="Real-time" 
          icon={Target} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${(metrics.conversionRate || 0).toFixed(1)}%`} 
          change="Historical" 
          icon={TrendingUp} 
          color="bg-green-600" 
        />
        <StatCard 
          title="Pipeline Value" 
          value={`$${((metrics.pipelineValueUsd || 0) / 1000000).toFixed(1)}M`} 
          change="Est. Market" 
          icon={Activity} 
          color="bg-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LeadTable leads={leads} onSelectLead={onLeadSelect} />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
              Urgent Follow-ups
            </h3>
            <div className="space-y-4">
              {metrics.urgentFollowups && metrics.urgentFollowups.length > 0 ? metrics.urgentFollowups.map(lead => (
                <div key={lead.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{lead.orgName}</p>
                    <p className="text-xs text-slate-500">{lead.nextActionDate || 'TBD'}</p>
                  </div>
                  <button onClick={() => onLeadSelect(lead)} className="text-xs font-bold text-blue-600 hover:underline shrink-0 ml-2">View</button>
                </div>
              )) : <p className="text-sm text-slate-400 italic">No pending follow-ups</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
