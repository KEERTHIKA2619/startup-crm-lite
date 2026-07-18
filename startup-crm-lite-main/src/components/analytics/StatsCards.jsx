import { Users, Target, TrendingUp, Award, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * StatsCards Component
 * Renders the 6 key analytics metric indicators inside a responsive grid.
 * Tracks growth calculations from previous periods.
 *
 * @param {Object} props
 * @param {Object} props.stats - Calculated metrics object from useAnalytics.
 */
export default function StatsCards({ stats }) {
  const {
    totalLeads,
    conversionRate,
    pipelineValue,
    wonRevenue,
    avgSalesCycle,
    lostRate,
    growth
  } = stats;

  const kpis = [
    {
      title: 'Total Leads',
      value: totalLeads,
      growth: growth.totalLeads,
      icon: Users,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      description: 'Leads in selected period',
      lowerIsBetter: false
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      growth: growth.conversionRate,
      icon: Target,
      iconBg: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400',
      description: 'Closed-won conversion rate',
      lowerIsBetter: false
    },
    {
      title: 'Pipeline Value',
      value: formatCurrency(pipelineValue),
      growth: growth.pipelineValue,
      icon: TrendingUp,
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      description: 'Value of all active leads',
      lowerIsBetter: false
    },
    {
      title: 'Won Revenue',
      value: formatCurrency(wonRevenue),
      growth: growth.wonRevenue,
      icon: Award,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      description: 'Revenue from won deals',
      lowerIsBetter: false
    },
    {
      title: 'Average Sales Cycle',
      value: `${avgSalesCycle} Days`,
      growth: growth.avgSalesCycle,
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      description: 'Created to closing velocity',
      lowerIsBetter: true
    },
    {
      title: 'Lost Rate',
      value: `${lostRate}%`,
      growth: growth.lostRate,
      icon: AlertTriangle,
      iconBg: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
      description: 'Percentage of lost leads',
      lowerIsBetter: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const change = kpi.growth;
        const hasChange = change !== 0;
        
        // Growth rating calculation:
        // Decreasing lost rates / sales cycles is a positive development
        let isPositiveTrend = change > 0;
        if (kpi.lowerIsBetter) {
          isPositiveTrend = change < 0;
        }

        const badgeColor = isPositiveTrend
          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30';

        const TrendIcon = isPositiveTrend ? ArrowUpRight : ArrowDownRight;

        return (
          <div
            key={idx}
            className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {hasChange && (
                <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                  <TrendIcon className="w-3 h-3" />
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-text-subtle uppercase tracking-wider block">
                {kpi.title}
              </span>
              <h3 className="font-display font-bold text-2xl text-text-main mt-1 tracking-tight">
                {kpi.value}
              </h3>
              <p className="text-[10px] text-text-muted mt-1 leading-normal">
                {kpi.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
