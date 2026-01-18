import React, { useEffect, useState } from 'react';
import { Lead } from '../types';
import { api } from '../services/api';
import { gemini } from '../services/geminiService';
import { ArrowLeft, Sparkles, Zap, ExternalLink, Globe } from 'lucide-react';

const LeadDetail: React.FC<{ leadId: string, onBack: () => void }> = ({ leadId, onBack }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [brief, setBrief] = useState<{ text: string, sources: any[] }>({ text: '', sources: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const l = await api.getLead(leadId);
        if (!isMounted) return;
        setLead(l);
        setLoading(false);
        
        const briefing = await gemini.generateLeadBrief(l);
        if (isMounted) setBrief(briefing);
      } catch (err) {
        console.error("Asset Intel Error:", err);
        if (isMounted) {
          setLoading(false);
          setBrief({ text: "Analysis temporarily unavailable. Check API configuration.", sources: [] });
        }
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [leadId]);

  if (loading || !lead) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center space-y-6">
        <Zap className="w-12 h-12 text-blue-500 animate-pulse" />
        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Retrieving Asset Intelligence</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-8 lg:p-14 space-y-14">
      <button 
        onClick={onBack} 
        className="group flex items-center text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] tracking-[0.3em] uppercase"
      >
        <div className="p-2 bg-white rounded-lg border border-slate-100 mr-4 group-hover:border-slate-300 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Return to Global Sourcing
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-600/20">
                Legacy IPv4 Asset
              </span>
              <div className="flex items-center space-x-2 text-emerald-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Market Verified</span>
              </div>
            </div>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[1.1]">{lead.orgName}</h1>
            <div className="flex items-center space-x-4">
              <p className="text-3xl font-mono text-blue-600 font-bold tracking-tighter">{lead.cidr}</p>
              <span className="text-slate-300 font-bold">/</span>
              <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">{lead.size.toLocaleString()} IPs</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[4rem] p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px]"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-black text-sm uppercase tracking-[0.25em]">Sourcing AI Intel Briefing</h3>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full">
                  <Globe className="w-3 h-3" />
                  <span>Google Grounding Active</span>
                </div>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300 leading-loose font-medium text-lg whitespace-pre-wrap mb-10">
                {brief.text || "Synthesizing market data..."}
              </div>
              
              {brief.sources.length > 0 && (
                <div className="pt-8 border-t border-white/10 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verified Market Sources</h4>
                  <div className="flex flex-wrap gap-3">
                    {brief.sources.map((chunk, idx) => chunk.web && (
                      <a 
                        key={idx} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold text-blue-300 transition-all border border-white/5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{chunk.web.title || "Market Data"}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 text-center relative overflow-hidden group">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Deal Confidence Score</p>
            <div className="text-8xl font-black text-slate-900 tracking-tighter mb-8">{lead.score}</div>
            <div className="flex justify-center mb-6">
               <div className="h-3 w-full max-w-[200px] bg-slate-100 rounded-full overflow-hidden p-0.5">
                 <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: `${lead.score}%` }}></div>
               </div>
            </div>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              <Zap className="w-3 h-3 fill-emerald-600" />
              <span>Priority Acquisition</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden">
             <div className="relative z-10 space-y-8">
               <h4 className="text-3xl font-black tracking-tight">Direct Action</h4>
               <p className="text-sm text-blue-100/80 leading-relaxed font-medium">
                 Market telemetry suggests {lead.orgName} has high liquidity potential. Targeted outreach to infrastructure leads is recommended.
               </p>
               <button className="w-full py-6 bg-white text-blue-600 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl">
                 Generate Outreach
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
