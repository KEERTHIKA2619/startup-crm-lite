import { ResponsiveContainer, FunnelChart, Funnel, Cell, Tooltip, LabelList } from 'recharts';
import { STATUS_COLORS } from '../../constants/analyticsColors';

/**
 * Custom Tooltip component for the Funnel Chart.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-bg-surface border border-border-base p-3 rounded-xl shadow-lg text-xs leading-normal">
        <p className="font-bold text-text-main">{data.name}</p>
        <p className="text-primary font-semibold mt-0.5">Reached Stage: {data.count} Leads</p>
        <p className="text-text-subtle">Cumulative Conversion: {data.conversionRate}%</p>
        {data.dropOff > 0 && (
          <p className="text-rose-500 font-medium">Drop-off vs Prev Stage: {data.dropOff}%</p>
        )}
      </div>
    );
  }
  return null;
};

/**
 * FunnelChartCard Component
 * Displays a Recharts Funnel Chart representing stage throughput and conversion metrics.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Funnel data structure.
 */
export default function FunnelChartCard({ data = [] }) {
  const hasData = data.some((item) => item.count > 0);

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-h-[380px]">
      <div>
        <h4 className="font-display font-semibold text-text-main text-sm">Sales Pipeline Funnel</h4>
        <p className="text-xs text-text-subtle mt-0.5">Cumulative conversion and drop-off metrics</p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-6 mt-4 min-h-[220px]">
        {hasData ? (
          <>
            {/* Funnel Chart Section */}
            <div className="w-full sm:w-1/2 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Tooltip content={<CustomTooltip />} />
                  <Funnel
                    dataKey="count"
                    data={data}
                    isAnimationActive
                    animationDuration={850}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#CBD5E1'} />
                    ))}
                    <LabelList position="right" fill="var(--text-muted)" stroke="none" dataKey="name" fontSize={11} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>

            {/* Custom List Section */}
            <div className="flex-1 w-full max-w-[220px] space-y-2">
              {data.map((item, idx) => {
                const color = STATUS_COLORS[item.name] || '#CBD5E1';
                return (
                  <div
                    key={item.name}
                    className="flex flex-col text-xs py-1.5 border-b border-border-base/30 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-text-muted truncate font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-text-main">{item.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-text-subtle mt-1">
                      <span>Conv: <strong className="text-text-muted">{item.conversionRate}%</strong></span>
                      {idx > 0 && item.dropOff > 0 && (
                        <span className="text-rose-500 font-semibold">Drop: -{item.dropOff}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-text-subtle text-xs flex-1 flex flex-col justify-center items-center">
            <p>No active data to display</p>
            <p className="text-[10px] mt-1">Leads will be graphed in the pipeline stages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
