import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * StatsCard Component
 * Renders a key metric panel with an icon, large text value, and visual status indicators.
 * Wrapped in React.memo for high rendering performance.
 */
export const StatsCard = React.memo(({ title, value, icon: Icon, change, color = 'primary' }) => {
  const changeStr = String(change);
  const isPositive = !changeStr.startsWith('-');
  const formattedChange = isPositive && !changeStr.startsWith('+') ? `+${changeStr}` : changeStr;

  const colorMap = {
    primary: {
      text: 'text-[#2563EB]',
      bg: 'bg-[#2563EB]/10',
      border: 'border-[#2563EB]/20',
    },
    success: {
      text: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/10',
      border: 'border-[#22C55E]/20',
    },
    warning: {
      text: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10',
      border: 'border-[#F59E0B]/20',
    },
    danger: {
      text: 'text-[#EF4444]',
      bg: 'bg-[#EF4444]/10',
      border: 'border-[#EF4444]/20',
    },
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">{title}</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 tracking-tight group-hover:text-[#2563EB] dark:group-hover:text-indigo-400 transition-colors truncate">
            {value}
          </h3>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${selectedColor.bg} ${selectedColor.text} ${selectedColor.border} transition-transform duration-300 group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-slate-400 dark:text-slate-550">
        <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
          isPositive 
            ? 'text-[#22C55E] bg-[#22C55E]/10' 
            : 'text-[#EF4444] bg-[#EF4444]/10'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {formattedChange}
        </span>
        <span>vs last month</span>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';
export default StatsCard;
