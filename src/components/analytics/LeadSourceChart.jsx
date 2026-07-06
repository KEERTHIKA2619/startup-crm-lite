import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS } from '../../constants/analyticsColors';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs font-sans">
        <p className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">{data.payload.name}</p>
        <p className="text-slate-550 dark:text-slate-450 font-medium">
          Leads count: <span className="font-bold text-[#2563EB] dark:text-indigo-400 text-sm">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const LeadSourceChart = ({ leadSources = [] }) => {
  // Take top 6 sources for clean layout display
  const topSources = leadSources.slice(0, 6);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Lead Acquisition Channels</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lead volume grouped by origin channel source</p>
      </div>

      <div className="h-64 w-full flex-1 min-h-[240px]">
        {topSources.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topSources}
              margin={{ top: 10, right: 30, left: 15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
              
              <XAxis 
                type="number"
                stroke="#94A3B8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                dy={8}
                allowDecimals={false}
              />
              
              <YAxis 
                type="category"
                dataKey="name"
                stroke="#94A3B8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                dx={-8}
                width={85}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Bar 
                dataKey="value" 
                fill={CHART_COLORS.primary} 
                radius={[0, 6, 6, 0]} 
                maxBarSize={24}
                isAnimationActive
                animationDuration={900}
              >
                {/* Varying opacities to create visual hierarchy in horizontal bars */}
                {topSources.map((entry, index) => {
                  const opacities = [1.0, 0.85, 0.7, 0.6, 0.5, 0.4];
                  const opacity = opacities[index % opacities.length];
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS.primary}
                      fillOpacity={opacity}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
            No source acquisition records found
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadSourceChart;
