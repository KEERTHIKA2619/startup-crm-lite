import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { useAnalytics } from '../hooks/useAnalytics';

// Import local components
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import StatsCards from '../components/analytics/StatsCards';
import PieChartCard from '../components/analytics/PieChartCard';
import FunnelChartCard from '../components/analytics/FunnelChartCard';
import BarChartCard from '../components/analytics/BarChartCard';
import LineChartCard from '../components/analytics/LineChartCard';
import RevenueChartCard from '../components/analytics/RevenueChartCard';
import LeadSourceChart from '../components/analytics/LeadSourceChart';
import SalesVelocityCard from '../components/analytics/SalesVelocityCard';
import ForecastCard from '../components/analytics/ForecastCard';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import TopPerformersCard from '../components/analytics/TopPerformersCard';
import EmptyAnalyticsState from '../components/analytics/EmptyAnalyticsState';
import LoadingSkeleton from '../components/analytics/LoadingSkeleton';

/**
 * Analytics Dashboard Component
 * Coordinates lead filtering, KPI comparisons, and chart rendering.
 */
export const Analytics = () => {
  const navigate = useNavigate();
  const { leads = [] } = useLeads();

  // Filter States
  const [activeFilter, setActiveFilter] = useState('30d');
  const [customRange, setCustomRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Simulation loading state for UX polish
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeFilter, customRange]);

  // Invoke Analytics Hook
  const {
    currentKPIs,
    prevKPIs,
    statusDistribution,
    monthlyLeads,
    conversionTrend,
    revenueTrend,
    leadSources,
    funnelData,
    forecast,
    topPerformers,
    heatmapData,
    filteredLeads
  } = useAnalytics(leads, activeFilter, customRange);

  const handleExportReport = () => {
    if (filteredLeads.length === 0) {
      alert('No data available to export.');
      return;
    }

    // Generate CSV mockup download
    const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Status', 'Source', 'Value', 'Owner', 'Date Added'];
    const rows = filteredLeads.map(lead => [
      lead.id,
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.company.replace(/"/g, '""')}"`,
      lead.email,
      lead.phone || '',
      lead.status,
      lead.source || '',
      lead.value || 0,
      lead.owner || '',
      lead.dateAdded || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crm_analytics_${activeFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddLeadRedirect = () => {
    // Redirect to /leads route and auto-trigger modal
    navigate('/leads');
    // Note: The leads page handles the modal. By redirecting there, users can instantly click Add Lead.
  };

  if (leads.length === 0) {
    return (
      <div className="animate-in fade-in duration-300">
        <EmptyAnalyticsState onAddLead={handleAddLeadRedirect} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Analytics Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track sales performance and growth trends.
          </p>
        </div>
        <button 
          onClick={handleExportReport}
          className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:text-slate-950 dark:hover:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm shrink-0"
        >
          <Download className="w-4 h-4 text-slate-455 dark:text-slate-500" />
          <span>Export Analytics</span>
        </button>
      </div>

      {/* 2. Filters Row */}
      <AnalyticsFilters 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredLeads.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-250 dark:border-slate-800 rounded-3xl text-center bg-slate-50/50 dark:bg-slate-900/30">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            No leads matched the selected filter range. Try choosing a different range or adding new leads.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* 3. Stats Overview Cards (6 KPI Grid) */}
          <StatsCards currentKPIs={currentKPIs} prevKPIs={prevKPIs} />

          {/* 4. Charts Grid Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Row 1: Pie Chart & Funnel Chart */}
            <div className="h-full">
              <PieChartCard statusDistribution={statusDistribution} />
            </div>
            <div className="h-full">
              <FunnelChartCard funnelData={funnelData} />
            </div>

            {/* Row 2: Bar Chart & Line Chart */}
            <div className="h-full">
              <BarChartCard monthlyLeads={monthlyLeads} />
            </div>
            <div className="h-full">
              <LineChartCard conversionTrend={conversionTrend} />
            </div>

            {/* Row 3: Area Revenue Chart & Lead Source Chart */}
            <div className="h-full">
              <RevenueChartCard revenueTrend={revenueTrend} />
            </div>
            <div className="h-full">
              <LeadSourceChart leadSources={leadSources} />
            </div>

            {/* Row 4: Heatmap Chart & Top Performers List */}
            <div className="h-full">
              <ActivityHeatmap heatmapData={heatmapData} />
            </div>
            <div className="h-full">
              <TopPerformersCard performers={topPerformers} />
            </div>

            {/* Row 5: Forecast Card & Sales Velocity Card */}
            <div className="h-full">
              <ForecastCard forecast={forecast} />
            </div>
            <div className="h-full">
              <SalesVelocityCard 
                currentVelocity={currentKPIs.salesVelocity} 
                prevVelocity={prevKPIs.salesVelocity}
                currentKPIs={currentKPIs}
              />
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Analytics;
