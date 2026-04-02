import React from 'react';
import { X, ExternalLink, Linkedin, Mail, Copy, Archive, Target, CheckCircle2, Share2 } from 'lucide-react';
import { Lead } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from '../constants';

interface DetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
  onCopyPitch: (pitch: string) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  lead,
  onClose,
  onCopyPitch,
}) => {
  if (!lead) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.green;
    if (score >= 60) return COLORS.orange;
    return COLORS.gray;
  };

  const scoreColor = getScoreColor(lead.score);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-end"
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#0F172A] h-full shadow-2xl border-l border-slate-800 overflow-y-auto custom-scrollbar"
        >
          <div className="sticky top-0 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800 p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-xl font-bold text-white border border-slate-700">
                {lead.company.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-none">{lead.company}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400 font-medium">{lead.industry}</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-xs text-slate-400 font-medium">{lead.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Score & KPI Strip */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Lead Score</span>
                <span className="text-3xl font-bold" style={{ color: scoreColor }}>{lead.score}</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Company Size</span>
                <span className="text-xl font-bold text-white">{lead.size}</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confidence</span>
                <span className="text-xl font-bold text-[#10B981]">92%</span>
              </div>
            </div>

            {/* Signals Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-[#10B981]" />
                Detected Signals
              </h3>
              <div className="space-y-3">
                {lead.signals.map((signal, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <span className="text-sm text-slate-200 font-medium">{signal}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
                      {lead.lastSignalDate}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Insight Summary */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">AI Insight Summary</h3>
              <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981]" />
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{lead.insightSummary}"
                </p>
              </div>
            </section>

            {/* Recommended Service */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Recommended Service</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 text-[#10B981] rounded-lg border border-[#10B981]/20 font-bold text-sm">
                {lead.opportunity}
              </div>
            </section>

            {/* Pitch Starter */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Pitch Starter</h3>
                <button
                  onClick={() => onCopyPitch(lead.pitchStarter)}
                  className="text-xs font-bold text-[#10B981] hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy Full Pitch
                </button>
              </div>
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-mono">
                {lead.pitchStarter}
              </div>
            </section>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button className="flex items-center justify-center gap-2 py-3 bg-[#10B981] text-white rounded-xl font-bold text-sm hover:bg-[#0D9668] transition-colors shadow-lg shadow-[#10B981]/10">
                <Linkedin className="w-4 h-4" />
                LinkedIn Message
              </button>
              <button className="flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors border border-slate-700">
                <Mail className="w-4 h-4" />
                Cold Email
              </button>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors">
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
                <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                  Move to CRM
                </button>
              </div>
              <button className="flex items-center gap-2 text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-lg border border-[#10B981]/20">
                <CheckCircle2 className="w-4 h-4" />
                Mark as Contacted
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
