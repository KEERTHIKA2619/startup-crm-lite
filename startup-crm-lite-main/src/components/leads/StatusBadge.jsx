/**
 * @file StatusBadge.jsx
 * @description A pill-shaped colored badge for displaying the lead's current status.
 * Supports both new status values and backwards compatibility with legacy mock data.
 * Fully supports dark/light mode switching.
 *
 * @module components/leads/StatusBadge
 */



/**
 * Returns CSS classes for status styling based on lead status string.
 *
 * @param {string} status - The lead status value.
 * @returns {{ bg: string, text: string, border: string }} Tailwind styles
 */
const getStatusClasses = (status) => {
  const normalized = status ? status.trim() : 'New';

  switch (normalized) {
    case 'Won':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/20 dark:border-emerald-500/30'
      };
    case 'Lost':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/20 dark:border-rose-500/30'
      };
    case 'Meeting Scheduled':
      return {
        bg: 'bg-violet-500/10 dark:bg-violet-500/15',
        text: 'text-violet-700 dark:text-violet-400',
        border: 'border-violet-500/20 dark:border-violet-500/30'
      };
    case 'Proposal Sent':
    case 'Proposal':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/20 dark:border-amber-500/30'
      };
    case 'Contacted':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-500/20 dark:border-blue-500/30'
      };
    case 'Qualified':
    case 'Negotiation':
      return {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-500/20 dark:border-indigo-500/30'
      };
    case 'New':
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-500/15',
        text: 'text-slate-700 dark:text-slate-350',
        border: 'border-slate-500/20 dark:border-slate-500/30'
      };
  }
};

/**
 * StatusBadge Component
 *
 * @param {Object} props
 * @param {string} props.status - The lead's status (e.g., 'New', 'Won', 'Lost', etc.)
 * @param {string} [props.className] - Additional classes
 */
export default function StatusBadge({ status, className = '' }) {
  const styles = getStatusClasses(status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles.bg} ${styles.text} ${styles.border} transition-colors duration-200 select-none ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 flex-shrink-0 animate-pulse" />
      {status}
    </span>
  );
}
