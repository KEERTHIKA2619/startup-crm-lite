import React from 'react';
import { Users, Percent, IndianRupee, Briefcase, Calendar, TrendingDown, TrendingUp, Minus } from 'lucide-react';

// Format number in Indian Rupees format (e.g. ₹12,40,000)
const formatINR = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num || 0);
};

// Calculate trend indicators
const calculateTrend = (curr, prev) => {
  if (prev === 0) {
    return { val: '0%', isPositive: true, isNeutral: true };
  }
  const diff = curr - prev;
  const pct = Math.round((diff / prev) * 100);
  return {
    val: pct >= 0 ? `+${pct}%` : `${pct}%`,
    isPositive: pct >= 0,
    isNeutral: pct === 0
  };
};

export const StatsCards = ({ currentKPIs, prevKPIs }) => {
  const kpis = [
    {
      title: 'Total Leads',
      value: currentKPIs.total,
      icon: Users,
      color: 'bg-blue-50 text-[#2563EB] dark:bg-blue-550/10 dark:text-blue-400 border-blue-100 dark:border-blue-900/40',
      trend: calculateTrend(currentKPIs.total, prevKPIs.total),
      subtext: 'vs previous period'
    },
    {
      title: 'Conversion Rate',
      value: `${currentKPIs.conversionRate}%`,
      icon: Percent,
      color: 'bg-emerald-50 text-[#22C55E] dark:bg-emerald-550/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
      trend: calculateTrend(currentKPIs.conversionRate, prevKPIs.conversionRate),
      subtext: 'vs previous period'
    },
    {
      title: 'Pipeline Value',
      value: formatINR(currentKPIs.pipelineValue),
      icon: Briefcase,
      color: 'bg-amber-50 text-[#F59E0B] dark:bg-amber-550/10 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
      trend: calculateTrend(currentKPIs.pipelineValue, prevKPIs.pipelineValue),
      subtext: 'vs previous period'
    },
    {
      title: 'Won Revenue',
      value: formatINR(currentKPIs.wonRevenue),
      icon: IndianRupee,
      color: 'bg-violet-50 text-[#7C3AED] dark:bg-violet-550/10 dark:text-violet-400 border-violet-100 dark:border-violet-900/40',
      trend: calculateTrend(currentKPIs.wonRevenue, prevKPIs.wonRevenue),
      subtext: 'vs previous period'
    },
    {
      title: 'Average Sales Cycle',
      value: `${currentKPIs.avgSalesCycle} Days`,
      icon: Calendar,
      color: 'bg-sky-50 text-sky-600 dark:bg-sky-550/10 dark:text-sky-400 border-sky-100 dark:border-sky-900/40',
      trend: calculateTrend(prevKPIs.avgSalesCycle, currentKPIs.avgSalesCycle), // For sales cycle, lower is better!
      subtext: 'lower cycle is positive'
    },
    {
      title: 'Lost Rate',
      value: `${currentKPIs.lostRate}%`,
      icon: Percent,
      color: 'bg-rose-50 text-[#EF4444] dark:bg-rose-550/10 dark:text-rose-400 border-rose-100 dark:border-rose-900/40',
      trend: calculateTrend(prevKPIs.lostRate, currentKPIs.lostRate), // For lost rate, lower is better!
      subtext: 'lower rate is positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const { val, isPositive, isNeutral } = kpi.trend;
        
        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-0.5 duration-200"
          >
            {/* Header: Title + Icon */}
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Content: Value + Trend */}
            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap">
                {kpi.value}
              </h3>
              
              <div className="flex items-center gap-1.5 mt-2">
                {isNeutral ? (
                  <span className="text-slate-400 dark:text-slate-500 flex items-center text-[10px] font-bold">
                    <Minus className="w-3 h-3 mr-0.5" />
                    {val}
                  </span>
                ) : isPositive ? (
                  <span className="text-[#22C55E] dark:text-emerald-400 flex items-center text-[10px] font-bold">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {val}
                  </span>
                ) : (
                  <span className="text-[#EF4444] dark:text-rose-400 flex items-center text-[10px] font-bold">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    {val}
                  </span>
                )}
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">
                  {kpi.subtext}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
