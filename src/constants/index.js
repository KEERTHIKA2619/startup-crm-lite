export const STATUS_OPTIONS = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

export const SOURCE_OPTIONS = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

export const FILTER_OPTIONS = ['All', ...STATUS_OPTIONS];

export const STATUS_COLORS = {
  New: "#94A3B8",
  Contacted: "#2563EB",
  Meeting: "#F59E0B",
  Proposal: "#7C3AED",
  Won: "#22C55E",
  Lost: "#EF4444",
  'Meeting Scheduled': "#F59E0B", // Map full labels
  'Proposal Sent': "#7C3AED"     // Map full labels
};
