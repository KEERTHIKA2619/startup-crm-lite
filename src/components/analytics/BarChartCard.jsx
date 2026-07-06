import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../constants/analyticsColors';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs font-sans">
        <p className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">{data.payload.name}</p>
        <p className="text-slate-550 dark:text-slate-450 font-medium">
          <span className="font-bold text-[#2563EB] dark:text-indigo-400 text-sm">{data.value}</span> Leads
        </p>
      </div>
    );
  }
  return null;
};

export const BarChartCard = ({ monthlyLeads = [] }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Monthly Leads Trend</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lead acquisition volumes over the last 6 months</p>
      </div>

      <div className="h-64 w-full flex-1 min-h-[240px]">
        {monthlyLeads.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyLeads} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
              <XAxis 
                dataKey="name" 
                stroke="#94A3B8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                dy={8}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                dx={-8}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="Lead Count" 
                fill={CHART_COLORS.primary} 
                radius={[6, 6, 0, 0]} 
                maxBarSize={38}
                isAnimationActive
                animationDuration={900}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
            No historical trend records found
          </div>
        )}
      </div>
    </div>
  );
};

export default BarChartCard;
