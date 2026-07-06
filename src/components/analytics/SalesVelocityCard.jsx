import React, { useState } from 'react';
import { HelpCircle, Sparkles, TrendingDown, TrendingUp, Info } from 'lucide-react';

const formatINR = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num || 0);
};

export const SalesVelocityCard = ({ currentVelocity = 0, prevVelocity = 0, currentKPIs }) => {
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Compute velocity percentage change
  let changePercent = 0;
  let isPositive = true;
  if (prevVelocity > 0) {
    const diff = currentVelocity - prevVelocity;
    changePercent = Math.round((diff / prevVelocity) * 100);
    isPositive = changePercent >= 0;
  }

  // Fallbacks for the breakdown display
  const oppsCount = currentKPIs?.total - (currentKPIs?.wonRevenue > 0 ? 1 : 0); // Active and won
  const winRate = currentKPIs?.conversionRate || 0;
  const cycleDays = currentKPIs?.avgSalesCycle || 14;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/0 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Sales Velocity</h3>
            <button 
              onClick={() => setShowFormulaInfo(!showFormulaInfo)}
              className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 focus:outline-none"
              title="Show formula details"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-550 dark:text-slate-450">Speed at which pipeline generates revenue</p>
        </div>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-[#2563EB] dark:text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric Display */}
      <div className="my-5">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#2563EB] dark:text-indigo-400 tracking-tight">
          {formatINR(currentVelocity)}
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-450 ml-1">/ day</span>
        </h2>

        {/* Comparative Trend Tag */}
        <div className="flex items-center gap-1.5 mt-2">
          {prevVelocity > 0 ? (
            isPositive ? (
              <span className="inline-flex items-center text-xs font-bold text-[#22C55E] bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                +{changePercent}%
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-bold text-[#EF4444] bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
                {changePercent}%
              </span>
            )
          ) : (
            <span className="inline-flex items-center text-xs font-semibold text-slate-450 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
              Stable
            </span>
          )}
          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">
            vs prior period ({formatINR(prevVelocity)}/day)
          </span>
        </div>
      </div>

      {/* Formula Info Callout (Toggleable) */}
      {showFormulaInfo && (
        <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-xl p-3 mb-4 text-[10px] text-slate-550 dark:text-slate-400 space-y-1.5 animate-in fade-in duration-200">
          <p className="font-bold flex items-center gap-1 text-[#2563EB] dark:text-indigo-400 uppercase tracking-wide">
            <Info className="w-3.5 h-3.5" />
            Formula:
          </p>
          <div className="font-mono bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800 text-center">
            (Opps × Win Rate% × Avg Size) ÷ Cycle
          </div>
          <p className="text-[9px] leading-relaxed mt-1.5">
            This indicates how much money is flowing through your sales pipeline every single day. Optimize it by shortening your Sales Cycle, increasing your Win Rate, or raising your Average Deal size.
          </p>
        </div>
      )}

      {/* Pipeline Component Indicators Grid */}
      <div className="grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
        <div className="text-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50">
          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Opps</span>
          <span className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-0.5 block">{oppsCount} active</span>
        </div>
        <div className="text-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50">
          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Win Rate</span>
          <span className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-0.5 block">{winRate}%</span>
        </div>
        <div className="text-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50">
          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Sales Cycle</span>
          <span className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-0.5 block">{cycleDays} Days</span>
        </div>
      </div>
    </div>
  );
};

export default SalesVelocityCard;
