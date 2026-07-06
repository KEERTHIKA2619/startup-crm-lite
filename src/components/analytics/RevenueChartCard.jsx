import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../constants/analyticsColors';

// Indian currency formatter
const formatINR = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num || 0);
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs font-sans">
        <p className="font-bold text-slate-800 dark:text-slate-100 mb-0.5">{data.payload.name} Revenue</p>
        <p className="text-slate-550 dark:text-slate-450 font-medium">
          Won Revenue: <span className="font-bold text-[#22C55E] dark:text-emerald-400 text-sm">{formatINR(data.value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChartCard = ({ revenueTrend = [] }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Revenue Analytics</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Closed won deal revenue over the last 6 months</p>
      </div>

      <div className="h-64 w-full flex-1 min-h-[240px]">
        {revenueTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              
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
                tickFormatter={(val) => {
                  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
                  return `₹${val}`;
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area 
                type="monotone" 
                dataKey="Revenue" 
                stroke={CHART_COLORS.success} 
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                isAnimationActive
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
            No won revenue history found
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChartCard;
