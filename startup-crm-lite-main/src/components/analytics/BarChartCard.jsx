import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

/**
 * Custom Tooltip component matching exact format:
 * June
 * 24 Leads
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-surface border border-border-base p-3 rounded-xl shadow-lg text-xs leading-normal">
        <p className="font-bold text-text-main">{label}</p>
        <p className="text-primary font-semibold mt-0.5">{payload[0].value} Leads</p>
      </div>
    );
  }
  return null;
};

/**
 * BarChartCard Component
 * Displays monthly lead acquisition counts for the past 6 calendar months.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of { name, count } monthly items.
 */
export default function BarChartCard({ data = [] }) {
  const hasData = data.some((item) => item.count > 0);

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-h-[380px]">
      <div>
        <h4 className="font-display font-semibold text-text-main text-sm">Monthly Lead Acquisition</h4>
        <p className="text-xs text-text-subtle mt-0.5">New lead records created per month</p>
      </div>

      <div className="flex-1 w-full min-h-[220px] mt-6 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                allowDecimals={false}
                label={{ value: 'Lead Count', angle: -90, position: 'insideLeft', offset: 5, fill: 'var(--text-subtle)', fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-surface-hover)', opacity: 0.4 }} />
              <Bar
                dataKey="count"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
                animationDuration={850}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-text-subtle text-xs flex flex-col justify-center items-center">
            <p>No historical monthly leads recorded</p>
            <p className="text-[10px] mt-1">Acquired leads will be graphed across the timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}
