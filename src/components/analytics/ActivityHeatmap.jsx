import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export const ActivityHeatmap = ({ heatmapData = [] }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const monthName = now.toLocaleString('en-US', { month: 'long' });

  // Compute days in month
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon ...
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Create array of days padding + month days
  const gridCells = [];
  
  // Padding cells
  for (let i = 0; i < startDayOfWeek; i++) {
    gridCells.push({ isPadding: true });
  }

  // Active days
  for (let day = 1; day <= totalDays; day++) {
    // Construct date key (YYYY-MM-DD)
    const monthKey = String(month + 1).padStart(2, '0');
    const dayKey = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthKey}-${dayKey}`;

    // Find matching activity
    const match = heatmapData.find(d => d.date === dateStr);
    const count = match ? match.count : 0;

    gridCells.push({
      isPadding: false,
      day,
      dateStr,
      count
    });
  }

  // Activity cell bg color mapper
  const getCellColor = (count) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700';
    if (count <= 1) return 'bg-indigo-100 dark:bg-indigo-900/35 hover:opacity-85 text-indigo-900 dark:text-indigo-200';
    if (count <= 2) return 'bg-indigo-300 dark:bg-indigo-750/70 hover:opacity-85 text-indigo-950 dark:text-indigo-100';
    if (count <= 4) return 'bg-[#2563EB]/70 dark:bg-indigo-600/85 hover:opacity-85 text-white';
    return 'bg-[#2563EB] dark:bg-indigo-500 hover:opacity-85 text-white';
  };

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Activity Heatmap</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Daily sales actions calendar (created, meetings, closed)</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-[#2563EB] dark:text-indigo-400" />
            <span>{monthName} {year}</span>
          </div>
        </div>

        {/* Heatmap Grid Layout */}
        <div className="mt-6 space-y-2 select-none relative">
          
          {/* Day Headers row */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {dayHeaders.map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Grid Blocks */}
          <div className="grid grid-cols-7 gap-2">
            {gridCells.map((cell, idx) => {
              if (cell.isPadding) {
                return <div key={`pad-${idx}`} className="aspect-square bg-transparent" />;
              }

              const isHovered = hoveredDay === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  onMouseEnter={() => setHoveredDay(cell.dateStr)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all duration-150 relative ${getCellColor(cell.count)}`}
                >
                  <span>{cell.day}</span>

                  {/* Tooltip Popup */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-44 bg-slate-950 text-white border border-slate-800 rounded-xl p-2.5 shadow-xl text-[10px] font-sans text-center leading-normal animate-in fade-in zoom-in-95 duration-150">
                      <p className="font-bold text-indigo-400 mb-0.5">
                        {new Date(cell.dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="font-medium text-slate-300">
                        {cell.count === 0 ? 'No sales activity recorded' : `${cell.count} Action units logged`}
                      </p>
                      {/* Arrow tail */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 rotate-45 border-r border-b border-slate-800" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-end gap-1.5 text-[9px] font-bold text-slate-450 dark:text-slate-550 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
        <span>Less</span>
        <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
        <span className="w-2.5 h-2.5 rounded-sm bg-indigo-100 dark:bg-indigo-900/35" />
        <span className="w-2.5 h-2.5 rounded-sm bg-indigo-300 dark:bg-indigo-750/70" />
        <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]/70 dark:bg-indigo-650" />
        <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB] dark:bg-indigo-500" />
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
