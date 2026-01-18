import React, { useEffect, useState } from 'react';
import { Lead } from '../types';
import { api } from '../services/api';
import { ArrowLeft, Sparkles, Database, ShieldCheck, Zap } from 'lucide-react';

const LeadDetail: React.FC<{ leadId: string, onBack: () => void }> = ({ leadId, onBack }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [brief, setBrief] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLead(leadId).then(l => {
      setLead(l);
      setLoading(false);
      api.analyzeLead(l).then(setBrief);
    });
  }, [leadId]);

  if (loading || !lead) return <div className="p-20 text-center animate-pulse">Loading Asset Metadata...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-12">
      <button onClick={onBack} className="flex items-center text-slate-400 hover:text-slate-900 transition-colors font-bold text-sm">
        <ArrowLeft className="w-4 h-4 mr-2" />
        RETURN TO SOURCING
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">Legacy IPv4 Asset</span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">{lead.orgName}</h1>
            <p className="text-2xl font-mono text-blue-500 font-bold tracking-tighter">{lead.cidr}</p>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px]"></div>
            <div className="flex items-center space-x-3 mb-8">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="font-black text-sm uppercase tracking-[0.2em]">Brokerage AI Briefing</h3>
            </div>
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed font-medium">
              {brief || "AI Engine is synthesizing block history and risk deltas..."}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Deal Confidence</p>
            <div className="text-6xl font-black text-slate-900">{lead.score}</div>
            <div className="mt-6 flex justify-center">
               <div className="h-1.5 w-full max-w-[120px] bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lead.score}%` }}></div>
               </div>
            </div>
          </div>

          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/20">
             <Zap className="w-6 h-6 mb-6 text-emerald-200 fill-emerald-200" />
             <h4 className="text-xl font-black mb-2">Outreach Primed</h4>
             <p className="text-xs text-emerald-100 opacity-80 leading-relaxed mb-8">
               Blockchain provenance verified. This asset has no recorded transfers in 24 years.
             </p>
             <button className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-lg">
               Initialize Transfer Prep
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;