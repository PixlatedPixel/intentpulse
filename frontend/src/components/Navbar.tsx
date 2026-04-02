import React from 'react';
import { RefreshCw, Download, Bell, User, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  lastRefreshed: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  newLeadsCount: number;
  slackEnabled: boolean;
  onToggleSlack: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lastRefreshed,
  onRefresh,
  isRefreshing,
  newLeadsCount,
  slackEnabled,
  onToggleSlack,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
          <LayoutDashboard className="text-white w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-tight">IntentPulse</span>
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <span className="text-slate-400 text-sm">
          Last refreshed: <span className="text-slate-200">{lastRefreshed}</span>
        </span>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-md hover:bg-[#10B981]/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh Now</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full border border-[#10B981]/20">
          <span className="text-xs font-bold uppercase tracking-wider">New High-Intent Leads Today: {newLeadsCount}</span>
        </div>
        
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Download className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-400 font-medium ml-1">Slack</span>
          <button
            onClick={onToggleSlack}
            className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
              slackEnabled ? 'bg-[#10B981]' : 'bg-slate-600'
            }`}
          >
            <motion.div
              animate={{ x: slackEnabled ? 16 : 2 }}
              className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white leading-none">Aadarsh</p>
            <p className="text-xs text-slate-500 mt-1">Founder</p>
          </div>
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
            <User className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>
    </nav>
  );
};
