import { Trophy, Medal } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * TopPerformersCard Component
 * Displays sales reps ranked by Won Revenue, with custom trophy badges and relative fill bars.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Mapped reps array sorted descending.
 */
export default function TopPerformersCard({ data = [] }) {
  const totalWonRevenue = data.reduce((sum, item) => sum + item.value, 0);
  const maxRevenue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 h-5 flex items-center justify-center font-bold text-text-subtle text-xs">{index + 1}</span>;
  };

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[350px]">
      <div>
        <h4 className="font-display font-semibold text-text-main text-sm">Top Sales Performers</h4>
        <p className="text-xs text-text-subtle mt-0.5">Reps ranked by closed-won contract volumes</p>
      </div>

      <div className="flex-1 my-6 space-y-4 flex flex-col justify-center">
        {data.length > 0 && totalWonRevenue > 0 ? (
          data.map((rep, index) => {
            const widthPercentage = maxRevenue > 0 ? Math.round((rep.value / maxRevenue) * 100) : 0;
            return (
              <div key={rep.name} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 flex items-center justify-center">
                  {getRankIcon(index)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-text-main font-semibold truncate mr-2">{rep.name}</span>
                    <span className="text-text-main flex-shrink-0">{formatCurrency(rep.value)}</span>
                  </div>
                  <div className="w-full h-2 bg-bg-base rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${widthPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-text-subtle text-xs flex flex-col justify-center items-center">
            <p>No sales reps won revenue yet</p>
            <p className="text-[10px] mt-1">Rep statistics will update as contracts are closed.</p>
          </div>
        )}
      </div>

      {totalWonRevenue > 0 && (
        <div className="border-t border-border-base pt-4 flex items-center justify-between text-xs text-text-muted">
          <span>Aggregate Closed Revenue</span>
          <span className="font-bold text-text-main">{formatCurrency(totalWonRevenue)}</span>
        </div>
      )}
    </div>
  );
}
