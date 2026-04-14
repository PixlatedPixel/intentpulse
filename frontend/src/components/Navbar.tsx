import React from 'react';
import { RefreshCw, Download, Bell, User, LayoutDashboard, Upload } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  lastRefreshed: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  newLeadsCount: number;
  onDownload: () => void;
  onUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lastRefreshed,
  onRefresh,
  isRefreshing,
  newLeadsCount,
  onDownload,
  onUpload,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between px-6 z-50">
      {/* LEFT — Logo + badge */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
          <LayoutDashboard className="text-white w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-tight">IntentPulse</span>
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
        </div>
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full border border-[#10B981]/20 ml-2">
          <span className="text-xs font-bold uppercase tracking-wider">🔥 {newLeadsCount} High-Intent Today</span>
        </div>
      </div>

      {/* RIGHT — all controls */}
      <div className="flex items-center gap-3">
        {/* Refresh Now */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-md hover:bg-[#10B981]/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh Now</span>
        </button>

        {/* Last refreshed */}
        <span className="hidden md:block text-slate-400 text-sm">
          Last refreshed: <span className="text-slate-200">{lastRefreshed}</span>
        </span>

        {/* Upload CSV */}
        <button
          onClick={onUpload}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md hover:bg-blue-500/20 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">Upload CSV</span>
        </button>

        {/* Download CSV — same style as others */}
        <button
          onClick={onDownload}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-md hover:bg-orange-500/20 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Download CSV</span>
        </button>

        {/* User avatar */}
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
