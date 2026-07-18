/**
 * Date utility to generate the past 6 calendar months from today's system date.
 * Sorted chronologically.
 * Each month includes formatted name, year index, and month index references.
 *
 * @returns {Array<Object>} List of past 6 months metadata.
 */
const getPast6Months = () => {
  const months = [];
  const date = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      name: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      monthIndex: d.getMonth()
    });
  }
  return months;
};

/**
 * Defensive date parsing utility.
 *
 * @param {string|Date} dateVal - Date value to convert.
 * @returns {Date|null} Date object or null if invalid.
 */
const parseDate = (dateVal) => {
  if (!dateVal) return null;
  const parsed = new Date(dateVal);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Deterministically assigns a sales owner to a lead if none is specified.
 * Ensures the UI displays consistent representation without modifying the database.
 *
 * @param {Object} lead - Lead object.
 * @returns {string} Assigned sales owner.
 */
const getLeadOwner = (lead) => {
  if (lead && lead.owner) return lead.owner;
  const owners = ['Sarah', 'Alex', 'David'];
  const targetId = lead ? (lead.id || lead._id) : null;
  if (!lead || !targetId) return owners[0];
  const lastChar = targetId.toString().slice(-1);
  const code = lastChar.charCodeAt(0) || 0;
  return owners[code % owners.length];
};

/**
 * 1. getStatusDistribution
 * Returns lead status distribution mapped to the normalized dashboard status options.
 * Matches statuses: 'New', 'Contacted', 'Meeting Scheduled' -> 'Meeting', 'Proposal Sent' -> 'Proposal', 'Won', 'Lost'.
 *
 * @param {Array<Object>} leads
 * @returns {Array<Object>} Distribution array.
 */
export const getStatusDistribution = (leads = []) => {
  if (!Array.isArray(leads)) return [];
  const counts = { New: 0, Contacted: 0, Meeting: 0, Proposal: 0, Won: 0, Lost: 0 };
  leads.forEach(lead => {
    if (!lead) return;
    const status = lead.status;
    if (status === 'New') counts.New++;
    else if (status === 'Contacted') counts.Contacted++;
    else if (status === 'Meeting Scheduled' || status === 'Meeting') counts.Meeting++;
    else if (status === 'Proposal Sent' || status === 'Proposal') counts.Proposal++;
    else if (status === 'Won') counts.Won++;
    else if (status === 'Lost') counts.Lost++;
  });
  const total = leads.length;
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? Math.round((value / total) * 100) : 0
  }));
};

/**
 * 2. getMonthlyLeads
 * Groups leads by createdAt timestamp for the past 6 calendar months.
 *
 * @param {Array<Object>} leads
 * @returns {Array<Object>} Monthly counts.
 */
export const getMonthlyLeads = (leads = []) => {
  if (!Array.isArray(leads)) return [];
  const months = getPast6Months();
  return months.map(m => {
    const count = leads.filter(lead => {
      if (!lead || !lead.createdAt) return false;
      const leadDate = parseDate(lead.createdAt);
      if (!leadDate) return false;
      return leadDate.getFullYear() === m.year && leadDate.getMonth() === m.monthIndex;
    }).length;
    return { name: m.name, count };
  });
};

/**
 * 3. getConversionByMonth
 * Computes won conversion rate percentage (Won / Total) for leads created in each month.
 *
 * @param {Array<Object>} leads
 * @returns {Array<Object>} Monthly conversion rates.
 */
export const getConversionByMonth = (leads = []) => {
  if (!Array.isArray(leads)) return [];
  const months = getPast6Months();
  return months.map(m => {
    const monthLeads = leads.filter(lead => {
      if (!lead || !lead.createdAt) return false;
      const leadDate = parseDate(lead.createdAt);
      if (!leadDate) return false;
      return leadDate.getFullYear() === m.year && leadDate.getMonth() === m.monthIndex;
    });
    const total = monthLeads.length;
    const won = monthLeads.filter(lead => lead.status === 'Won').length;
    const rate = total > 0 ? Math.round((won / total) * 100) : 0;
    return { name: m.name, conversionRate: rate };
  });
};

/**
 * 4. getRevenueByMonth
 * Calculates closed won revenue by month using lead won date (wonAt, note timestamp, or createdAt fallback).
 *
 * @param {Array<Object>} leads
 * @returns {Array<Object>} Monthly won revenue.
 */
export const getRevenueByMonth = (leads = []) => {
  if (!Array.isArray(leads)) return [];
  const months = getPast6Months();
  const wonLeads = leads.filter(lead => lead && lead.status === 'Won');
  
  return months.map(m => {
    const revenue = wonLeads
      .filter(lead => {
        let dateVal = lead.wonAt;
        if (!dateVal && lead.notes && lead.notes.length > 0) {
          const dates = lead.notes.map(n => parseDate(n.date)).filter(Boolean);
          if (dates.length > 0) {
            dateVal = new Date(Math.max(...dates.map(d => d.getTime())));
          }
        }
        if (!dateVal) dateVal = lead.createdAt;
        
        const date = parseDate(dateVal);
        if (!date) return false;
        return date.getFullYear() === m.year && date.getMonth() === m.monthIndex;
      })
      .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
    return { name: m.name, revenue };
  });
};

