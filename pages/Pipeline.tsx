import React, { useState, useEffect } from 'react';
import { Lead, LeadStage } from '../types';
import { api } from '../services/api';
import { 
  GripVertical, 
  MoreHorizontal, 
  Plus, 
  Calendar, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const STAGES = [
  LeadStage.FOUND,
  LeadStage.VERIFIED,
  LeadStage.CONTACTED,
  LeadStage.NDA,
  LeadStage.NEGOTIATING,
  LeadStage.CLOSED_WON
];

const Pipeline: React.FC<{ onLeadSelect: (l: Lead) => void }> = ({ onLeadSelect }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeads().then(data => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  const getLeadsByStage = (stage: LeadStage) => leads.filter(l => l.stage === stage);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <div className="flex p-6 lg:p-10 space-x-6 min-h-full">
          {STAGES.map((stage) => (
            <div key={stage} className="w-80 shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center space-x-3">
                  <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-500">{stage}</h3>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {getLeadsByStage(stage).length}
                  </span>
                </div>
                <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pb-10">
                {getLeadsByStage(stage).map((lead) => (
                  <div 
                    key={lead.id}
                    onClick={() => onLeadSelect(lead)}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        lead.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {lead.priority || 'Medium'}
                      </div>
                      <button className="text-slate-300 group-hover:text-slate-500">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h4 className="font-bold text-slate-900 mb-1 truncate">{lead.orgName}</h4>
                    <p className="font-mono text-xs text-blue-600 font-bold mb-4">{lead.cidr}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center text-[10px] text-slate-400 font-bold">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(lead.nextActionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center text-[10px] text-emerald-600 font-bold">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {lead.score}
                      </div>
                    </div>
                  </div>
                ))}
                
                {getLeadsByStage(stage).length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl h-32 flex items-center justify-center text-slate-300 text-xs font-medium">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pipeline;
