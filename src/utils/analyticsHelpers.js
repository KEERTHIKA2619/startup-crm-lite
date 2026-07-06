import { STATUS_COLORS } from '../constants/analyticsColors';

// Helper to safely parse date strings into Date objects
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

// Helper to map status labels to standard shorter keys if needed
const mapStatus = (status) => {
  if (status === 'Meeting Scheduled') return 'Meeting';
  if (status === 'Proposal Sent') return 'Proposal';
  return status;
};

// Helper to get month name abbreviation (Jan, Feb, etc.)
const getMonthAbbr = (date) => {
  return date.toLocaleString('en-US', { month: 'short' });
};

// Get chronological list of the last 6 months ending in the current month (e.g. Feb, Mar, Apr, May, Jun, Jul)
const getLast6Months = () => {
  const months = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const temp = new Date(d.getFullYear(), d.getMonth() - i, 1);
    months.push({
      abbr: getMonthAbbr(temp),
      year: temp.getFullYear(),
      monthIndex: temp.getMonth()
    });
  }
  return months;
};

/**
 * 1. getStatusDistribution(leads)
 * Counts and percentages of leads per status. Mapped to colors.
 */
export const getStatusDistribution = (leads) => {
  if (!Array.isArray(leads)) return [];
  
  const total = leads.length;
  const counts = {};
  
  // Initialize counts for standard statuses
  const statuses = ['New', 'Contacted', 'Meeting', 'Proposal', 'Won', 'Lost'];
  statuses.forEach(s => { counts[s] = 0; });

  leads.forEach(lead => {
    const status = mapStatus(lead.status);
    if (counts[status] !== undefined) {
      counts[status]++;
    } else {
      counts[status] = (counts[status] || 0) + 1;
    }
  });

  return Object.keys(counts).map(name => {
    const value = counts[name];
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return {
      name,
      value,
      percentage,
      color: STATUS_COLORS[name] || '#94A3B8'
    };
  });
};

/**
 * 2. getMonthlyLeads(leads)
 * Group leads by createdAt/dateAdded in the last 6 months.
 */
export const getMonthlyLeads = (leads) => {
  if (!Array.isArray(leads)) return [];

  const months = getLast6Months();
  const data = months.map(m => ({ month: m.abbr, 'Lead Count': 0, year: m.year, monthIndex: m.monthIndex }));

  leads.forEach(lead => {
    const date = parseDate(lead.createdAt || lead.dateAdded);
    if (!date) return;

    const monthAbbr = getMonthAbbr(date);
    const year = date.getFullYear();

    const monthBucket = data.find(
      d => d.month === monthAbbr && d.year === year
    );
    if (monthBucket) {
      monthBucket['Lead Count']++;
    }
  });

  // Return clean data array for Recharts
  return data.map(({ month, 'Lead Count': count }) => ({ name: month, 'Lead Count': count }));
};

/**
 * 3. getConversionByMonth(leads)
 * Formula: Won Leads / Total Leads created in that month.
 */
export const getConversionByMonth = (leads) => {
  if (!Array.isArray(leads)) return [];

  const months = getLast6Months();
  const data = months.map(m => ({
    month: m.abbr,
    year: m.year,
    won: 0,
    total: 0
  }));

  leads.forEach(lead => {
    const date = parseDate(lead.createdAt || lead.dateAdded);
    if (!date) return;

    const monthAbbr = getMonthAbbr(date);
    const year = date.getFullYear();

    const bucket = data.find(d => d.month === monthAbbr && d.year === year);
    if (bucket) {
      bucket.total++;
      if (lead.status === 'Won') {
        bucket.won++;
      }
    }
  });

  return data.map(b => {
    const rate = b.total > 0 ? Math.round((b.won / b.total) * 100) : 0;
    return {
      name: b.month,
      'Conversion Rate': rate
    };
  });
};

/**
 * 4. getRevenueByMonth(leads)
 * Aggregated revenue (deal value) of Won deals, grouped by wonAt month (or createdAt if wonAt is null).
 */
export const getRevenueByMonth = (leads) => {
  if (!Array.isArray(leads)) return [];

  const months = getLast6Months();
  const data = months.map(m => ({
    month: m.abbr,
    year: m.year,
    Revenue: 0
  }));

  leads.forEach(lead => {
    if (lead.status !== 'Won') return;

    const date = parseDate(lead.wonAt || lead.createdAt || lead.dateAdded);
    if (!date) return;

    const monthAbbr = getMonthAbbr(date);
    const year = date.getFullYear();

    const bucket = data.find(d => d.month === monthAbbr && d.year === year);
    if (bucket) {
      bucket.Revenue += Number(lead.value) || 0;
    }
  });

  return data.map(b => ({
    name: b.month,
    Revenue: b.Revenue
  }));
};

