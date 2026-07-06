import React, { useMemo } from 'react';
import { useLeads } from '../context/LeadContext';
import StatsCard from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads from '../components/dashboard/RecentLeads';
import QuickActions from '../components/dashboard/QuickActions';
import { Users, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';

const formatINR = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num || 0);
};

/**
 * Dashboard Page Component
 * Serves as the primary overview dashboard workspace for Startup CRM Lite.
 * Integrates live metrics calculations and responsive grids.
 */
export const Dashboard = () => {
  const { leads = [] } = useLeads();

  // Compute live stats dynamically from the CRM database
  const stats = useMemo(() => {
    const total = leads.length;
    
    // 1. Active Opportunities (non-Won and non-Lost)
    const active = leads.filter(l => !['Won', 'Lost'].includes(l.status));
    const activeCount = active.length;
    
    // 2. Pipeline Valuation (sum of active values)
    const valuation = active.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
    
    // 3. Conversion Win Rate (Won / Total)
    const wonCount = leads.filter(l => l.status === 'Won').length;
    const winRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;
    
    // 4. Closed Deals (Won + Lost)
    const closedCount = leads.filter(l => ['Won', 'Lost'].includes(l.status)).length;

    return [
      { title: 'Active Leads', value: String(activeCount), change: '+5.4%', icon: Users, color: 'primary' },
      { title: 'Pipeline Valuation', value: formatINR(valuation), change: '+8.2%', icon: DollarSign, color: 'success' },
      { title: 'Win Conversion', value: `${winRate}%`, change: '+1.8%', icon: TrendingUp, color: 'warning' },
      { title: 'Deals Closed', value: String(closedCount), change: '+12.1%', icon: CheckCircle, color: 'danger' },
    ];
  }, [leads]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Welcome Header Banner */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          CRM Workspace
        </h2>
        <p className="text-slate-550 dark:text-slate-400 text-sm mt-1">
          Monitor your customer pipelines, assign leads, and optimize conversions.
        </p>
      </div>

      {/* Stats Cards Grid: 1 col on mobile, 2 col on tablet, 4 col on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <StatsCard
            key={idx}
            title={s.title}
            value={s.value}
            change={s.change}
            icon={s.icon}
            color={s.color}
          />
        ))}
      </div>

      {/* Main Widgets: 1 col on mobile/tablet, 2 col grid on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Overview segment chart */}
        <div className="h-full">
          <PipelineOverview leads={leads} />
        </div>

        {/* Recent leads table list */}
        <div className="h-full">
          <RecentLeads leads={leads} />
        </div>

        {/* Quick action buttons list spanning full width below charts on desktop */}
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
