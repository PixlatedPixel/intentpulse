import React from 'react';
import { Eye, Copy, Linkedin, ExternalLink } from 'lucide-react';
import { Lead } from '../types';
import { COLORS } from '../constants';

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onCopyPitch: (pitch: string) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onSelectLead,
  onCopyPitch,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.green;
    if (score >= 60) return COLORS.orange;
    return COLORS.gray;
  };

  return (
    <div className="bg-[#1E2937] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Industry</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Key Signals</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Recommended Service</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                      {lead.company.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#10B981] transition-colors">
                        {lead.company}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Size: {lead.size}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-300 font-medium">{lead.location}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    {lead.industry}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getScoreColor(lead.score) }}
                    />
                    <span className="text-sm font-bold" style={{ color: getScoreColor(lead.score) }}>
                      {lead.score}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {lead.signals.slice(0, 2).map((signal, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20 whitespace-nowrap"
                      >
                        {signal}
                      </span>
                    ))}
                    {lead.signals.length > 2 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                        +{lead.signals.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded border border-[#10B981]/20">
                    {lead.opportunity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onCopyPitch(lead.pitchStarter)}
                      className="p-1.5 text-slate-400 hover:text-[#10B981] hover:bg-[#10B981]/10 rounded transition-colors"
                      title="Copy Pitch"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={lead.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
