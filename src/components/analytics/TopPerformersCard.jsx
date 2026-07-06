import React from 'react';
import { Trophy, Award, Medal } from 'lucide-react';

const formatINR = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num || 0);
};

export const TopPerformersCard = ({ performers = [] }) => {
  // Find highest performer value to use as progress bar baseline (100%)
  const maxRevenue = performers.length > 0 ? performers[0].value : 0;

  // Custom medal icons for top 3
  const getRankBadge = (idx) => {
    if (idx === 0) return <Trophy className="w-4 h-4 text-amber-500" />;
    if (idx === 1) return <Medal className="w-4 h-4 text-slate-400" />;
    if (idx === 2) return <Medal className="w-4 h-4 text-amber-700" />;
    return <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-4 text-center">{idx + 1}</span>;
  };

  const getAvatarColor = (name) => {
    const colors = {
      Sarah: 'bg-indigo-500 text-white',
      Alex: 'bg-sky-500 text-white',
      David: 'bg-emerald-500 text-white'
    };
    return colors[name] || 'bg-slate-500 text-white';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Top Performers</h3>
          <p className="text-xs text-slate-550 dark:text-slate-450">Ranking sales representatives by closed won deal value</p>
        </div>
        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500">
          <Award className="w-4 h-4" />
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="space-y-4 flex-1">
        {performers.length > 0 ? (
          performers.map((rep, idx) => {
            // Percent relative to the top seller
            const percentage = maxRevenue > 0 ? Math.round((rep.value / maxRevenue) * 100) : 0;
            const initials = rep.name.slice(0, 2).toUpperCase();

            return (
              <div 
                key={idx} 
                className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 hover:border-slate-200/50 transition-all duration-150 group"
              >
                {/* Ranking Medal/Number */}
                <div className="shrink-0 flex items-center justify-center w-6">
                  {getRankBadge(idx)}
                </div>

                {/* Avatar */}
                <div className={`w-8.5 h-8.5 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 shadow-sm ${getAvatarColor(rep.name)}`}>
                  {initials}
                </div>

                {/* Info & Progress */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#2563EB] dark:group-hover:text-indigo-400 transition-colors">
                      {rep.name}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0">
                      {formatINR(rep.value)}
                    </span>
                  </div>

                  {/* Relative bar indicator */}
                  <div className="w-full h-1.5 bg-slate-200/60 dark:bg-slate-805 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#2563EB] to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold py-8">
            No performers data available yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TopPerformersCard;
