import React from 'react';

/**
 * @typedef {Object} StatusBadgeProps
 * @property {'New'|'Contacted'|'Meeting Scheduled'|'Proposal Sent'|'Won'|'Lost'} status - The lead status key
 */

/**
 * StatusBadge Component
 * Renders a pill-shaped colored badge displaying the lead's current status.
 * Each status maps to a unique color palette for instant visual recognition.
 *
 * Color mapping:
 *   New            → Slate/Gray (neutral, just entered pipeline)
 *   Contacted      → Blue (active outreach in progress)
 *   Meeting Scheduled → Purple (engaged, calendar booking)
 *   Proposal Sent  → Amber (deal documentation sent)
 *   Won            → Green (successful conversion)
 *   Lost           → Red (deal fell through)
 *
 * @param {StatusBadgeProps} props - The component parameters
 * @returns {React.JSX.Element} The styled status badge pill
 */
const StatusBadge = ({ status }) => {
  // Map each status to distinct Tailwind color classes for bg, text, border, and dot indicator
  const statusStyles = {
    New: {
      badge: 'bg-slate-100 text-slate-700 border-slate-200/80',
      dot: 'bg-slate-400',
    },
    Contacted: {
      badge: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20',
      dot: 'bg-[#2563EB]',
    },
    'Meeting Scheduled': {
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-500',
    },
    'Proposal Sent': {
      badge: 'bg-[#F59E0B]/10 text-[#D97706] border-[#F59E0B]/20',
      dot: 'bg-[#F59E0B]',
    },
    Won: {
      badge: 'bg-[#22C55E]/10 text-[#16A34A] border-[#22C55E]/20',
      dot: 'bg-[#22C55E]',
    },
    Lost: {
      badge: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
      dot: 'bg-[#EF4444]',
    },
  };

  // Fallback to neutral slate for unknown statuses
  const style = statusStyles[status] || {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.badge} transition-colors duration-200`}
      role="status"
      aria-label={`Lead status: ${status}`}
    >
      {/* Colored dot indicator for quick visual scanning */}
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} aria-hidden="true" />
      {status}
    </span>
  );
};

export default StatusBadge;
