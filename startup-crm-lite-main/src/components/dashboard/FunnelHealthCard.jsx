/**
 * @file components/dashboard/FunnelHealthCard.jsx
 * @description Extracted from Dashboard.jsx — displays 3 progress-bar metrics
 * (qualified conversion, active deals ratio, win rate) plus an AI insight callout.
 *
 * Extracted to satisfy SRP: Dashboard.jsx was previously managing both KPI logic
 * and inline rendering of this 100-line UI block.
 *
 * @module components/dashboard/FunnelHealthCard
 */

import { Sparkles } from 'lucide-react';

/**
 * A single labelled progress bar.
 *
 * @param {object} props
 * @param {string} props.label       - Metric label text
 * @param {number} props.value       - 0–100 percentage value
 * @param {string} props.colorClass  - Tailwind bg-* class for the fill bar
 */
function MetricBar({ label, value, colorClass }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-600 dark:text-slate-300 font-medium">
          {label}
        </span>
        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
          {value}%
        </span>
      </div>
      <div
        className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${value}%`}
      >
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/**
 * FunnelHealthCard Component
 *
 * @param {object} props
 * @param {number} props.conversionRate   - Qualified conversion percentage (0–100)
 * @param {number} props.activeDealRatio  - Active deals as % of total leads (0–100)
 * @param {number} props.winRate          - Sales win rate percentage (0–100)
 */
export default function FunnelHealthCard({ conversionRate, activeDealRatio, winRate }) {
  return (
    <div className="premium-card p-5 flex flex-col gap-5" aria-label="Funnel health summary">

      {/* Card header */}
      <div>
        <h2 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
          Funnel Health
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Key conversion velocity metrics
        </p>
      </div>

      {/* Progress metrics */}
      <div className="flex flex-col gap-5 flex-1 justify-center">
        <MetricBar
          label="Qualified Conversion"
          value={conversionRate}
          colorClass="bg-blue-500"
        />
        <MetricBar
          label="Active Deals Ratio"
          value={activeDealRatio}
          colorClass="bg-amber-500"
        />
        <MetricBar
          label="Sales Win Rate"
          value={winRate}
          colorClass="bg-emerald-500"
        />
      </div>

      {/* AI insight callout */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-start gap-2.5">
        <Sparkles
          size={15}
          className="text-amber-500 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-semibold text-slate-900 dark:text-white">AI Insight: </span>
          LinkedIn-sourced leads convert{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">24% faster</span>{' '}
          than outbound. Consider reallocating budget here.
        </p>
      </div>
    </div>
  );
}