/**
 * 5. getPipelineValue(leads)
 * Sum of all active lead values (non-Won and non-Lost)
 */
export const getPipelineValue = (leads) => {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter(lead => !['Won', 'Lost'].includes(lead.status))
    .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
};

/**
 * 6. getWonRevenue(leads)
 * Sum of Won lead values
 */
export const getWonRevenue = (leads) => {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter(lead => lead.status === 'Won')
    .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
};

/**
 * 7. getAverageSalesCycle(leads)
 * Formula: wonAt - createdAt in Days.
 */
export const getAverageSalesCycle = (leads) => {
  if (!Array.isArray(leads)) return 0;
  
  const wonLeads = leads.filter(lead => {
    if (lead.status !== 'Won') return false;
    const start = parseDate(lead.createdAt || lead.dateAdded);
    const end = parseDate(lead.wonAt);
    return start && end;
  });

  if (wonLeads.length === 0) return 0;

  const totalDays = wonLeads.reduce((sum, lead) => {
    const start = parseDate(lead.createdAt || lead.dateAdded);
    const end = parseDate(lead.wonAt);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);

  return Math.round(totalDays / wonLeads.length);
};

/**
 * 8. getLostRate(leads)
 * Formula: Lost Leads / Total Leads.
 */
export const getLostRate = (leads) => {
  if (!Array.isArray(leads) || leads.length === 0) return 0;
  const lostLeads = leads.filter(lead => lead.status === 'Lost').length;
  return Math.round((lostLeads / leads.length) * 100);
};

/**
 * 9. getLeadSourceStats(leads)
 * Horizontal Bar Chart: source counts sorted descending.
 */
export const getLeadSourceStats = (leads) => {
  if (!Array.isArray(leads)) return [];

  const counts = {};
  leads.forEach(lead => {
    const src = lead.source || 'Other';
    counts[src] = (counts[src] || 0) + 1;
  });

  return Object.keys(counts)
    .map(source => ({
      name: source,
      value: counts[source]
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * 10. getFunnelData(leads)
 * Cumulative funnel counts for stages: New -> Contacted -> Meeting -> Proposal -> Won.
 * Each won lead is assumed to have visited all stages.
 */
export const getFunnelData = (leads) => {
  if (!Array.isArray(leads)) return [];

  const stages = [
    { name: 'New', display: 'New' },
    { name: 'Contacted', display: 'Contacted' },
    { name: 'Meeting', display: 'Meeting Scheduled' },
    { name: 'Proposal', display: 'Proposal Sent' },
    { name: 'Won', display: 'Won' }
  ];

  // Helper to determine what stage thresholds are met
  const counts = { New: 0, Contacted: 0, Meeting: 0, Proposal: 0, Won: 0 };

  leads.forEach(lead => {
    const current = mapStatus(lead.status);
    
    // Increment cumulatively:
    // Mapped statuses: New, Contacted, Meeting, Proposal, Won
    counts.New++; // Every lead starts at New

    if (['Contacted', 'Meeting', 'Proposal', 'Won'].includes(current) || lead.contactedAt) {
      counts.Contacted++;
    }
    if (['Meeting', 'Proposal', 'Won'].includes(current) || lead.meetingAt) {
      counts.Meeting++;
    }
    if (['Proposal', 'Won'].includes(current) || lead.proposalAt) {
      counts.Proposal++;
    }
    if (current === 'Won') {
      counts.Won++;
    }
  });

  const total = counts.New;

  return stages.map((s, index) => {
    const count = counts[s.name];
    const conversion = total > 0 ? Math.round((count / total) * 100) : 0;
    
    // Dropoff is relative to previous stage count
    let dropOff = 0;
    if (index > 0) {
      const prevCount = counts[stages[index - 1].name];
      dropOff = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0;
    }

    return {
      stage: s.name,
      value: count,
      conversion,
      dropOff
    };
  });
};

/**
 * 11. getSalesVelocity(leads)
 * Formula: (Opportunities * Win Rate * Avg Deal Size) / Sales Cycle Length
 */
export const getSalesVelocity = (leads) => {
  if (!Array.isArray(leads) || leads.length === 0) return 0;

  // 1. Opportunities: active opportunities (non-Won, non-Lost)
  const activeOpportunities = leads.filter(l => !['Won', 'Lost'].includes(l.status)).length;
  
  // 2. Win Rate: Won / Total Leads
  const wonCount = leads.filter(l => l.status === 'Won').length;
  const winRate = leads.length > 0 ? wonCount / leads.length : 0;
  
  // 3. Avg Deal Size: Average value of leads with values > 0 (or all leads)
  const valuedLeads = leads.filter(l => (Number(l.value) || 0) > 0);
  const avgDealSize = valuedLeads.length > 0 
    ? valuedLeads.reduce((sum, l) => sum + Number(l.value), 0) / valuedLeads.length 
    : 0;

  // 4. Sales Cycle Length: Average cycle in days
  const avgCycle = getAverageSalesCycle(leads) || 14; // Default to 14 days if 0 to prevent division by zero

  // Calculation
  const velocity = (activeOpportunities * winRate * avgDealSize) / avgCycle;
  
  return Math.round(velocity);
};

/**
 * 12. getForecastRevenue(leads)
 * Predicted Revenue Next Month based on Average Revenue of Last 6 Months
 */
export const getForecastRevenue = (leads) => {
  if (!Array.isArray(leads)) return { prediction: 0, growthTrend: 0, confidenceScore: 0 };

  const monthlyRevenues = getRevenueByMonth(leads); // Array of { name: month, Revenue: val } (last 6 months)
  const totalRevenue = monthlyRevenues.reduce((sum, m) => sum + m.Revenue, 0);
  const averageRevenue = monthlyRevenues.length > 0 ? totalRevenue / monthlyRevenues.length : 0;

  // Forecast is simply the average of the last 6 months
  const prediction = Math.round(averageRevenue);

  // Growth Trend: Comparison between last month and the month before
  let growthTrend = 0;
  if (monthlyRevenues.length >= 2) {
    const lastMonthRev = monthlyRevenues[monthlyRevenues.length - 1].Revenue;
    const prevMonthRev = monthlyRevenues[monthlyRevenues.length - 2].Revenue;
    if (prevMonthRev > 0) {
      growthTrend = Math.round(((lastMonthRev - prevMonthRev) / prevMonthRev) * 100);
    } else if (lastMonthRev > 0) {
      growthTrend = 100;
    }
  }

  // Confidence Score: base score of 85%, adjusts up if sample size is higher or down if revenue is highly volatile
  let confidenceScore = 85;
  if (leads.length < 5) confidenceScore = 50;
  else if (leads.length < 15) confidenceScore = 70;
  
  return {
    prediction,
    growthTrend,
    confidenceScore
  };
};

/**
 * 13. getTopPerformers(leads)
 * Rank sales reps by Won Revenue
 */
export const getTopPerformers = (leads) => {
  if (!Array.isArray(leads)) return [];

  const repRevenue = {};
  leads.forEach(lead => {
    if (lead.status !== 'Won') return;
    const owner = lead.owner || 'Unassigned';
    repRevenue[owner] = (repRevenue[owner] || 0) + (Number(lead.value) || 0);
  });

  return Object.keys(repRevenue)
    .map(owner => ({
      name: owner,
      value: repRevenue[owner]
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * 14. getActivityHeatmapData(leads)
 * Grid values for daily activities (Leads Created, Meetings Scheduled, Won) over the selected period
 */
export const getActivityHeatmapData = (leads) => {
  if (!Array.isArray(leads)) return [];

  const activityCounts = {};

  leads.forEach(lead => {
    // 1. Lead Created
    const createdDate = parseDate(lead.createdAt || lead.dateAdded);
    if (createdDate) {
      const dateStr = createdDate.toISOString().split('T')[0];
      activityCounts[dateStr] = (activityCounts[dateStr] || 0) + 1;
    }

    // 2. Meeting Scheduled
    if (lead.meetingAt) {
      const meetingDate = parseDate(lead.meetingAt);
      if (meetingDate) {
        const dateStr = meetingDate.toISOString().split('T')[0];
        activityCounts[dateStr] = (activityCounts[dateStr] || 0) + 1.5; // weight meeting scheduled higher!
      }
    }

    // 3. Lead Won
    if (lead.wonAt) {
      const wonDate = parseDate(lead.wonAt);
      if (wonDate) {
        const dateStr = wonDate.toISOString().split('T')[0];
        activityCounts[dateStr] = (activityCounts[dateStr] || 0) + 2; // weight lead won even higher!
      }
    }
  });

  // Convert to array of { date, count }
  return Object.keys(activityCounts).map(date => ({
    date,
    count: Math.round(activityCounts[date])
  }));
};
