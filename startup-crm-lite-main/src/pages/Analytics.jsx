import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

// Import analytics dashboard components
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
 * Analytics Page Component
 * Orchestrates filtering, loading states, KPI summaries, and charts grid visualization.
 *
 * Layout Structure:
 * - Page Header
 * - Date Filters
 * - KPI Metrics Section (6 cards)
 * - 2-Column Grid of analytical charts (10 widgets total)
 */
export default function Analytics() {
  const navigate = useNavigate();
  
  const {
    filterType,
    setFilterType,
    customRange,
    setCustomRange,
    loading,
    stats,
    charts,
    filteredLeadsCount,
    totalLeadsCount
  } = useAnalytics();

  // 1. Database-wide Empty State Onboarding
  if (totalLeadsCount === 0) {
    return (
      <div className="p-4 md:p-6 space-y-6 page-fade">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-main tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track sales performance and growth trends.
          </p>
        </div>
        <EmptyAnalyticsState onAddLeadClick={() => navigate('/leads')} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 page-fade">
      {/* ─── Analytics Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-main tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track sales performance and growth trends.
          </p>
        </div>
        
        {/* Sync Status Badge */}
        <div className="text-xs px-3 py-1.5 rounded-xl bg-bg-surface border border-border-base text-text-muted font-medium flex items-center gap-1.5 shadow-sm self-start sm:self-auto select-none">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>Real-time Sync Active</span>
        </div>
      </div>

      {/* ─── Date Range Filters ─── */}
      <AnalyticsFilters
        filterType={filterType}
        setFilterType={setFilterType}
        customRange={customRange}
        setCustomRange={setCustomRange}
      />

      {/* ─── Loading Skeleton Overlay ─── */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredLeadsCount === 0 ? (
        /* Empty state for the active filtered period */
        <div className="text-center py-20 bg-bg-surface border border-border-base rounded-2xl shadow-sm">
          <p className="text-sm text-text-muted font-medium">No lead data recorded in this period</p>
          <p className="text-xs text-text-subtle mt-1">Try expanding your date filter options above.</p>
        </div>
      ) : (
        /* ─── Main Dashboard Grid ─── */
        <div className="space-y-6">
          {/* 6 KPI Cards Grid */}
          <StatsCards stats={stats} />

          {/* Charts Display Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Row 1: Pie Distribution & Pipeline Funnel */}
            <PieChartCard data={charts.statusDistribution} />
            <FunnelChartCard data={charts.funnelData} />

            {/* Row 2: Acquisition Volume & Conversion Rate */}
            <BarChartCard data={charts.monthlyLeads} />
            <LineChartCard data={charts.conversionByMonth} />

            {/* Row 3: Revenue Realization & Marketing Channels */}
            <RevenueChartCard data={charts.revenueByMonth} />
            <LeadSourceChart data={charts.leadSourceStats} />

            {/* Row 4: Contribution heatmap & Sales ranking */}
            <ActivityHeatmap data={charts.activityHeatmapData} />
            <TopPerformersCard data={charts.topPerformers} />

            {/* Row 5: Revenue Forecasts & Money velocity */}
            <ForecastCard forecast={charts.forecast} />
            <SalesVelocityCard
              velocity={stats.salesVelocity}
              growth={stats.growth.salesVelocity}
              stats={stats}
            />
          </div>
        </div>
      )}
    </div>
  );
}
