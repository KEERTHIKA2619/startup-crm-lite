import React from 'react';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { STATUS_COLORS } from '../../constants/analyticsColors';

// Custom tooltip for Recharts Funnel
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs font-sans">
        <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{data.name} Stage</p>
        <div className="space-y-0.5 text-slate-500 dark:text-slate-400">
          <p><span className="font-semibold text-slate-700 dark:text-slate-350">{data.value}</span> Leads</p>
          <p>Conversion: <span className="font-semibold text-slate-700 dark:text-slate-350">{data.conversion}%</span></p>
          {data.dropOff > 0 && (
            <p>Drop-off: <span className="text-[#EF4444] font-semibold">{data.dropOff}%</span></p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const FunnelChartCard = ({ funnelData = [] }) => {
  // Map data to match Recharts funnel requirement { value, name, fill }
  const formattedData = funnelData.map(item => ({
    name: item.stage,
    value: item.value,
    conversion: item.conversion,
    dropOff: item.dropOff,
    fill: STATUS_COLORS[item.stage] || '#64748B'
  }));

  // Find total leads to check if funnel has data
  const totalLeads = formattedData.length > 0 ? formattedData[0].value : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Sales Funnel Conversion</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lead progression and drop-off rate across stages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 flex-1">
        {/* Recharts Funnel visualization */}
        <div className="h-60 w-full relative flex items-center justify-center">
          {totalLeads > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart margin={{ top: 15, right: 20, left: 20, bottom: 15 }}>
                <Tooltip content={<CustomTooltip />} />
                <Funnel
                  dataKey="value"
                  data={formattedData}
                  isAnimationActive
                  animationDuration={850}
                >
                  <LabelList 
                    position="right" 
                    fill="#475569" 
                    className="dark:fill-slate-400 font-bold text-[10px]" 
                    dataKey="name" 
                    stroke="none" 
                  />
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-400 font-semibold">No funnel records available</div>
          )}
        </div>

        {/* Funnel Metrics details list */}
        <div className="space-y-3.5">
          {funnelData.map((item, idx) => {
            const color = STATUS_COLORS[item.stage] || '#64748B';
            return (
              <div 
                key={idx} 
                className="space-y-1.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/80"
              >
                {/* Header Stage Name & Count */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.stage}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{item.value} Leads</span>
                </div>

                {/* Progress bar and percentages */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-200/60 dark:bg-slate-850 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ 
                        width: `${item.conversion}%`,
                        backgroundColor: color 
                      }} 
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 dark:text-slate-500">
                    <span>Conv. Rate: {item.conversion}%</span>
                    {idx > 0 && item.dropOff > 0 ? (
                      <span className="text-[#EF4444] dark:text-rose-400">
                        Drop-off: -{item.dropOff}%
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FunnelChartCard;
