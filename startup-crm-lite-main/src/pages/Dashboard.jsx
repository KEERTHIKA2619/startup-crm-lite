/**
 * @file Dashboard.jsx
 * @description The root Dashboard page for PulseCRM.
 *
 * Layout (top → bottom):
 *  1. Welcome banner — greeting + today's date
 *  2. Stats cards row — 4 KPI cards (1-col mobile → 4-col desktop)
 *  3. Pipeline overview — full-width horizontal bar showing stage distribution
 *  4. Quick actions panel — 3 CTA cards for common tasks
 *  5. Two-column section:
 *       - Recent leads table (2/3 width on desktop)
 *       - Funnel health mini-card (1/3 width on desktop)
 *
 * Data is pulled from LeadContext (global CRUD state, persisted via
 * localStorage). All KPI values are derived at render time — no extra
 * fetch calls are required.
 *
 * @module pages/Dashboard
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Context ────────────────────────────────────────────────────────────────
import { useLeads } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';

// ── Dashboard sub-components ───────────────────────────────────────────────
import StatsCard        from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads      from '../components/dashboard/RecentLeads';
import QuickActions     from '../components/dashboard/QuickActions';
import FunnelHealthCard from '../components/dashboard/FunnelHealthCard';

// ── Shared lead components ─────────────────────────────────────────────────
import LeadModal  from '../components/leads/LeadModal';

// ── Utils ──────────────────────────────────────────────────────────────────
import { formatCompactCurrency, getTodayLabel } from '../utils/formatters';

// ── Lucide icons ───────────────────────────────────────────────────────────
import {
  Users,
  DollarSign,
  TrendingUp,
  Briefcase,
  Calendar,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// todayLabel and fmtCurrency are now imported from utils/formatters.js
// and wrapped in useMemo inside the component to avoid redundant calls.

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Dashboard page — assembles KPI cards, pipeline bar, recent leads, and
 * quick-action CTAs into a responsive grid layout.
 *
 * @returns {JSX.Element}
 */
export default function Dashboard() {
  // ── Real data from context ──────────────────────────────────────────────
  const { leads, openLeadDrawer } = useLeads();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  // ── Local UI state ──────────────────────────────────────────────────────
  /** Controls the page-level Add Lead modal */
  const [isModalOpen,    setIsModalOpen   ] = useState(false);

  // ── W4 fix: memoize today's date label (only changes at day boundary) ──
  const todayLabel = useMemo(() => getTodayLabel(), []);

  // ── C6 fix: all derived stats memoized — only recompute when leads change
  const derivedStats = useMemo(() => {
    const totalLeads   = leads.length;
    const wonLeads     = leads.filter((l) => l.status === 'Won').length;
    const lostLeads    = leads.filter((l) => l.status === 'Lost').length;
    const activeLeads  = leads.filter((l) => l.status !== 'Lost' && l.status !== 'Won').length;

    const pipelineValue = leads.reduce(
      (sum, l) => (l.status !== 'Lost' ? sum + l.value : sum), 0
    );
    const avgDealSize = totalLeads > 0
      ? Math.round(leads.reduce((sum, l) => sum + l.value, 0) / totalLeads)
      : 0;
    const winRate = (wonLeads + lostLeads) > 0
      ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100)
      : 0;
    const qualifiedCount = leads.filter((l) =>
      ['Proposal Sent', 'Proposal', 'Negotiation', 'Won'].includes(l.status)
    ).length;
    const conversionRate = totalLeads > 0
      ? Math.round((qualifiedCount / totalLeads) * 100)
      : 0;
    const activeDealRatio = totalLeads > 0
      ? Math.round((activeLeads / totalLeads) * 100)
      : 0;

    return {
      totalLeads, wonLeads, lostLeads, activeLeads,
      pipelineValue, avgDealSize, winRate,
      conversionRate, activeDealRatio,
    };
  }, [leads]);

  const {
    totalLeads, wonLeads, lostLeads, activeLeads,
    pipelineValue, avgDealSize, winRate,
    conversionRate, activeDealRatio,
  } = derivedStats;

  // ── Event handlers ──────────────────────────────────────────────────────

  // ── Stat card definitions (C6 fix: wrapped in useMemo) ─────────────────
  const stats = useMemo(() => [
    {
      title:    'Total Leads',
      value:    totalLeads,
      icon:     Users,
      change:   12,
      color:    'primary',
      subtitle: `${activeLeads} active in pipeline`,
    },
    {
      title:    'Pipeline Value',
      value:    formatCompactCurrency(pipelineValue),
      icon:     DollarSign,
      change:   8.4,
      color:    'success',
      subtitle: `Avg deal: ${formatCompactCurrency(avgDealSize)}`,
    },
    {
      title:    'Win Rate',
      value:    `${winRate}%`,
      icon:     TrendingUp,
      change:   4.2,
      color:    'warning',
      subtitle: `${wonLeads} won · ${lostLeads} lost`,
    },
    {
      title:    'Active Deals',
      value:    activeLeads,
      icon:     Briefcase,
      change:   -1.2,
      color:    'danger',
      subtitle: `${activeDealRatio}% of all leads`,
    },
  ], [totalLeads, activeLeads, pipelineValue, avgDealSize, winRate, wonLeads, lostLeads, activeDealRatio]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    /*
     * page-fade is a CSS animation class defined in index.css.
     * The outer div uses a standard vertical spacing stack.
     */
    <div className="p-4 md:p-6 space-y-6 page-fade" id="dashboard-page">

      {/* ── 1. Welcome banner ──────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {/* Greeting — personalised with the logged-in user's first name */}
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here's what's happening with your pipeline today.
          </p>
        </div>

        {/* Date badge — W4 fix: uses memoized todayLabel */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <Calendar size={13} aria-hidden="true" />
          <span>{todayLabel}</span>
        </div>
      </header>

      {/* ── 2. KPI Stats cards ─────────────────────────────────────────── */}
      {/*
       * Responsive grid:
       *  - Mobile (< sm)  : 1 column
       *  - Tablet (sm–lg) : 2 columns
       *  - Desktop (lg+)  : 4 columns
       */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="Key performance indicators"
      >
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            color={stat.color}
            subtitle={stat.subtitle}
          />
        ))}
      </section>

      {/* ── 3. Pipeline overview bar ────────────────────────────────────── */}
      <PipelineOverview leads={leads} />

      {/* ── 4. Quick actions ────────────────────────────────────────────── */}
      <QuickActions onAddLead={() => setIsModalOpen(true)} />

      {/* ── 5. Bottom two-column section ────────────────────────────────── */}
      {/*
       * On mobile stacks vertically; on lg+ sits side-by-side with
       * the table taking 2/3 width and the health card 1/3.
       */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent leads table — 2 columns on lg */}
        <div className="lg:col-span-2">
          <RecentLeads
            leads={leads}
            onRowClick={openLeadDrawer}
            onViewAll={() => navigate('/leads')}
          />
        </div>

        {/* Funnel health mini-card — W11 fix: extracted to FunnelHealthCard */}
        <FunnelHealthCard
          conversionRate={conversionRate}
          activeDealRatio={activeDealRatio}
          winRate={winRate}
        />
      </div>



      {/* ── Add Lead Modal ────────────────────────────────────────────────── */}
      {/*
       * This modal is LOCAL to Dashboard (not the global one in App.jsx).
       * It allows the QuickActions card to trigger it independently of the
       * Header button — both work; the global modal state in App.jsx handles
       * the Header trigger.
       */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
