import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { STATUS_COLORS } from '../../constants/analyticsColors';

/**
 * Custom Tooltip component for the Pie Chart.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-bg-surface border border-border-base p-3 rounded-xl shadow-lg text-xs leading-normal">
        <p className="font-bold text-text-main">{data.name}</p>
        <p className="text-primary font-semibold mt-0.5">{data.value} Leads</p>
        <p className="text-text-subtle">{data.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

/**
 * PieChartCard Component
 * Displays a Doughnut distribution chart of lead statuses with hover expansion and center metrics.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Normalized status data.
 */
export default function PieChartCard({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const activeData = data.filter((item) => item.value > 0);
  const totalLeads = data.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-h-[380px]">
      <div>
        <h4 className="font-display font-semibold text-text-main text-sm">Lead Status Distribution</h4>
        <p className="text-xs text-text-subtle mt-0.5">Proportion of leads in each pipeline stage</p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-6 mt-4 min-h-[220px]">
        {totalLeads > 0 ? (
          <>
            {/* Pie Container */}
            <div className="relative w-40 h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={activeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    animationDuration={850}
                  >
                    {activeData.map((entry, index) => {
                      const isActive = index === activeIndex;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.name] || '#CBD5E1'}
                          stroke={isActive ? 'var(--bg-surface)' : 'none'}
                          strokeWidth={isActive ? 2 : 0}
                          style={{
                            outline: 'none',
                            cursor: 'pointer',
                            filter: isActive ? 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.15))' : 'none',
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text absolute Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-display font-bold text-2xl text-text-main leading-none">
                  {totalLeads}
                </span>
                <span className="text-[9px] font-bold text-text-subtle uppercase mt-1 tracking-wider leading-none">
                  Total Leads
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex-1 w-full max-w-[220px] space-y-2">
              {data.map((item) => {
                const color = STATUS_COLORS[item.name] || '#CBD5E1';
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs py-1 border-b border-border-base/30 last:border-b-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-text-muted truncate font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="font-bold text-text-main">{item.value}</span>
                      <span className="text-[10px] text-text-subtle min-w-[32px]">({item.percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-text-subtle text-xs flex-1 flex flex-col justify-center items-center">
            <p>No active data to display</p>
            <p className="text-[10px] mt-1">Add leads to see status distribution charts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
