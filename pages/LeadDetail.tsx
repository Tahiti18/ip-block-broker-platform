
import React, { useEffect, useState } from 'react';
import { Lead, LeadStage } from '../types';
import { api } from '../services/api';
import { gemini } from '../services/geminiService';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Globe, 
  BarChart3, 
  Sparkles,
  Download,
  Share2,
  BrainCircuit
} from 'lucide-react';

interface LeadDetailProps {
  leadId: string;
  onBack: () => void;
}

const LeadDetail: React.FC<LeadDetailProps> = ({ leadId, onBack }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [brief, setBrief] = useState<string>('Initializing analysis engine...');
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getLead(leadId).then(data => {
      if (data) {
        setLead(data);
        setIsAiLoading(true);
        gemini.generateLeadBrief(data).then(res => {
          setBrief(res);
          setIsAiLoading(false);
        });
      }
      setLoading(false);
    });
  }, [leadId]);

  if (loading || !lead) return (
    <div className="flex flex-col items-center justify-center h-full p-20 animate-pulse">
      <BrainCircuit className="w-12 h-12 text-slate-300 mb-4" />
      <p className="text-slate-500 font-medium tracking-tight">Accessing Lead Metadata...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8 pb-32">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Pipeline
        </button>
        <div className="flex space-x-3">
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-50 flex items-center shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Evidence PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Primary Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2 block">Enterprise Asset</span>
                <h1 className="text-4xl font-black text-slate-900">{lead.orgName}</h1>
                <p className="text-xl font-mono text-slate-500 mt-2">{lead.cidr}</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black text-slate-900">{lead.score}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Confidence Score</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Lead Owner</p>
                <p className="font-bold text-slate-800">{lead.owner}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Block Age</p>
                <p className="font-bold text-slate-800">Legacy Status Verified</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pipeline Stage</p>
                <select 
                  className="font-bold text-blue-600 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:underline"
                  value={lead.stage}
                  onChange={(e) => api.updateLead(lead.id, { stage: e.target.value as LeadStage })}
                >
                  {Object.values(LeadStage).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* AI Brief Section */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-xl overflow-hidden relative">
            {/* Visual background highlight */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -mr-32 -mt-32"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
                  <Sparkles className={`w-5 h-5 text-white ${isAiLoading ? 'animate-spin' : ''}`} />
                </div>
                <h3 className="text-lg font-black text-white">Gemini 3.0 Flash Analysis</h3>
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white/50 uppercase tracking-widest border border-white/5">
                OpenRouter Engine
              </div>
            </div>

            <div className={`prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap relative z-10 transition-opacity duration-300 ${isAiLoading ? 'opacity-50' : 'opacity-100'}`}>
              {brief}
            </div>
            
            {isAiLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 z-20">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Items */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 px-2">Evidence & Provenance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800">RDAP Registry</h4>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Snapshot 2024-Q3</p>
                <div className="bg-slate-950 p-4 rounded-xl text-green-400 font-mono text-[10px] h-32 overflow-hidden opacity-90 border border-slate-800">
                  {`{ 
  "objectClassName": "ip network", 
  "handle": "NET-12-0-0-0-1", 
  "startAddress": "12.0.0.0", 
  "endAddress": "12.255.255.255",
  "name": "AT-T-BELL",
  "type": "DIRECT ALLOCATION",
  "registrationDate": "1983-01-01"
}`}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                   <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800">Risk Profile</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm pb-2 border-b border-slate-50">
                    <span className="text-slate-500">BGP Hijack Risk</span>
                    <span className="text-green-600 font-black">LOW</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2 border-b border-slate-50">
                    <span className="text-slate-500">Spamhaus Reputation</span>
                    <span className="text-green-600 font-black">CLEAN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Sub-allocation Density</span>
                    <span className="text-slate-900 font-black">0.2% (Dormant)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Components */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-slate-400" />
              Score Breakdown
            </h3>
            <div className="space-y-5">
              {(Object.entries(lead.scoreBreakdown) as [string, number][]).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-slate-900">{val}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${val > 80 ? 'bg-green-500' : val > 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/30 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <h3 className="text-xl font-black mb-6 relative z-10">Outreach Terminal</h3>
            <div className="space-y-4 mb-8 relative z-10">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] text-white/60 uppercase font-black tracking-widest mb-1">Recommended Target</p>
                <p className="font-bold text-lg">Infrastructure Director</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] text-white/60 uppercase font-black tracking-widest mb-1">Contact Status</p>
                <p className="font-bold text-green-300">Verified LinkedIn Match</p>
              </div>
            </div>
            <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black transition-all hover:bg-slate-50 active:scale-95 shadow-lg relative z-10">
              Initiate Contact Pipeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
