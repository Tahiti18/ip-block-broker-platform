import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadDetail from './pages/LeadDetail';
import Jobs from './pages/Jobs';
import Pipeline from './pages/Pipeline';
import { Lead } from './types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const renderContent = () => {
    if (selectedLeadId) {
      return (
        <LeadDetail 
          leadId={selectedLeadId} 
          onBack={() => setSelectedLeadId(null)} 
        />
      );
    }

    switch (activePage) {
      case 'dashboard':
      case 'leads':
        return <Dashboard 
          onLeadSelect={(lead) => setSelectedLeadId(lead.id)} 
          onNavigate={(page) => setActivePage(page)}
        />;
      case 'pipeline':
        return <Pipeline onLeadSelect={(lead) => setSelectedLeadId(lead.id)} />;
      case 'jobs':
        return <Jobs />;
      case 'settings':
        return (
          <div className="p-10 max-w-2xl mx-auto space-y-8">
             <div className="flex items-center justify-between">
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Settings</h1>
               <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 border border-slate-200 uppercase tracking-widest">
                 Native Architecture
               </div>
             </div>
             
             <div className="space-y-6">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                   <h3 className="text-xl font-bold mb-4 text-slate-900">Core OS Engine</h3>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">
                     IPv4 Deal Sourcing OS v1.2.0 (Production). 
                     Operating on high-concurrency bare metal infrastructure.
                   </p>
                   <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status: Nominal</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300">SID: NATIVE_PROD_992</span>
                   </div>
                </div>
                
                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="text-lg font-bold">Intelligence Gateway</h3>
                     <span className="text-[9px] font-black text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20 uppercase tracking-widest">Direct API Mode</span>
                   </div>
                   <div className="space-y-5">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gemini Tier</span>
                        <span className="text-xs font-bold text-blue-400">Flash 2.5 Preview</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Search Grounding</span>
                        <span className="text-xs font-bold text-emerald-400">Enabled</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Telemetry Buffer</span>
                        <span className="text-xs font-bold text-slate-100">Synchronized</span>
                      </div>
                   </div>
                </div>
                
                <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">Performance Notice</h4>
                  <p className="text-xs text-blue-700/70 leading-relaxed">
                    System is utilizing native OS threading for BGP prefix calculation. Ensure backend service has at least 2GB of dedicated memory for large-scale /8 simulations.
                  </p>
                </div>
             </div>
          </div>
        );
      default:
        return <Dashboard 
          onLeadSelect={(lead) => setSelectedLeadId(lead.id)} 
          onNavigate={(page) => setActivePage(page)}
        />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={(page) => {
      setActivePage(page);
      setSelectedLeadId(null);
    }}>
      {renderContent()}
    </Layout>
  );
};

export default App;