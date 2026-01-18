
import React from 'react';
import { Lead } from '../types';
import { ChevronRight, Filter } from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onSelectLead }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Identified Legacy Blocks</h3>
        <button className="flex items-center space-x-2 text-sm font-medium text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Organization</th>
              <th className="px-6 py-4 font-semibold">CIDR / Block Size</th>
              <th className="px-6 py-4 font-semibold text-center">Score</th>
              <th className="px-6 py-4 font-semibold">Stage</th>
              <th className="px-6 py-4 font-semibold">Next Action</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr 
                key={lead.id} 
                className="hover:bg-slate-50/80 transition-colors cursor-pointer active:bg-slate-100"
                onClick={() => onSelectLead(lead)}
              >
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-900">{lead.orgName}</div>
                  <div className="text-xs text-slate-500 mt-1">ID: {lead.id}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="font-mono text-sm text-blue-600 font-semibold">{lead.cidr}</div>
                  <div className="text-xs text-slate-500 mt-1">{lead.size.toLocaleString()} IPs</div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      ${lead.score > 80 ? 'bg-green-100 text-green-700' : lead.score > 60 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}
                    `}>
                      {lead.score}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-bold
                    ${lead.stage === 'Found' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'}
                  `}>
                    {lead.stage}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-slate-600">{lead.nextActionDate}</div>
                </td>
                <td className="px-6 py-5 text-right">
                  <ChevronRight className="w-5 h-5 text-slate-400 inline" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
