/**
 * LoadingSkeleton Component
 * Renders shimmering pulse mockups for all KPI cards and chart cards.
 * Provides real-time query loading states.
 */
export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* 6 KPI Cards Shimmer Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm flex flex-col justify-between h-[130px]"
          >
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="space-y-2 mt-4">
              <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-24 h-6 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 10 Visual Chart Panels Shimmer Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm h-[380px] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-300 dark:bg-slate-750 rounded" />
              <div className="w-48 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="flex-1 w-full mt-6 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center">
              <div className="w-[85%] h-[60%] flex flex-col justify-between">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="w-full h-[1px] bg-slate-200 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