/**
 * 5. getPipelineValue
 * Sum of values of all active leads (i.e. not Won or Lost).
 *
 * @param {Array<Object>} leads
 * @returns {number} Pipeline value.
 */
export const getPipelineValue = (leads = []) => {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter(lead => lead && lead.status !== 'Won' && lead.status !== 'Lost')
    .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
};

/**
 * 6. getWonRevenue
 * Sum of values of all closed-won leads.
 *
 * @param {Array<Object>} leads
 * @returns {number} Won revenue.
 */
export const getWonRevenue = (leads = []) => {
  if (!Array.isArray(leads)) return 0;
  return leads
    .filter(lead => lead && lead.status === 'Won')
    .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
};

/**
 * 7. getAverageSalesCycle
 * Computes average duration in days between createdAt and closing/won date.
 *
 * @param {Array<Object>} leads
 * @returns {number} Average sales cycle in days.
 */
export const getAverageSalesCycle = (leads = []) => {
  if (!Array.isArray(leads)) return 0;
  const wonLeads = leads.filter(lead => lead && lead.status === 'Won');
  let totalDays = 0;
  let count = 0;
  
  wonLeads.forEach(lead => {
    const createdDate = parseDate(lead.createdAt);
    if (!createdDate) return;
    
    let closeDate = parseDate(lead.wonAt);
    if (!closeDate && lead.notes && lead.notes.length > 0) {
      const dates = lead.notes.map(n => parseDate(n.date)).filter(Boolean);
      if (dates.length > 0) {
        closeDate = new Date(Math.max(...dates.map(d => d.getTime())));
      }
    }
    
    if (!closeDate) closeDate = new Date();
    
    const diffTime = closeDate.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays >= 0) {
      totalDays += diffDays;
      count++;
    }
  });
  
  return count > 0 ? Math.round(totalDays / count) : 0;
};

/**
 * 8. getLostRate
 * Computes lost lead conversion rate (Lost / Total Leads).
 *
 * @param {Array<Object>} leads
 * @returns {number} Lost rate percentage.
 */
export const getLostRate = (leads = []) => {
  if (!Array.isArray(leads) || leads.length === 0) return 0;
  const lost = leads.filter(lead => lead && lead.status === 'Lost').length;
  return Math.round((lost / leads.length) * 100);
};

/**
 * 9. getLeadSourceStats
 * Counts lead sources and returns them sorted descending.
 *
 * @param {Array<Object>} leads
 * @returns {Array<Object>} Mapped sources sorted by count.
 */
