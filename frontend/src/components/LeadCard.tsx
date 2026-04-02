import React from 'react';
import { Linkedin, Copy, CheckCircle2 } from 'lucide-react';
import { Lead } from '../types';
import { COLORS } from '../constants';
import { motion } from 'motion/react';

interface LeadCardProps {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  onCopyPitch: (pitch: string) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onSelectLead,
  onCopyPitch,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.green;
    if (score >= 60) return COLORS.orange;
    return COLORS.gray;
  };

  const scoreColor = getScoreColor(lead.score);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onSelectLead(lead)}
      className="bg-[#1E2937] border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-white border border-slate-600">
            {lead.company.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-[#10B981] transition-colors leading-tight">
              {lead.company}
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
              {lead.location}
            </span>
          </div>
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="transparent"
              stroke={scoreColor}
              strokeWidth="4"
              strokeDasharray={125.6}
              strokeDashoffset={125.6 - (125.6 * lead.score) / 100}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-bold" style={{ color: scoreColor }}>
            {lead.score}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {lead.signals.map((signal, i) => (
          <span
            key={i}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20"
          >
            {signal}
          </span>
        ))}
      </div>

      <p className="text-xs text-slate-400 line-clamp-3 mb-4 flex-grow italic leading-relaxed">
        "{lead.insightSummary}"
      </p>

      <div className="mb-4">
        <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded border border-[#10B981]/20 uppercase tracking-wider">
          {lead.opportunity}
        </span>
      </div>

      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pitch Starter</p>
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{lead.pitchStarter}</p>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
        <a
          href={lead.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <Linkedin className="w-3.5 h-3.5" />
          LinkedIn
        </a>
        <button
          onClick={() => onCopyPitch(lead.pitchStarter)}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#10B981]/10 text-[#10B981] rounded-lg text-xs font-bold hover:bg-[#10B981]/20 transition-colors border border-[#10B981]/20"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Pitch
        </button>
        <button className="p-2 text-slate-500 hover:text-[#10B981] transition-colors" title="Mark as Contacted">
          <CheckCircle2 className={`w-5 h-5 ${lead.contacted ? 'text-[#10B981]' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
};
