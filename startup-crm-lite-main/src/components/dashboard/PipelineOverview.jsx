/**
 * @file PipelineOverview.jsx
 * @description Visual pipeline health card for the CRM Dashboard.
 *
 * Renders a stacked horizontal progress bar where each segment represents one
 * lead status stage. Below the bar, a legend row maps each colour to its stage
 * name and count.
 *
 * The bar uses percentage widths so it always fills 100 % of the card width,
 * even when the lead distribution changes. Segments narrower than ~2 % are
 * hidden to avoid rendering slivers that would break the layout.
 *
 * @module components/dashboard/PipelineOverview
 */

// ─── Stage configuration ──────────────────────────────────────────────────────

/**
 * Ordered list of pipeline stages.
 * Order here controls the left→right visual order in the bar.
 *
 * @typedef  {object} StageConfig
 * @property {string} key    - Matches the `status` field on a lead object
 * @property {string} label  - Human-readable display name
 * @property {string} bg     - Tailwind background class for the bar segment
 * @property {string} dot    - Tailwind background class for the legend dot
 * @property {string} text   - Tailwind text class for the count badge
 */

/** @type {StageConfig[]} */
const STAGE_CONFIG = [
  { key: 'New',         label: 'New',         bg: 'bg-slate-400',   dot: 'bg-slate-400',   text: 'text-slate-500' },
  { key: 'Contacted',   label: 'Contacted',   bg: 'bg-amber-400',   dot: 'bg-amber-400',   text: 'text-amber-600' },
  { key: 'Qualified',   label: 'Qualified',   bg: 'bg-blue-400',    dot: 'bg-blue-400',    text: 'text-blue-600'  },
  { key: 'Proposal',    label: 'Proposal',    bg: 'bg-violet-500',  dot: 'bg-violet-500',  text: 'text-violet-600'},
  { key: 'Negotiation', label: 'Negotiation', bg: 'bg-orange-500',  dot: 'bg-orange-500',  text: 'text-orange-600'},
  { key: 'Won',         label: 'Won',         bg: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600'},
  { key: 'Lost',        label: 'Lost',        bg: 'bg-red-400',     dot: 'bg-red-400',     text: 'text-red-500'   },
];

// ─── Sub-component ────────────────────────────────────────────────────────────

/**
 * A single coloured segment of the stacked bar.
 *
 * @param {object} props
 * @param {string} props.bg      - Tailwind background class
 * @param {number} props.pct     - Width as a CSS percentage string, e.g. "34.6%"
 * @param {string} props.label   - Stage name for the aria-label
 * @param {number} props.count   - Number of leads in this segment
 */
function BarSegment({ bg, pct, label, count }) {
  return (
    <div
      role="presentation"
      aria-label={`${label}: ${count} leads (${pct})`}
      title={`${label}: ${count} leads`}
      className={[
        'h-full transition-all duration-500',
        // Round first segment left, last segment right for pill shape
        'first:rounded-l-full last:rounded-r-full',
        bg,
      ].join(' ')}
      style={{ width: pct }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * PipelineOverview — stacked horizontal bar showing lead stage distribution.
 *
 * @param {object}   props
 * @param {Array}    props.leads - Full leads array from LeadContext or sample data.
 *                                Each element must have a `status` string field.
 *
 * @returns {JSX.Element}
 *
 * @example
 * <PipelineOverview leads={leads} />
 */
export default function PipelineOverview({ leads = [] }) {
  const total = leads.length;

  // ── Compute per-stage counts and percentages ──────────────────────────────
  /** @type {{ config: StageConfig, count: number, pct: string }[]} */
  const stages = STAGE_CONFIG.map((config) => {
    const count = leads.filter((l) => l.status === config.key).length;
    // Percentage rounded to 1 decimal; fallback to "0%" when total is 0
    const pct = total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%';
    return { config, count, pct };
  });

  // Stages that actually have leads (used to skip zero-width segments)
  const activeStages = stages.filter((s) => s.count > 0);

  return (
    <section
      className="premium-card p-5 flex flex-col gap-5"
      aria-label="Pipeline stages overview"
    >
      {/* ── Card header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
            Pipeline Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {total} total lead{total !== 1 ? 's' : ''} across all stages
          </p>
        </div>

        {/* Stage count badge */}
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {activeStages.length} active stage{activeStages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Stacked progress bar ─────────────────────────────────────────── */}
      {total > 0 ? (
        <div
          className="w-full h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex"
          role="img"
          aria-label="Pipeline distribution bar"
        >
          {activeStages.map(({ config, count, pct }) => (
            <BarSegment
              key={config.key}
              bg={config.bg}
              pct={pct}
              label={config.label}
              count={count}
            />
          ))}
        </div>
      ) : (
        // Empty state when there are no leads yet
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800" />
      )}

      {/* ── Legend grid ──────────────────────────────────────────────────── */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-3">
        {stages.map(({ config, count, pct }) => (
          <div
            key={config.key}
            className="flex flex-col gap-1"
          >
            {/* Dot + stage name */}
            <dt className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`}
                aria-hidden="true"
              />
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {config.label}
              </span>
            </dt>

            {/* Count + percentage */}
            <dd className="pl-3.5 flex items-baseline gap-1">
              <span className={`text-sm font-bold ${count > 0 ? config.text : 'text-slate-300 dark:text-slate-700'}`}>
                {count}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-600">
                {pct}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
