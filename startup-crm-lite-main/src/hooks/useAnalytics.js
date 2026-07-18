import { useState, useEffect, useMemo } from 'react';
import { useLeads } from '../context/LeadContext';
import {
  getStatusDistribution,
  getMonthlyLeads,
  getConversionByMonth,
  getRevenueByMonth,
  getPipelineValue,
  getWonRevenue,
  getAverageSalesCycle,
  getLostRate,
  getLeadSourceStats,
  getFunnelData,
  getSalesVelocity,
  getForecastRevenue,
  getTopPerformers,
  getActivityHeatmapData
} from '../utils/analyticsHelpers';

/**
 * Custom React hook to manage Analytics state, date ranges, comparison calculations,
 * and data transforms. Uses memoized selection to support large datasets.
 *
 * @returns {Object} State and analytical outputs.
 */
export function useAnalytics() {
  const { leads = [] } = useLeads();
  const [filterType, setFilterType] = useState('30_days'); // '7_days' | '30_days' | '90_days' | 'this_year' | 'custom'
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  // Expose wrapper functions that trigger loading screen animation on filter state change
  const changeFilterType = (type) => {
    setLoading(true);
    setFilterType(type);
  };

  const changeCustomRange = (range) => {
    setLoading(true);
    setCustomRange(range);
  };

  // Handle loading state cleanup
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [loading]);

  const parseDate = (d) => {
    if (!d) return null;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // 1. Calculate boundaries for current and comparison (previous) periods
  const periods = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let currentStart = null;
    let currentEnd = now;
    let prevStart = null;
    let prevEnd = null;

    if (filterType === '7_days') {
      currentStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevStart = new Date(todayStart.getTime() - 14 * 24 * 60 * 60 * 1000);
      prevEnd = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000 - 1);
    } else if (filterType === '30_days') {
      currentStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevStart = new Date(todayStart.getTime() - 60 * 24 * 60 * 60 * 1000);
      prevEnd = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000 - 1);
    } else if (filterType === '90_days') {
      currentStart = new Date(todayStart.getTime() - 90 * 24 * 60 * 60 * 1000);
      prevStart = new Date(todayStart.getTime() - 180 * 24 * 60 * 60 * 1000);
      prevEnd = new Date(todayStart.getTime() - 90 * 24 * 60 * 60 * 1000 - 1);
    } else if (filterType === 'this_year') {
      currentStart = new Date(now.getFullYear(), 0, 1);
      
      const lastYear = now.getFullYear() - 1;
      prevStart = new Date(lastYear, 0, 1);
      prevEnd = new Date(lastYear, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    } else if (filterType === 'custom') {
      if (customRange.startDate) {
        currentStart = new Date(customRange.startDate);
        currentStart.setHours(0, 0, 0, 0);
      }
      if (customRange.endDate) {
        currentEnd = new Date(customRange.endDate);
        currentEnd.setHours(23, 59, 59, 999);
      }
      
      if (currentStart && currentEnd) {
        const diffMs = currentEnd.getTime() - currentStart.getTime();
        prevEnd = new Date(currentStart.getTime() - 1);
        prevStart = new Date(prevEnd.getTime() - diffMs);
      }
    }

    return { currentStart, currentEnd, prevStart, prevEnd };
  }, [filterType, customRange]);

  // 2. Filter lead lists for both ranges
  const filteredData = useMemo(() => {
    const { currentStart, currentEnd, prevStart, prevEnd } = periods;

    const currentLeads = leads.filter(lead => {
      if (!lead || !lead.createdAt) return false;
      const date = parseDate(lead.createdAt);
      if (!date) return false;
      if (currentStart && date < currentStart) return false;
      if (currentEnd && date > currentEnd) return false;
      return true;
    });

    const prevLeads = leads.filter(lead => {
      if (!lead || !lead.createdAt) return false;
      const date = parseDate(lead.createdAt);
      if (!date) return false;
      if (prevStart && date < prevStart) return false;
      if (prevEnd && date > prevEnd) return false;
      return true;
    });

    return { currentLeads, prevLeads };
  }, [leads, periods]);

  // 3. Compute current and previous metrics + calculate percentage growth
  const stats = useMemo(() => {
    const { currentLeads, prevLeads } = filteredData;

    // Current period metrics
    const totalLeads = currentLeads.length;
    const wonCount = currentLeads.filter(l => l.status === 'Won').length;
    const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;
    const pipelineValue = getPipelineValue(currentLeads);
    const wonRevenue = getWonRevenue(currentLeads);
    const avgSalesCycle = getAverageSalesCycle(currentLeads);
    const lostRate = getLostRate(currentLeads);
    const salesVelocity = getSalesVelocity(currentLeads);

    // Comparison period metrics
    const prevTotalLeads = prevLeads.length;
    const prevWonCount = prevLeads.filter(l => l.status === 'Won').length;
    const prevConversionRate = prevTotalLeads > 0 ? Math.round((prevWonCount / prevTotalLeads) * 100) : 0;
    const prevPipelineValue = getPipelineValue(prevLeads);
    const prevWonRevenue = getWonRevenue(prevLeads);
    const prevAvgSalesCycle = getAverageSalesCycle(prevLeads);
    const prevLostRate = getLostRate(prevLeads);
    const prevSalesVelocity = getSalesVelocity(prevLeads);

    const calcGrowth = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      totalLeads,
      conversionRate,
      pipelineValue,
      wonRevenue,
      avgSalesCycle,
      lostRate,
      salesVelocity,
      growth: {
        totalLeads: calcGrowth(totalLeads, prevTotalLeads),
        conversionRate: calcGrowth(conversionRate, prevConversionRate),
        pipelineValue: calcGrowth(pipelineValue, prevPipelineValue),
        wonRevenue: calcGrowth(wonRevenue, prevWonRevenue),
        avgSalesCycle: prevAvgSalesCycle > 0 ? Math.round(((avgSalesCycle - prevAvgSalesCycle) / prevAvgSalesCycle) * 100) : 0,
        lostRate: calcGrowth(lostRate, prevLostRate),
        salesVelocity: calcGrowth(salesVelocity, prevSalesVelocity)
      }
    };
  }, [filteredData]);

  // 4. Generate memoized dataset transforms for all graphs
  const charts = useMemo(() => {
    const { currentLeads } = filteredData;
    
    return {
      statusDistribution: getStatusDistribution(currentLeads),
      monthlyLeads: getMonthlyLeads(currentLeads),
      conversionByMonth: getConversionByMonth(currentLeads),
      revenueByMonth: getRevenueByMonth(currentLeads),
      leadSourceStats: getLeadSourceStats(currentLeads),
      funnelData: getFunnelData(currentLeads),
      forecast: getForecastRevenue(currentLeads),
      topPerformers: getTopPerformers(currentLeads),
      activityHeatmapData: getActivityHeatmapData(currentLeads)
    };
  }, [filteredData]);

  return {
    filterType,
    setFilterType: changeFilterType,
    customRange,
    setCustomRange: changeCustomRange,
    loading,
    stats,
    charts,
    filteredLeadsCount: filteredData.currentLeads.length,
    totalLeadsCount: leads.length
  };
}
