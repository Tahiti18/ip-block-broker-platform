
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadDetail from './pages/LeadDetail';
import Jobs from './pages/Jobs';
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
      case 'jobs':
        return <Jobs />;
      case 'pipeline':
        return (
          <div className="flex items-center justify-center h-full text-slate-400 p-10">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Pipeline Kanban</h2>
              <p>The Kanban view is optimized for landscape desktop/iPad Pro usage. Switch orientations or check the Dashboard leads for mobile/portrait management.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-10 max-w-2xl mx-auto space-y-8">
             <h1 className="text-2xl font-black text-slate-900">System Settings</h1>
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold mb-2 text-slate-800">System Information</h3>
                   <p className="text-sm text-slate-600">IPv4 Deal OS v1.0.4. All systems operational.</p>
                   <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400 font-mono">
                      <span>Engine: Active</span>
                      <span>Auth: Environment Variable</span>
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
