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
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Settings</h1>
             <div className="space-y-6">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                   <h3 className="text-xl font-bold mb-4 text-slate-900">Core OS Engine</h3>
                   <p className="text-sm text-slate-500 leading-relaxed">
                     IPv4 Deal Sourcing OS v1.1.0 (Production Build). 
                     Running on high-performance infrastructure with native RIR telemetry ingestion.
                   </p>
                   <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Health: Stable</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">BUILD_ID: 99x_ALPHA</span>
                   </div>
                </div>
                
                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
                   <h3 className="text-lg font-bold mb-4">Broker API Configuration</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-xs font-medium text-slate-400">Gemini AI Tier</span>
                        <span className="text-xs font-bold text-blue-400">Enterprise Pro</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-xs font-medium text-slate-400">Grounding Status</span>
                        <span className="text-xs font-bold text-emerald-400">Search Enabled</span>
                      </div>
                   </div>
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
