import { useState } from 'react';
import { Calendar as CalendarIcon, Info } from 'lucide-react';

/**
 * ActivityHeatmap Component
 * Displays a GitHub-style 30-day activity contribution calendar.
 * Tracks: Leads Created, Meetings Scheduled, and Calls Logged.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of 30-day activity items.
 */
export default function ActivityHeatmap({ data = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (day, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
    setHoveredDay(day);
    setHoverPos({
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top - 8
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Determine contribution block color depending on total activity count
  const getBlockColorClass = (val) => {
    if (val === 0) return 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-800';
    if (val === 1) return 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300';
    if (val === 2) return 'bg-emerald-300 dark:bg-emerald-800/50 border-emerald-400 dark:border-emerald-700/40 text-emerald-900 dark:text-emerald-100';
    return 'bg-emerald-500 border-emerald-600 text-white';
  };

  const totalActivityCount = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[380px]">
      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-display font-semibold text-text-main text-sm">Activity Heatmap</h4>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xs text-text-subtle mt-0.5">30-day trail of CRM touchpoints and operations</p>
      </div>

      {/* Grid container with custom hover details tooltip */}
      <div className="relative my-6 flex flex-col items-center">
        {/* Hover Tooltip Overlay */}
        {hoveredDay && (
          <div
            className="absolute z-20 bg-bg-surface border border-border-base px-3 py-2 rounded-xl shadow-xl text-[10px] leading-normal pointer-events-none -translate-x-1/2 -translate-y-full flex flex-col gap-1 min-w-[120px]"
            style={{ left: hoverPos.x, top: hoverPos.y }}
          >
            <p className="font-bold text-text-main border-b border-border-base/50 pb-1 mb-0.5">
              {hoveredDay.label}
            </p>
            <div className="flex items-center justify-between text-text-muted">
              <span>Leads Created:</span>
              <span className="font-semibold text-text-main">{hoveredDay.leadsCreated}</span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Meetings:</span>
              <span className="font-semibold text-text-main">{hoveredDay.meetingsScheduled}</span>
            </div>
            <div className="flex items-center justify-between text-text-muted text-[9px]">
              <span>Calls Logged:</span>
              <span className="font-semibold text-text-main">{hoveredDay.callsLogged}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-primary mt-1 border-t border-border-base/50 pt-1">
              <span>Total Activity:</span>
              <span>{hoveredDay.value}</span>
            </div>
          </div>
        )}

        {/* Heatmap Blocks Flex List */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-[360px] sm:max-w-full">
          {data.map((day) => (
            <div
              key={day.date}
              onMouseEnter={(e) => handleMouseEnter(day, e)}
              onMouseLeave={handleMouseLeave}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center text-[10px] font-semibold cursor-pointer select-none transition-all duration-150 hover:scale-105 hover:shadow-sm ${getBlockColorClass(
                day.value
              )}`}
            >
              {day.value > 0 ? day.value : ''}
            </div>
          ))}
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center gap-1.5 mt-6 text-[10px] text-text-subtle select-none">
          <span>Less</span>
          <span className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800/80 border border-border-base" />
          <span className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40" />
          <span className="w-4 h-4 rounded bg-emerald-300 dark:bg-emerald-800/50 border border-emerald-400 dark:border-emerald-700/40" />
          <span className="w-4 h-4 rounded bg-emerald-500 border border-emerald-600" />
          <span>More</span>
        </div>
      </div>

      <div className="border-t border-border-base pt-4 flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-text-subtle" />
          <span>Total Operations Logged</span>
        </div>
        <span className="font-bold text-text-main">{totalActivityCount}</span>
      </div>
    </div>
  );
}
