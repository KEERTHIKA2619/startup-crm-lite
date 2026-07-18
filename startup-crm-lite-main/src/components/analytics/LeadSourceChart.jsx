import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { SOURCE_COLORS } from '../../constants/analyticsColors';

/**
 * Custom Tooltip component.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-bg-surface border border-border-base p-3 rounded-xl shadow-lg text-xs leading-normal">
        <p className="font-bold text-text-main">{data.name}</p>
        <p className="text-primary font-semibold mt-0.5">{data.value} Leads</p>
      </div>
    );
  }
  return null;
};

/**
 * LeadSourceChart Component
 * Renders a horizontal bar chart showing lead acquisition counts grouped by marketing sources.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of { name, value } source items.
 */
export default function LeadSourceChart({ data = [] }) {
  const hasData = data.some((item) => item.value > 0);
  const activeData = data.filter((item) => item.value > 0);

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-h-[380px]">
      <div>
        <h4 className="font-display font-semibold text-text-main text-sm">Lead Acquisitions by Source</h4>
        <p className="text-xs text-text-subtle mt-0.5">Marketing and outbound channel yield breakdown</p>
      </div>

      <div className="flex-1 w-full min-h-[220px] mt-6 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeData}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-base)" opacity={0.6} />
              <XAxis
                type="number"
                stroke="var(--text-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--text-subtle)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-surface-hover)', opacity: 0.4 }} />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                maxBarSize={16}
                animationDuration={850}
              >
                {activeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SOURCE_COLORS[entry.name] || '#6B7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-text-subtle text-xs flex flex-col justify-center items-center">
            <p>No active lead sources to display</p>
            <p className="text-[10px] mt-1">Lead sources will update dynamically when leads are logged.</p>
          </div>
        )}
      </div>
    </div>
  );
}
