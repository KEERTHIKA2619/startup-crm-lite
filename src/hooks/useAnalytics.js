import { useMemo } from 'react';
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

// Helper to safely parse dates
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

// Calculate statistical KPIs for a subset of leads
const calculateKPIs = (periodLeads) => {
  const total = periodLeads.length;
  const wonRevenue = getWonRevenue(periodLeads);
  const pipelineValue = getPipelineValue(periodLeads);
  
  const wonCount = periodLeads.filter(l => l.status === 'Won').length;
  const lostCount = periodLeads.filter(l => l.status === 'Lost').length;
  
  const conversionRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;
  const lostRate = total > 0 ? Math.round((lostCount / total) * 100) : 0;
  
  const avgSalesCycle = getAverageSalesCycle(periodLeads);
  const salesVelocity = getSalesVelocity(periodLeads);

  return {
    total,
    wonRevenue,
    pipelineValue,
    conversionRate,
    lostRate,
    avgSalesCycle,
    salesVelocity
  };
};

/**
 * useAnalytics Hook
 * Filters leads according to the selected date interval, computes comparison metrics
 * for the previous interval, and returns memoized results for all dashboard widgets.
 */
export const useAnalytics = (leads = [], filterType = '30d', customRange = null) => {
  return useMemo(() => {
    if (!Array.isArray(leads)) {
      return {
        currentKPIs: calculateKPIs([]),
        prevKPIs: calculateKPIs([]),
        statusDistribution: [],
        monthlyLeads: [],
        conversionTrend: [],
        revenueTrend: [],
        leadSources: [],
        funnelData: [],
        forecast: { prediction: 0, growthTrend: 0, confidenceScore: 0 },
        topPerformers: [],
        heatmapData: [],
        filteredLeads: []
      };
    }

    const now = new Date();
    // Use mid-day to avoid timezone offset issues during date computations
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

    let startCurrent = null;
    let endCurrent = today;
    let startPrevious = null;
    let endPrevious = null;

    switch (filterType) {
      case '7d': {
        startCurrent = new Date(today);
        startCurrent.setDate(today.getDate() - 7);
        
        startPrevious = new Date(startCurrent);
        startPrevious.setDate(startCurrent.getDate() - 7);
        endPrevious = startCurrent;
        break;
      }
      case '30d': {
        startCurrent = new Date(today);
        startCurrent.setDate(today.getDate() - 30);
        
        startPrevious = new Date(startCurrent);
        startPrevious.setDate(startCurrent.getDate() - 30);
        endPrevious = startCurrent;
        break;
      }
      case '90d': {
        startCurrent = new Date(today);
        startCurrent.setDate(today.getDate() - 90);
        
        startPrevious = new Date(startCurrent);
        startPrevious.setDate(startCurrent.getDate() - 90);
        endPrevious = startCurrent;
        break;
      }
      case 'year': {
        startCurrent = new Date(today.getFullYear(), 0, 1, 0, 0, 0);
        
        startPrevious = new Date(today.getFullYear() - 1, 0, 1, 0, 0, 0);
        endPrevious = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;
      }
      case 'custom': {
        if (customRange && customRange.startDate && customRange.endDate) {
          startCurrent = new Date(customRange.startDate);
          startCurrent.setHours(0, 0, 0, 0);
          
          endCurrent = new Date(customRange.endDate);
          endCurrent.setHours(23, 59, 59, 999);
          
          // Prior period of identical length
          const diffTime = Math.abs(endCurrent - startCurrent);
          startPrevious = new Date(startCurrent.getTime() - diffTime);
          endPrevious = startCurrent;
        } else {
          // Fallback to 30d if invalid custom range
          startCurrent = new Date(today);
          startCurrent.setDate(today.getDate() - 30);
          
          startPrevious = new Date(startCurrent);
          startPrevious.setDate(startCurrent.getDate() - 30);
          endPrevious = startCurrent;
        }
        break;
      }
      default: {
        // Default to last 30 days
        startCurrent = new Date(today);
        startCurrent.setDate(today.getDate() - 30);
        
        startPrevious = new Date(startCurrent);
        startPrevious.setDate(startCurrent.getDate() - 30);
        endPrevious = startCurrent;
      }
    }

    // Filter leads into periods based on createdAt / dateAdded
    const currentLeads = leads.filter(lead => {
      const leadDate = parseDate(lead.createdAt || lead.dateAdded);
      if (!leadDate) return false;
      return leadDate >= startCurrent && leadDate <= endCurrent;
    });

    const prevLeads = leads.filter(lead => {
      const leadDate = parseDate(lead.createdAt || lead.dateAdded);
      if (!leadDate) return false;
      if (!startPrevious || !endPrevious) return false;
      return leadDate >= startPrevious && leadDate <= endPrevious;
    });

    // Compute stats & charts
    const currentKPIs = calculateKPIs(currentLeads);
    const prevKPIs = calculateKPIs(prevLeads);

    const statusDistribution = getStatusDistribution(currentLeads);
    const monthlyLeads = getMonthlyLeads(currentLeads);
    const conversionTrend = getConversionByMonth(currentLeads);
    const revenueTrend = getRevenueByMonth(currentLeads);
    const leadSources = getLeadSourceStats(currentLeads);
    const funnelData = getFunnelData(currentLeads);
    const forecast = getForecastRevenue(currentLeads);
    const topPerformers = getTopPerformers(currentLeads);
    const heatmapData = getActivityHeatmapData(currentLeads);

    return {
      currentKPIs,
      prevKPIs,
      statusDistribution,
      monthlyLeads,
      conversionTrend,
      revenueTrend,
      leadSources,
      funnelData,
      forecast,
      topPerformers,
      heatmapData,
      filteredLeads: currentLeads
    };
  }, [leads, filterType, customRange]);
};
