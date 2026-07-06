import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../constants/analyticsColors';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs font-sans">
        <p className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">{data.payload.name}</p>
        <p className="text-slate-550 dark:text-slate-450 font-medium">
          Conversion: <span className="font-bold text-[#22C55E] dark:text-emerald-400 text-sm">{data.value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export const LineChartCard = ({ conversionTrend = [] }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Monthly Conversion Trend</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lead-to-Won conversion rate over the last 6 months</p>
      </div>

      <div className="h-64 w-full flex-1 min-h-[240px]">
        {conversionTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={conversionTrend} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-slate-800" />
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
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="Conversion Rate" 
                stroke={CHART_COLORS.success} 
                strokeWidth={3}
                dot={{ r: 4, stroke: CHART_COLORS.success, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, stroke: CHART_COLORS.success, strokeWidth: 0, fill: CHART_COLORS.success }}
                isAnimationActive
                animationDuration={950}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
            No conversion history records found
          </div>
        )}
      </div>
    </div>
  );
};

export default LineChartCard;
