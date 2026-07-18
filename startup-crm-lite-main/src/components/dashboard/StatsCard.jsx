/**
 * @file StatsCard.jsx
 * @description A single KPI metric card used in the Dashboard summary row.
 *
 * Displays:
 *  - A coloured icon badge in the top-right corner
 *  - A label (title) above the main value
 *  - A large numeric value (formatted via Intl.NumberFormat where applicable)
 *  - A percentage change badge indicating trend vs. last month
 *  - A subtle sparkline placeholder stripe at the card bottom
 *
 * @module components/dashboard/StatsCard
 */

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maps a semantic color name to the Tailwind utility classes used for the
 * icon container and the card's top accent border.
 *
 * @param {'primary'|'success'|'warning'|'danger'} color
 * @returns {{ bg: string, text: string, border: string }}
 */
function resolveColorClasses(color) {
  const map = {
    primary: {
      bg:     'bg-blue-500/10 dark:bg-blue-500/15',
      text:   'text-blue-600 dark:text-blue-400',
      border: 'border-t-blue-500',
      glow:   'shadow-blue-500/10',
    },
    success: {
      bg:     'bg-emerald-500/10 dark:bg-emerald-500/15',
      text:   'text-emerald-600 dark:text-emerald-400',
      border: 'border-t-emerald-500',
      glow:   'shadow-emerald-500/10',
    },
    warning: {
      bg:     'bg-amber-500/10 dark:bg-amber-500/15',
      text:   'text-amber-600 dark:text-amber-400',
      border: 'border-t-amber-500',
      glow:   'shadow-amber-500/10',
    },
    danger: {
      bg:     'bg-red-500/10 dark:bg-red-500/15',
      text:   'text-red-600 dark:text-red-400',
      border: 'border-t-red-500',
      glow:   'shadow-red-500/10',
    },
  };
  return map[color] ?? map.primary;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * StatsCard — a self-contained KPI metric tile.
 *
 * @param {object}          props
 * @param {string}          props.title   - Short metric label, e.g. "Total Leads"
 * @param {string|number}   props.value   - The main display value, e.g. "$48,000" or 15
 * @param {React.ElementType} props.icon  - A Lucide icon component (not an instance)
 * @param {number}          props.change  - Percentage change vs. previous period.
 *                                          Positive = up, negative = down, 0 = neutral.
 * @param {'primary'|'success'|'warning'|'danger'} props.color
 *                                        - Semantic colour used for icon + accent.
 * @param {string}          [props.subtitle] - Optional line beneath the value.
 *
 * @returns {JSX.Element}
 *
 * @example
 * <StatsCard
 *   title="Total Leads"
 *   value={leads.length}
 *   icon={Users}
 *   change={12}
 *   color="primary"
 * />
 */
export default function StatsCard({
  title,
  value,
  icon: Icon,   // destructure as Icon so JSX treats it as a component
  change = 0,
  color = 'primary',
  subtitle,
}) {
  // Resolve Tailwind classes for the chosen semantic color
  const colors = resolveColorClasses(color);

  // Determine trend direction
  const isUp      = change > 0;
  const isDown    = change < 0;

  // Pick the correct trend icon and colour classes
  const TrendIcon      = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus;
  const trendTextClass = isUp
    ? 'text-emerald-600 dark:text-emerald-400'
    : isDown
    ? 'text-red-600 dark:text-red-400'
    : 'text-slate-500 dark:text-slate-400';

  return (
    /*
     * Card shell:
     *  - premium-card applies our global shadow/border/hover rules from index.css
     *  - border-t-2 + color-specific border-t-* creates the coloured top accent
     *  - group enables child hover utilities
     */
    <article
      className={[
        'premium-card p-5 border-t-2 flex flex-col gap-4 group',
        colors.border,
        // Soft coloured glow on hover
        `hover:shadow-lg ${colors.glow}`,
      ].join(' ')}
      aria-label={`${title}: ${value}`}
    >
      {/* ── Top row: label + icon badge ──────────────────────────────────── */}
      <div className="flex items-start justify-between">

        {/* Metric label */}
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
          {title}
        </span>

        {/* Coloured icon badge — grows slightly on card hover */}
        <div
          className={[
            'p-2 rounded-lg transition-transform duration-200 group-hover:scale-110',
            colors.bg,
            colors.text,
          ].join(' ')}
          aria-hidden="true"
        >
          {/* Icon is passed as a component reference; size fixed at 16 px */}
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>

      {/* ── Main value ───────────────────────────────────────────────────── */}
      <div>
        <p
          className="font-display font-bold text-3xl text-slate-900 dark:text-white leading-none tracking-tight"
          aria-live="polite"
        >
          {value}
        </p>

        {/* Optional subtitle line */}
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Bottom row: trend badge ───────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        {/* Trend icon */}
        <TrendIcon
          size={13}
          className={trendTextClass}
          aria-hidden="true"
        />

        {/* Percentage label */}
        <span className={`text-[11px] font-semibold ${trendTextClass}`}>
          {isUp ? '+' : ''}{change}%
        </span>

        {/* Context label */}
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          vs last month
        </span>
      </div>
    </article>
  );
}
