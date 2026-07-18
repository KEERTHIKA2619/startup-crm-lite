import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

/**
 * Custom Tooltip component matching exact format:
 * June
 * 31%
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-surface border border-border-base p-3 rounded-xl shadow-lg text-xs leading-normal">
        <p className="font-bold text-text-main">{label}</p>
        <p className="text-success font-semibold mt-0.5">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

/**
 * LineChartCard Component
 * Displays closed-won conversion rate percentage trends over the last 6 calendar months.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of { name, conversionRate } monthly items.
 */
export default function LineChartCard({ data = [] }) {
  const hasData = data.some((item) => item.conversionRate > 0);

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-h-[380px]">
      <div>
        <h4 className="font-display font-semibold text-text-main text-sm">Monthly Lead Conversion Rate</h4>
        <p className="text-xs text-text-subtle mt-0.5">Percentage of leads won per month</p>
      </div>

      <div className="flex-1 w-full min-h-[220px] mt-6 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="conversionRate"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-surface)' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#22C55E' }}
                animationDuration={850}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-text-subtle text-xs flex flex-col justify-center items-center">
            <p>No conversion history recorded</p>
            <p className="text-[10px] mt-1">Convert leads to Closed Won to plot the sales velocity line.</p>
          </div>
        )}
      </div>
    </div>
  );
}
