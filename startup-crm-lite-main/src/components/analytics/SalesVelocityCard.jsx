import { ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * SalesVelocityCard Component
 * Displays the sales velocity rate ($ per day) and lists the formula inputs.
 *
 * @param {Object} props
 * @param {number} props.velocity - Current period velocity ($/day).
 * @param {number} props.growth - Growth rate vs previous period.
 * @param {Object} props.stats - Stats metrics for formula breakdowns.
 */
export default function SalesVelocityCard({ velocity = 0, growth = 0, stats = {} }) {
  // Back-calculate the previous velocity based on the growth rate
  const prevVelocity = growth !== 0 ? Math.round(velocity / (1 + growth / 100)) : velocity;
  const isPositive = growth > 0;

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[350px]">
      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-display font-semibold text-text-main text-sm">Sales Velocity</h4>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Zap className="w-4 h-4 fill-current" />
          </div>
        </div>
        <p className="text-xs text-text-subtle mt-0.5">Speed of deal closures in value per day</p>
      </div>

      <div className="my-6">
        <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider block">
          Current Velocity
        </span>
        <h3 className="font-display font-bold text-3xl text-text-main mt-1 tracking-tight">
          {formatCurrency(velocity)}/day
        </h3>
        
        {growth !== 0 ? (
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
            }`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{Math.abs(growth)}%</span>
            </div>
            <span className="text-[10px] text-text-subtle">
              vs {formatCurrency(prevVelocity)}/day last period
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-text-subtle mt-1.5 block">
            Consistent with previous period
          </span>
        )}
      </div>

      {/* Formula breakdown factors */}
      <div className="border-t border-border-base pt-4 space-y-2 text-xs">
        <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider block mb-1">
          Velocity Equation Factors
        </span>
        <div className="flex items-center justify-between text-text-muted">
          <span>Opportunities (Total Leads)</span>
          <span className="font-semibold text-text-main">{stats.totalLeads || 0}</span>
        </div>
        <div className="flex items-center justify-between text-text-muted">
          <span>Win Rate (Conversion)</span>
          <span className="font-semibold text-text-main">{stats.conversionRate || 0}%</span>
        </div>
        <div className="flex items-center justify-between text-text-muted">
          <span>Avg Deal Size</span>
          <span className="font-semibold text-text-main">
            {formatCurrency(stats.totalLeads > 0 ? (stats.pipelineValue + stats.wonRevenue) / stats.totalLeads : 0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-text-muted">
          <span>Avg Sales Cycle Length</span>
          <span className="font-semibold text-text-main">{stats.avgSalesCycle || 18} Days</span>
        </div>
      </div>
    </div>
  );
}
