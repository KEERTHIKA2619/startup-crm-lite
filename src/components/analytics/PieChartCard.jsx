import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from 'recharts';

// Custom active shape for the doughnut slice hover expansion
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

// Custom tooltip renderer
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg font-sans text-xs">
        <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{data.name}</p>
        <div className="space-y-0.5 text-slate-500 dark:text-slate-400">
          <p><span className="font-semibold text-slate-700 dark:text-slate-350">{data.value}</span> Leads</p>
          <p><span className="font-semibold text-slate-700 dark:text-slate-350">{data.percentage}%</span> of total</p>
        </div>
      </div>
    );
  }
  return null;
};

export const PieChartCard = ({ statusDistribution = [] }) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  // Compute total leads across all statuses
  const totalLeads = statusDistribution.reduce((sum, item) => sum + item.value, 0);

  // Sort distribution to display high-lead items first (Won, Proposal, Meeting, etc.)
  const sortedDistribution = [...statusDistribution].sort((a, b) => b.value - a.value);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Lead Status Distribution</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Breakdown of leads by current funnel status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 flex-1">
        {/* Doughnut Chart container */}
        <div className="relative h-56 flex justify-center items-center">
          {totalLeads > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationDuration={800}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                
                {/* Center SVG Label */}
                <text
                  x="50%"
                  y="47%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-900 dark:fill-white font-extrabold text-2xl"
                >
                  {totalLeads}
                </text>
                <text
                  x="50%"
                  y="56%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-400 dark:fill-slate-500 font-bold text-[10px] uppercase tracking-wider"
                >
                  Total Leads
                </text>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-400 font-semibold">No status data available</div>
          )}
        </div>

        {/* Legend Panel */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
          {sortedDistribution.map((entry, index) => {
            if (entry.value === 0) return null; // Hide empty stages to keep legend crisp
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/80 hover:border-slate-200/50 transition-colors"
                onMouseEnter={() => {
                  const rawIndex = statusDistribution.findIndex(item => item.name === entry.name);
                  setActiveIndex(rawIndex);
                }}
                onMouseLeave={onPieLeave}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-md shrink-0 transition-transform duration-200"
                    style={{
                      backgroundColor: entry.color,
                      transform: activeIndex === statusDistribution.findIndex(item => item.name === entry.name) ? 'scale(1.15)' : 'scale(1)'
                    }}
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                    {entry.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                  <span className="text-slate-905 dark:text-white font-bold">{entry.value}</span>
                  <span className="text-slate-400 dark:text-slate-500">({entry.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PieChartCard;