export const getLeadSourceStats = (leads = []) => {
  if (!Array.isArray(leads)) return [];
  const sourceCounts = {};
  const defaultSources = ['Website', 'Referral', 'LinkedIn', 'Instagram', 'Ads', 'Cold Email', 'Cold Call', 'Email Campaign', 'Other'];
  defaultSources.forEach(s => sourceCounts[s] = 0);
  
  leads.forEach(lead => {
    if (!lead) return;
    const src = lead.source || 'Other';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  
  return Object.entries(sourceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * 10. getFunnelData
 * Computes cumulative lead counts, conversion rate, and stage-by-stage drop-off.
 * Mapped stages: New -> Contacted -> Meeting -> Proposal -> Won.
 *
 * @param {Array<Object>} leads
 * @returns {Array<Object>} Stage funnel details.
 */
export const getFunnelData = (leads = []) => {
  if (!Array.isArray(leads)) return [];
  const stages = [
    { id: 'New', name: 'New', count: 0 },
    { id: 'Contacted', name: 'Contacted', count: 0 },
    { id: 'Meeting', name: 'Meeting', count: 0 },
    { id: 'Proposal', name: 'Proposal', count: 0 },
    { id: 'Won', name: 'Won', count: 0 }
  ];
  
  leads.forEach(lead => {
    if (!lead) return;
    let rank = 1;
    const status = lead.status;
    if (status === 'New') rank = 1;
    else if (status === 'Contacted') rank = 2;
    else if (status === 'Meeting Scheduled' || status === 'Meeting') rank = 3;
    else if (status === 'Proposal Sent' || status === 'Proposal') rank = 4;
    else if (status === 'Won') rank = 5;
    
    if (lead.wonAt) rank = Math.max(rank, 5);
    else if (lead.proposalAt) rank = Math.max(rank, 4);
    else if (lead.meetingAt) rank = Math.max(rank, 3);
    else if (lead.contactedAt) rank = Math.max(rank, 2);
    
    for (let i = 0; i < rank; i++) {
      stages[i].count++;
    }
  });
  
  const total = stages[0].count;
  return stages.map((stage, idx) => {
    const conversionRate = total > 0 ? Math.round((stage.count / total) * 100) : 0;
    let dropOff = 0;
    if (idx > 0) {
      const prevCount = stages[idx - 1].count;
      dropOff = prevCount > 0 ? Math.round(((prevCount - stage.count) / prevCount) * 100) : 0;
    }
    return {
      ...stage,
      conversionRate,
      dropOff
    };
  });
};

/**
 * 11. getSalesVelocity
 * Computes Sales Velocity metric: (Opportunities * Win Rate * Avg Deal Size) / Avg Sales Cycle Length.
 * Output is formatted in monetary currency value per day.
 *
 * @param {Array<Object>} leads
 * @returns {number} Money velocity value per day.
 */
export const getSalesVelocity = (leads = []) => {
  if (!Array.isArray(leads) || leads.length === 0) return 0;
  const opportunities = leads.length;
  
  const wonLeads = leads.filter(l => l && l.status === 'Won');
  const winRate = wonLeads.length / opportunities;
  
  const avgDealSize = leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0) / opportunities;
  
  const salesCycleLength = getAverageSalesCycle(leads) || 18;
  
  const velocity = (opportunities * winRate * avgDealSize) / salesCycleLength;
  return Math.round(velocity);
};

/**
 * 12. getForecastRevenue
 * Predicts next month revenue usingTrailing 6 Months Average Revenue.
 * Also returns growth rates and confidence levels.
 *
 * @param {Array<Object>} leads
 * @returns {Object} Forecasted revenue, confidence score, and growth trend percentage.
 */
export const getForecastRevenue = (leads = []) => {
  if (!Array.isArray(leads)) return { predictedRevenue: 0, confidenceScore: 0, growthTrend: 0 };
  const monthlyRevenueData = getRevenueByMonth(leads);
  const totalRevenue = monthlyRevenueData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = Math.round(totalRevenue / 6);
  
  const currentMonthRev = monthlyRevenueData[5]?.revenue || 0;
  const prevMonthRev = monthlyRevenueData[4]?.revenue || 0;
  const growthTrend = prevMonthRev > 0 ? Math.round(((currentMonthRev - prevMonthRev) / prevMonthRev) * 100) : 0;
  
  const wonCount = leads.filter(l => l && l.status === 'Won').length;
  let confidenceScore = 50;
  if (wonCount > 10) confidenceScore = 90;
  else if (wonCount > 5) confidenceScore = 80;
  else if (wonCount > 2) confidenceScore = 65;
  
  return {
    predictedRevenue: avgRevenue,
    confidenceScore,
    growthTrend
  };
};

/**
 * 13. getTopPerformers
 * Ranks rep owners by won revenue total value.
 *
 * @param {Array<Object>} leads
 * @returns {Array<Object>} Mapped reps sorted descending.
 */
export const getTopPerformers = (leads = []) => {
  if (!Array.isArray(leads)) return [];
  const performanceMap = {};
  const defaultReps = ['Sarah', 'Alex', 'David'];
  defaultReps.forEach(rep => performanceMap[rep] = 0);
  
  leads.forEach(lead => {
    if (!lead) return;
    if (lead.status === 'Won') {
      const owner = getLeadOwner(lead);
      performanceMap[owner] = (performanceMap[owner] || 0) + (Number(lead.value) || 0);
    }
  });
  
  return Object.entries(performanceMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * 14. getActivityHeatmapData
 * Aggregates daily activity events (created, meetings scheduled, calls logged) for the past 30 days.
 *
 * @param {Array<Object>} leads
 * @returns {Array<Object>} Heatmap grid items.
 */
export const getActivityHeatmapData = (leads = []) => {
  if (!Array.isArray(leads)) return [];
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    let leadsCreated = 0;
    let meetingsScheduled = 0;
    let callsLogged = 0;
    
    leads.forEach(lead => {
      if (!lead) return;
      if (lead.createdAt && lead.createdAt.split('T')[0] === dateStr) {
        leadsCreated++;
      }
      
      if (lead.meetingAt && lead.meetingAt.split('T')[0] === dateStr) {
        meetingsScheduled++;
      } else if ((lead.status === 'Meeting Scheduled' || lead.status === 'Meeting') && lead.notes) {
        lead.notes.forEach(n => {
          if (n && n.date && n.date.split('T')[0] === dateStr && n.text.toLowerCase().includes('meeting')) {
            meetingsScheduled++;
          }
        });
      }
      
      if (lead.contactedAt && lead.contactedAt.split('T')[0] === dateStr) {
        callsLogged++;
      } else if (lead.notes) {
        lead.notes.forEach(n => {
          if (n && n.date && n.date.split('T')[0] === dateStr && (n.text.toLowerCase().includes('call') || n.text.toLowerCase().includes('contact'))) {
            callsLogged++;
          }
        });
      }
    });
    
    const total = leadsCreated + meetingsScheduled + callsLogged;
    
    data.push({
      date: dateStr,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      leadsCreated,
      meetingsScheduled,
      callsLogged,
      value: total
    });
  }
  return data;
};
