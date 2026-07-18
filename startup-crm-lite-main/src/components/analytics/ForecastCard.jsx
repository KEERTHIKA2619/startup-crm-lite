import { ArrowUpRight, ArrowDownRight, Compass, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * ForecastCard Component
 * Displays predicted next month won revenue with confidence levels and growth trend.
 *
 * @param {Object} props
 * @param {Object} props.forecast - Object containing predictedRevenue, confidenceScore, and growthTrend.
 */
export default function ForecastCard({ forecast = {} }) {
  const { predictedRevenue = 0, confidenceScore = 0, growthTrend = 0 } = forecast;
  const isPositive = growthTrend > 0;

  // Determine color matching confidence rating
  let confidenceColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/30';
  let confidenceBar = 'bg-rose-500';
  if (confidenceScore >= 80) {
    confidenceColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
    confidenceBar = 'bg-emerald-500';
  } else if (confidenceScore >= 60) {
    confidenceColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/30';
    confidenceBar = 'bg-amber-500';
  }

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[350px]">
      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-display font-semibold text-text-main text-sm">Revenue Forecast</h4>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Compass className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xs text-text-subtle mt-0.5">Projected won values based on trailing metrics</p>
      </div>

      <div className="my-6">
        <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider block">
          Predicted Revenue Next Month
        </span>
        <h3 className="font-display font-bold text-3xl text-text-main mt-1 tracking-tight">
          {formatCurrency(predictedRevenue)}
        </h3>

        {growthTrend !== 0 ? (
          <div className="flex items-center gap-1 mt-2">
            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
            }`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{Math.abs(growthTrend)}%</span>
            </div>
            <span className="text-[10px] text-text-subtle">
              MoM forecast velocity
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-text-subtle mt-2 block">
            Flat growth trajectory projected
          </span>
        )}
      </div>

      {/* Confidence Rating Progress bar */}
      <div className="border-t border-border-base pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-text-subtle" />
            <span>Forecasting Confidence</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${confidenceColor}`}>
            {confidenceScore}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-bg-base rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${confidenceBar}`}
            style={{ width: `${confidenceScore}%` }}
          />
        </div>
        <p className="text-[10px] text-text-subtle leading-relaxed">
          Forecast logic averages trailing 6-months won conversions. Consistency in monthly sales closures increases confidence ratings.
        </p>
      </div>
    </div>
  );
}
