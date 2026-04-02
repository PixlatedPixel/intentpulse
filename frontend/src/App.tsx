import React, { useState, useMemo, useEffect } from 'react';
import { Search, LayoutGrid, List, Map, ChevronRight, Bell, FilterX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KPIStrip } from './components/KPIStrip';
import { LeadTable } from './components/LeadTable';
import { LeadCard } from './components/LeadCard';
import { DetailPanel } from './components/DetailPanel';
import { Lead, FilterState } from './types';
import { MOCK_LEADS } from './constants';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState('26 Mar 2026, 10:05 PM IST');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    scoreRange: [0, 100],
    industries: [],
    locations: [],
    opportunities: [],
    signals: [],
    companySizes: [],
    dateRange: '30',
  });

  const filteredLeads = useMemo(() => {
    return MOCK_LEADS.filter(lead => {
      const matchesSearch = lead.company.toLowerCase().includes(filters.search.toLowerCase()) ||
                          lead.industry.toLowerCase().includes(filters.search.toLowerCase());
      const matchesScore = lead.score >= filters.scoreRange[0] && lead.score <= filters.scoreRange[1];
      const matchesIndustry = filters.industries.length === 0 || filters.industries.includes(lead.industry);
      const matchesOpportunity = filters.opportunities.length === 0 || filters.opportunities.includes(lead.opportunity);
      const matchesSignals = filters.signals.length === 0 || lead.signals.some(s => filters.signals.includes(s));
      
      return matchesSearch && matchesScore && matchesIndustry && matchesOpportunity && matchesSignals;
    });
  }, [filters]);

  const kpiData = useMemo(() => {
    const highIntent = filteredLeads.filter(l => l.score >= 80).length;
    const avgScore = filteredLeads.length > 0 
      ? Math.round(filteredLeads.reduce((acc, l) => acc + l.score, 0) / filteredLeads.length)
      : 0;
    
    return {
      total: filteredLeads.length,
      highIntent,
      newThisWeek: 12, // Mocked
      avgScore,
    };
  }, [filteredLeads]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date().toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }) + ' IST');
      setToastMessage('12 new high-intent leads loaded');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  const handleCopyPitch = (pitch: string) => {
    navigator.clipboard.writeText(pitch);
    setToastMessage('Pitch copied to clipboard!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      scoreRange: [0, 100],
      industries: [],
      locations: [],
      opportunities: [],
      signals: [],
      companySizes: [],
      dateRange: '30',
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-[#10B981]/30 selection:text-[#10B981]">
      <Navbar
        lastRefreshed={lastRefreshed}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        newLeadsCount={12}
        slackEnabled={slackEnabled}
        onToggleSlack={() => setSlackEnabled(!slackEnabled)}
      />

      <div className="flex pt-16">
        <Sidebar
          filters={filters}
          onFilterChange={setFilters}
          onClearAll={clearAllFilters}
        />

        <main className="flex-1 ml-64 p-8 min-h-[calc(100vh-64px)] overflow-x-hidden">
          {/* KPI Strip */}
          <KPIStrip
            totalLeads={kpiData.total}
            highIntentLeads={kpiData.highIntent}
            newThisWeek={kpiData.newThisWeek}
            avgScore={kpiData.avgScore}
          />

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search company name or keyword..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-[#1E2937] border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-800/50 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    viewMode === 'table'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    viewMode === 'card'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Card View
                </button>
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors border border-slate-700">
                <Map className="w-4 h-4" />
                Map View
              </button>
            </div>
          </div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {filteredLeads.length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {viewMode === 'table' ? (
                  <LeadTable
                    leads={filteredLeads}
                    onSelectLead={setSelectedLead}
                    onCopyPitch={handleCopyPitch}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeads.map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onSelectLead={setSelectedLead}
                        onCopyPitch={handleCopyPitch}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                  <FilterX className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No leads found</h3>
                <p className="text-sm text-slate-500 max-w-xs">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 text-sm font-bold text-[#10B981] hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Detail Panel */}
      <DetailPanel
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onCopyPitch={handleCopyPitch}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[100] px-6 py-3 bg-[#10B981] text-white rounded-xl shadow-2xl shadow-[#10B981]/20 flex items-center gap-3 border border-[#10B981]/20"
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Styles for Custom Scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}} />
    </div>
  );
};

export default App;
