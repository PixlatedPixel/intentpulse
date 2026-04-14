import React from 'react';
import { Filter, ChevronDown, X, Check } from 'lucide-react';
import { FilterState, OpportunityType, SignalType } from '../types';
import { INDUSTRIES, LOCATIONS, OPPORTUNITY_TYPES, SIGNAL_TYPES } from '../constants';

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  onFilterChange,
  onClearAll,
}) => {
  const toggleIndustry = (industry: string) => {
    const newIndustries = filters.industries.includes(industry)
      ? filters.industries.filter(i => i !== industry)
      : [...filters.industries, industry];
    onFilterChange({ ...filters, industries: newIndustries });
  };

  const toggleOpportunity = (opportunity: OpportunityType) => {
    const newOpportunities = filters.opportunities.includes(opportunity)
      ? filters.opportunities.filter(o => o !== opportunity)
      : [...filters.opportunities, opportunity];
    onFilterChange({ ...filters, opportunities: newOpportunities });
  };

  const toggleSignal = (signal: SignalType) => {
    const newSignals = filters.signals.includes(signal)
      ? filters.signals.filter(s => s !== signal)
      : [...filters.signals, signal];
    onFilterChange({ ...filters, signals: newSignals });
  };

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 h-[calc(100vh-64px)] fixed left-0 top-16 overflow-y-auto p-4 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#10B981]" />
          <h2 className="text-white font-semibold text-sm">Filters</h2>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Lead Score */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Score</label>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange({ ...filters, scoreRange: [80, 100] })}
              className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                filters.scoreRange[0] === 80
                  ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              High Intent (80+)
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, scoreRange: [60, 79] })}
              className={`flex-1 px-2 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                filters.scoreRange[0] === 60 && filters.scoreRange[1] === 79
                  ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              Warm (60-79)
            </button>
          </div>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="100"
              value={filters.scoreRange[0]}
              onChange={(e) => onFilterChange({ ...filters, scoreRange: [parseInt(e.target.value), 100] })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-500 font-mono">{filters.scoreRange[0]}</span>
              <span className="text-[10px] text-slate-500 font-mono">100</span>
            </div>
          </div>
        </div>

        {/* Industry */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Industry</label>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {INDUSTRIES.map(industry => (
              <button
                key={industry}
                onClick={() => toggleIndustry(industry)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                  filters.industries.includes(industry)
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <span>{industry}</span>
                {filters.industries.includes(industry) && <Check className="w-3 h-3 text-[#10B981]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunity Type */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opportunity Type</label>
          <div className="space-y-2">
            {OPPORTUNITY_TYPES.map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => toggleOpportunity(type)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    filters.opportunities.includes(type)
                      ? 'bg-[#10B981] border-[#10B981]'
                      : 'border-slate-700 group-hover:border-slate-500'
                  }`}
                >
                  {filters.opportunities.includes(type) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Signals Detected */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Signals Detected</label>
          <div className="space-y-2">
            {SIGNAL_TYPES.map(signal => (
              <label key={signal} className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => toggleSignal(signal)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    filters.signals.includes(signal)
                      ? 'bg-[#3B82F6] border-[#3B82F6]'
                      : 'border-slate-700 group-hover:border-slate-500'
                  }`}
                >
                  {filters.signals.includes(signal) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{signal}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Company Size */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Size</label>
          <div className="flex flex-wrap gap-2">
            {['10-50', '51-200', '201-500', '500+'].map(size => (
              <button
                key={size}
                onClick={() => {
                  const newSizes = filters.companySizes.includes(size)
                    ? filters.companySizes.filter(s => s !== size)
                    : [...filters.companySizes, size];
                  onFilterChange({ ...filters, companySizes: newSizes });
                }}
                className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                  filters.companySizes.includes(size)
                    ? 'bg-slate-700 border-slate-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onFilterChange({ ...filters })}
          className="w-full py-2.5 bg-[#10B981] text-white rounded-lg font-bold text-sm hover:bg-[#0D9668] transition-colors shadow-lg shadow-[#10B981]/10 mt-4"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
};
