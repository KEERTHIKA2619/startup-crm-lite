import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

/**
 * Custom Tooltip component matching exact format:
 * June Revenue
 * $120,000
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-surface border border-border-base p-3 rounded-xl shadow-lg text-xs leading-normal">
        <p className="font-bold text-text-main">{label} Revenue</p>
        <p className="text-success font-semibold mt-0.5">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * RevenueChartCard Component
 * Renders a trailing monthly Closed-Won Revenue area chart with a gradient fill.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of { name, revenue } monthly items.
 */
export default function RevenueChartCard({ data = [] }) {
  const hasData = data.some((item) => item.revenue > 0);

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-h-[380px]">
      <div>
        <h4 className="font-display font-semibold text-text-main text-sm">Revenue Realization</h4>
        <p className="text-xs text-text-subtle mt-0.5">Closed-won contract values realized by month</p>
      </div>

      <div className="flex-1 w-full min-h-[220px] mt-6 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenueRealized" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-base)" opacity={0.6} />
              <XAxis
                dataKey="name"
                stroke="var(--text-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--text-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCompactCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22C55E"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenueRealized)"
                animationDuration={850}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-text-subtle text-xs flex-1 flex flex-col justify-center items-center">
            <p>No monthly won revenue realized</p>
            <p className="text-[10px] mt-1">Won deal values will be graphed across the timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}
