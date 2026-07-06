import React from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, HelpCircle } from 'lucide-react';

const formatINR = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num || 0);
};

export const ForecastCard = ({ forecast }) => {
  const { prediction = 0, growthTrend = 0, confidenceScore = 85 } = forecast || {};

  const isGrowthPositive = growthTrend >= 0;

  // Determine color matching confidence score density
  let confidenceColor = 'bg-emerald-500';
  let confidenceText = 'High predictability';
  if (confidenceScore < 60) {
    confidenceColor = 'bg-rose-500';
    confidenceText = 'Low sample size / volatile';
  } else if (confidenceScore < 80) {
    confidenceColor = 'bg-amber-500';
    confidenceText = 'Moderate predictability';
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-green-500/0 rounded-full blur-xl pointer-events-none" />

      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Revenue Forecast</h3>
          <p className="text-xs text-slate-550 dark:text-slate-450">Predictive calculation for the upcoming calendar month</p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-[#22C55E] dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>

      {/* Forecast Metric Value */}
      <div className="my-5">
        <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
          Predicted Revenue Next Month
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#22C55E] dark:text-emerald-400 tracking-tight mt-1">
          {formatINR(prediction)}
        </h2>

        {/* Growth trend indicator tag */}
        <div className="flex items-center gap-1.5 mt-2.5">
          {isGrowthPositive ? (
            <span className="inline-flex items-center text-xs font-bold text-[#22C55E] bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +{growthTrend}%
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-bold text-[#EF4444] bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              {growthTrend}%
            </span>
          )}
          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">
            predicted month-on-month growth trend
          </span>
        </div>
      </div>

      {/* Confidence Level Section */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1">
            Confidence Score
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Calculated based on lead sample size and historical consistency" />
          </span>
          <span className="text-slate-850 dark:text-slate-350">{confidenceScore}%</span>
        </div>
        
        {/* Progress gauge bar */}
        <div className="w-full h-2 bg-slate-200/60 dark:bg-slate-850 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${confidenceColor} transition-all duration-500 ease-out`} 
            style={{ width: `${confidenceScore}%` }}
          />
        </div>

        <span className="block text-[9px] text-slate-450 dark:text-slate-500 font-semibold">
          {confidenceText} based on rolling quarterly data.
        </span>
      </div>
    </div>
  );
};

export default ForecastCard;
