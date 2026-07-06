import React from 'react';

export const LoadingSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>

      {/* KPI Cards Skeletons (6 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-3.5 w-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col space-y-4"
          >
            <div className="space-y-2">
              <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800/60 rounded-md animate-pulse" />
            </div>
            <div className="h-64 w-full bg-slate-50 dark:bg-slate-950 rounded-xl animate-pulse flex items-end justify-between p-4">
              <div className="h-full w-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500 animate-spin" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
