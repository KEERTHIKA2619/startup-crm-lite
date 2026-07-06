import React from 'react';
import { Mail, Phone, Edit3, Trash2, Building2, Globe, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * LeadCard Component
 * Displays a single lead's information in a compact, visually rich card format.
 * Optimized with React.memo for high-performance listing refreshes.
 */
export const LeadCard = React.memo(({ lead, onEdit, onDelete }) => {
  const handleEditClick = () => {
    onEdit(lead);
  };

  const handleDeleteClick = () => {
    onDelete(lead);
  };

  // Generate initials from lead name (e.g. "Sarah Connor" → "SC")
  const initials = lead.name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Color palette for avatar backgrounds
  const avatarColors = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-teal-500',
  ];
  const avatarColor = avatarColors[
    (typeof lead.id === 'number' ? lead.id : lead.id?.toString().length || 0) % avatarColors.length
  ];

  return (
    <article
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
      aria-label={`Lead card for ${lead.name}`}
    >
      {/* Accent on hover */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />

      {/* Upper Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0`}
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#2563EB] dark:group-hover:text-indigo-400 transition-colors truncate">
                {lead.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">{lead.company}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <StatusBadge status={lead.status} />
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
          {/* Email */}
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#2563EB] dark:hover:text-indigo-400 transition-colors">
            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <a href={`mailto:${lead.email}`} className="truncate hover:underline">
              {lead.email}
            </a>
          </div>

          {/* Phone (optional) */}
          {lead.phone && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <a href={`tel:${lead.phone}`} className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                {lead.phone}
              </a>
            </div>
          )}

          {/* Source (optional) */}
          {lead.source && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{lead.source}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
          <Calendar className="w-3 h-3" aria-hidden="true" />
          {lead.dateAdded || 'N/A'}
        </span>

        {/* Action Controls - w-11 h-11 represents 44x44px touch targets */}
        <div className="flex gap-1" role="group" aria-label={`Actions for ${lead.name}`}>
          <button
            onClick={handleEditClick}
            className="w-11 h-11 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#2563EB] dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 flex items-center justify-center cursor-pointer"
            aria-label={`Edit ${lead.name}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="w-11 h-11 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#EF4444] dark:hover:text-red-450 hover:bg-red-50 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 flex items-center justify-center cursor-pointer"
            aria-label={`Delete ${lead.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
});

LeadCard.displayName = 'LeadCard';
export default LeadCard;
