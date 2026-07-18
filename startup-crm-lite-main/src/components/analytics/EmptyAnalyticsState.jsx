import { BarChart3, Plus } from 'lucide-react';

/**
 * EmptyAnalyticsState Component
 * Displays a friendly empty state when the database contains no lead items.
 *
 * @param {Object} props
 * @param {Function} props.onAddLeadClick - Callback when CTA button is clicked.
 */
export default function EmptyAnalyticsState({ onAddLeadClick }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-bg-surface border border-border-base rounded-2xl shadow-sm page-fade">
      <div className="w-14 h-14 rounded-full bg-bg-base border border-border-base flex items-center justify-center mb-4 text-primary shadow-inner">
        <BarChart3 className="w-6 h-6 animate-pulse" />
      </div>

      <h3 className="font-display font-semibold text-text-main text-lg mb-1">
        No analytics available yet
      </h3>

      <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
        Add your first lead to start tracking business performance.
      </p>

      <button
        onClick={onAddLeadClick}
        className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/95 text-white font-medium text-sm flex items-center gap-2 shadow-sm shadow-primary/20 transition-all hover:scale-[1.01] cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Lead
      </button>
    </div>
  );
}
