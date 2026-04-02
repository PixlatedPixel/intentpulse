import React from 'react';
import { Users, TrendingUp, Calendar, Target } from 'lucide-react';

interface KPIProps {
  totalLeads: number;
  highIntentLeads: number;
  newThisWeek: number;
  avgScore: number;
}

export const KPIStrip: React.FC<KPIProps> = ({
  totalLeads,
  highIntentLeads,
  newThisWeek,
  avgScore,
}) => {
  const cards = [
    {
      label: 'Total Active Leads',
      value: totalLeads.toLocaleString(),
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'High-Intent (80+)',
      value: highIntentLeads.toLocaleString(),
      icon: Target,
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]/10',
    },
    {
      label: 'New This Week',
      value: newThisWeek.toLocaleString(),
      icon: Calendar,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
    {
      label: 'Avg Lead Score',
      value: avgScore.toString(),
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-[#1E2937] border border-slate-800 p-4 rounded-xl shadow-sm hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
            <div className={`${card.bg} ${card.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{card.value}</span>
            {index === 1 && (
              <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-full">
                +12%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
