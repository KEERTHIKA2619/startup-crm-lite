/**
 * @file controllers/leadController.js
 * @description CRUD and analytics controller functions for the Lead resource.
 *
 * All functions:
 *   - Are async and use try/catch → next(error) for error propagation.
 *   - Enforce owner isolation: every DB query includes { owner: req.user._id }.
 *   - Log key operations via devLog() in development mode.
 *   - Use the shared apiResponse utilities for consistent response shapes.
 *
 * Exported functions:
 *   getLeads        — paginated, filtered, sorted lead list
 *   createLead      — create a new lead owned by the current user
 *   getLeadById     — fetch a single lead by ID (owner-checked)
 *   updateLead      — fully update a lead (owner-checked, owner field protected)
 *   updateLeadStatus — update only the pipeline status (single-op findOneAndUpdate)
 *   deleteLead      — delete a lead using instance.deleteOne()
 *   getLeadStats    — single aggregation pipeline for all dashboard KPI cards
 *   getMonthlyStats — aggregation pipeline for 6-month analytics bar chart
 *   searchLeads     — lightweight autocomplete search endpoint
 */

import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse
} from '../utils/apiResponse.js';

// ─── Valid enum constants (mirror Lead model) ──────────────────────────────────
const VALID_STATUSES = [
  'New',
  'Contacted',
  'Meeting Scheduled',
  'Proposal Sent',
  'Won',
  'Lost'
];

// ─── Development logger ────────────────────────────────────────────────────────
/**
 * Logs messages to the console only in development mode.
 * Silenced in production to avoid log noise and data leakage.
 *
 * @param {...any} args - Values to log.
 */
const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    console.log('[Lead Controller]', ...args);
  }
};

// ─── getLeads ─────────────────────────────────────────────────────────────────
/**
 * Returns a paginated, filtered, and sorted list of leads owned by the
 * authenticated user. All query parameters are optional — each is only applied
 * to the MongoDB filter when it is actually present in the request.
 *
 * @async
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @query {string}  [status]    — Pipeline stage filter; pass 'All' or omit to skip.
 * @query {string}  [search]    — Case-insensitive $regex search across name/company/email.
 * @query {string}  [source]    — Lead source filter (e.g. 'LinkedIn', 'Website').
 * @query {string}  [dateFrom]  — ISO date string; filters leads created on/after this date.
 * @query {string}  [dateTo]    — ISO date string; filters leads created on/before this date.
 * @query {number}  [page=1]    — 1-based page index.
 * @query {number}  [limit=20]  — Records per page (min 1, max 100).
 * @query {string}  [sortBy='createdAt']  — Field to sort by.
 * @query {string}  [sortOrder='desc']    — 'asc' or 'desc'.
 *
 * @returns {200} paginatedResponse — {
 *   success, data: Lead[],
 *   pagination: { total, page, limit, pages, hasNext, hasPrev }
 * }
 */
export const getLeads = async (req, res, next) => {
  devLog('getLeads → user:', req.user?._id, '| query:', req.query);
  try {
    // 1. Destructure query params with defaults
    const {
      status,
      search,
      source,
      dateFrom,
      dateTo,
      page      = 1,
      limit     = 20,
      sortBy    = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // 2. Base filter — always restrict to the authenticated user's leads
    const filter = { owner: req.user._id };

    // 3. Status filter — skip when value is 'All' or not provided
    if (status && status !== 'All') {
      filter.status = status;
    }

    // 4. Source filter — only applied when explicitly provided
    if (source && source !== 'All') {
      filter.source = source;
    }

    // 5. Date-range filter on createdAt — each bound is independent
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Include the entire 'dateTo' day by setting time to end-of-day
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }

    // 6. Full-text search — case-insensitive regex across name, company, and email
    if (search && search.trim()) {
      filter.$or = [
        { name:    { $regex: search.trim(), $options: 'i' } },
        { company: { $regex: search.trim(), $options: 'i' } },
        { email:   { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // 7. Parse and clamp pagination values
    const pageNum  = Math.max(parseInt(page,  10) || 1,  1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip     = (pageNum - 1) * limitNum;

    // 8. Build sort object
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // 9. Run query + count concurrently for performance
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort(sort).skip(skip).limit(limitNum),
      Lead.countDocuments(filter)
    ]);

    devLog(`getLeads → returned ${leads.length}/${total} leads`);
    return paginatedResponse(res, leads, total, pageNum, limitNum);
  } catch (error) {
    devLog('getLeads ERROR:', error.message);
    next(error);
  }
};

// ─── createLead ───────────────────────────────────────────────────────────────
/**
 * Creates a new lead document and associates it with the authenticated user.
 *
 * @async
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @body {string} name    — Required. Lead contact's full name.
 * @body {string} company — Required. Company or organisation name.
 * @body {string} email   — Required. Valid email address.
 * @body {string} [phone]  — Optional. Contact phone number.
 * @body {string} [status] — Optional. Defaults to 'New' (schema default).
 * @body {string} [source] — Optional. Defaults to 'Website' (schema default).
 * @body {string} [notes]  — Optional. Internal notes (max 1000 chars).
 *
 * @returns {201} successResponse — { success, message, data: Lead }
 */
export const createLead = async (req, res, next) => {
  devLog('createLead → user:', req.user?._id, '| body:', req.body);
  try {
    // Spread all validated body fields, then force owner to the current user.
    // This prevents any client-supplied owner value from being persisted.
    const newLead = await Lead.create({
      ...req.body,
      owner: req.user._id
    });

    devLog('createLead → created lead _id:', newLead._id);
    return successResponse(res, newLead, 'Lead created successfully', 201);
  } catch (error) {
    devLog('createLead ERROR:', error.message);
    next(error);
  }
};

// ─── getLeadById ──────────────────────────────────────────────────────────────
/**
 * Retrieves a single lead by its MongoDB ObjectId, enforcing owner isolation.
 *
 * @async
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @param {string} req.params.id — MongoDB ObjectId of the target lead (validated by router).
 *
 * @returns {200} successResponse — { success, message, data: Lead }
 * @returns {404} errorResponse   — Lead not found (wrong ID or belongs to another user).
 */
export const getLeadById = async (req, res, next) => {
  devLog('getLeadById → id:', req.params?.id, '| user:', req.user?._id);
  try {
    // Owner isolation: only return the lead if it belongs to the current user
    const lead = await Lead.findOne({
      _id:   req.params.id,
      owner: req.user._id
    });

    if (!lead) {
      devLog('getLeadById → not found:', req.params.id);
      return errorResponse(res, 'Lead not found', 404);
    }

    devLog('getLeadById → found lead:', lead._id);
    return successResponse(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    devLog('getLeadById ERROR:', error.message);
    next(error);
  }
};

// ─── updateLead ───────────────────────────────────────────────────────────────
/**
 * Fully updates an existing lead document, enforcing owner isolation.
 * The `owner` field is explicitly stripped from the update payload to prevent
 * ownership transfer.
 *
 * @async
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @param {string} req.params.id  — MongoDB ObjectId of the target lead.
 * @body  {object} req.body       — Any subset of lead fields; `owner` is ignored.
 *
 * @returns {200} successResponse — { success, message, data: Lead } (updated document)
 * @returns {404} errorResponse   — Lead not found (wrong ID or belongs to another user).
 */
export const updateLead = async (req, res, next) => {
  devLog('updateLead → id:', req.params?.id, '| user:', req.user?._id, '| body:', req.body);
  try {
    // Build the update payload and explicitly remove the owner field
    const updateData = { ...req.body };
    delete updateData.owner;

    const updatedLead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id }, // owner isolation in query
      updateData,
      { returnDocument: 'after', runValidators: true } // return updated doc, run schema validators
    );

    if (!updatedLead) {
      devLog('updateLead → not found or ownership mismatch:', req.params.id);
      return errorResponse(res, 'Lead not found', 404);
    }

    devLog('updateLead → updated lead:', updatedLead._id);
    return successResponse(res, updatedLead, 'Lead updated successfully');
  } catch (error) {
    devLog('updateLead ERROR:', error.message);
    next(error);
  }
};

// ─── updateLeadStatus ─────────────────────────────────────────────────────────
/**
 * Updates only the `status` field of a lead in a single atomic DB operation.
 * Validates the status value against the allowed enum before touching the DB.
 *
 * @async
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @param {string} req.params.id   — MongoDB ObjectId of the target lead.
 * @body  {string} req.body.status — New pipeline stage. Must be one of VALID_STATUSES.
 *
 * @returns {200} successResponse — { success, message, data: Lead } (updated document)
 * @returns {400} errorResponse   — Invalid or missing status value.
 * @returns {404} errorResponse   — Lead not found (wrong ID or belongs to another user).
 */
export const updateLeadStatus = async (req, res, next) => {
  devLog('updateLeadStatus → id:', req.params?.id, '| user:', req.user?._id, '| body:', req.body);
  try {
    const { status } = req.body;

    // Secondary guard — route-level validation already runs this, but we
    // double-check to ensure the controller is safe if called without the middleware.
    if (!status || !VALID_STATUSES.includes(status)) {
      devLog('updateLeadStatus → invalid status supplied:', status);
      return errorResponse(
        res,
        `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        400
      );
    }

    // Single atomic findOneAndUpdate — no need to fetch-then-save
    const updatedLead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id }, // owner isolation
      { $set: { status } },                         // only touch the status field
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedLead) {
      devLog('updateLeadStatus → not found or ownership mismatch:', req.params.id);
      return errorResponse(res, 'Lead not found', 404);
    }

    devLog('updateLeadStatus → status updated to:', status, '| lead:', updatedLead._id);
    return successResponse(res, updatedLead, 'Lead status updated successfully');
  } catch (error) {
    devLog('updateLeadStatus ERROR:', error.message);
    next(error);
  }
};

// ─── deleteLead ───────────────────────────────────────────────────────────────
/**
 * Permanently deletes a lead document after verifying ownership.
 * Uses the Mongoose instance method .deleteOne() (not the static Model.deleteOne)
 * so that any pre/post 'deleteOne' hooks on the schema are triggered.
 *
 * @async
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @param {string} req.params.id — MongoDB ObjectId of the target lead.
 *
 * @returns {200} JSON           — { message: 'Lead deleted successfully' }
 * @returns {404} errorResponse  — Lead not found (wrong ID or belongs to another user).
 */
export const deleteLead = async (req, res, next) => {
  devLog('deleteLead → id:', req.params?.id, '| user:', req.user?._id);
  try {
    // Fetch first to enforce owner isolation and to use instance .deleteOne()
    const lead = await Lead.findOne({
      _id:   req.params.id,
      owner: req.user._id
    });

    if (!lead) {
      devLog('deleteLead → not found or ownership mismatch:', req.params.id);
      return errorResponse(res, 'Lead not found', 404);
    }

    // Trigger instance-level deleteOne (fires schema middleware hooks)
    await lead.deleteOne();

    devLog('deleteLead → deleted lead:', req.params.id);
    return res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    devLog('deleteLead ERROR:', error.message);
    next(error);
  }
};

// ─── getLeadStats ─────────────────────────────────────────────────────────────
/**
 * Computes all dashboard KPI metrics in a SINGLE MongoDB aggregation pipeline.
 *
 * Pipeline stages:
 *   $match   — restrict to current user's leads
 *   $facet   — run multiple sub-pipelines in parallel:
 *     overview       — total count, won count, this-month count, last-month count
 *     statusCounts   — count per pipeline status
 *     sourceCounts   — count per lead source
 *
 * Post-aggregation (in JS, O(n) on small arrays):
 *   - Hydrates statusBreakdown and sourceBreakdown maps with zero-filled defaults.
 *   - Computes conversionRate = (won / total) × 100, rounded to 1 decimal.
 *   - Computes growthRate = ((thisMonth − lastMonth) / lastMonth) × 100, rounded to 1 decimal.
 *   - Edge cases: division by zero → 0 for both rates; null lastMonth → null growthRate.
 *
 * @async
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {200} successResponse — {
 *   success, message,
 *   data: {
 *     totalLeads:      number,
 *     wonLeads:        number,
 *     lostLeads:       number,
 *     conversionRate:  number,          // (won/total)*100, 1 decimal, 0 when total=0
 *     statusBreakdown: { [status: string]: number },
 *     sourceBreakdown: { [source: string]: number },
 *     thisMonthLeads:  number,
 *     lastMonthLeads:  number,
 *     growthRate:      number | null    // null when lastMonth=0 (avoids misleading ∞%)
 *   }
 * }
 */
export const getLeadStats = async (req, res, next) => {
  devLog('getLeadStats → user:', req.user?._id);
  try {
    // ── Date boundaries for this-month / last-month sub-pipelines ──────────────
    const now               = new Date();
    const thisMonthStart    = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // lastMonthEnd is the millisecond before thisMonthStart
    const lastMonthEnd      = new Date(thisMonthStart.getTime() - 1);

    // ── Single aggregation with $facet for parallel sub-pipelines ──────────────
    const [result] = await Lead.aggregate([
      // Stage 1: owner isolation — only this user's leads flow through
      {
        $match: { owner: new mongoose.Types.ObjectId(req.user._id) }
      },

      // Stage 2: $facet runs three independent sub-pipelines on the same input set
      {
        $facet: {
          // 2a. Totals: overall count + won count + monthly window counts
          overview: [
            {
              $group: {
                _id:           null,
                totalLeads:    { $sum: 1 },
                wonLeads:      { $sum: { $cond: [{ $eq: ['$status', 'Won']  }, 1, 0] } },
                lostLeads:     { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
                thisMonthLeads: {
                  $sum: {
                    $cond: [
                      { $gte: ['$createdAt', thisMonthStart] },
                      1, 0
                    ]
                  }
                },
                lastMonthLeads: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ['$createdAt', lastMonthStart] },
                          { $lte: ['$createdAt', lastMonthEnd]   }
                        ]
                      },
                      1, 0
                    ]
                  }
                }
              }
            }
          ],

          // 2b. Count per pipeline status
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],

          // 2c. Count per lead source
          sourceCounts: [
            { $group: { _id: '$source', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    // ── Unpack the $facet result ───────────────────────────────────────────────
    const overviewDoc     = result.overview[0]    ?? {};
    const totalLeads      = overviewDoc.totalLeads      ?? 0;
    const wonLeads        = overviewDoc.wonLeads        ?? 0;
    const lostLeads       = overviewDoc.lostLeads       ?? 0;
    const thisMonthLeads  = overviewDoc.thisMonthLeads  ?? 0;
    const lastMonthLeads  = overviewDoc.lastMonthLeads  ?? 0;

    // ── Compute conversionRate — guard against division by zero ────────────────
    const conversionRate = totalLeads > 0
      ? Math.round((wonLeads / totalLeads) * 1000) / 10   // round to 1 decimal
      : 0;

    // ── Compute growthRate — null when lastMonth=0 (avoid misleading ∞%) ──────
    let growthRate = null;
    if (lastMonthLeads > 0) {
      growthRate = Math.round(
        ((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 1000
      ) / 10;
    }

    // ── Build zero-filled statusBreakdown map ──────────────────────────────────
    const statusBreakdown = {
      'New':              0,
      'Contacted':        0,
      'Meeting Scheduled': 0,
      'Proposal Sent':    0,
      'Won':              0,
      'Lost':             0
    };
    result.statusCounts.forEach(({ _id: status, count }) => {
      if (status in statusBreakdown) {
        statusBreakdown[status] = count;
      }
    });

    // ── Build zero-filled sourceBreakdown map ──────────────────────────────────
    const sourceBreakdown = {
      'Website':        0,
      'Referral':       0,
      'LinkedIn':       0,
      'Cold Call':      0,
      'Email Campaign': 0,
      'Other':          0
    };
    result.sourceCounts.forEach(({ _id: source, count }) => {
      if (source in sourceBreakdown) {
        sourceBreakdown[source] = count;
      }
    });

    const statsPayload = {
      totalLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      statusBreakdown,
      sourceBreakdown,
      thisMonthLeads,
      lastMonthLeads,
      growthRate
    };

    devLog('getLeadStats → result:', statsPayload);
    return successResponse(res, statsPayload, 'Lead stats retrieved successfully');
  } catch (error) {
    devLog('getLeadStats ERROR:', error.message);
    next(error);
  }
};

// ─── getMonthlyStats ──────────────────────────────────────────────────────────
/**
 * Aggregates lead creation, won, and lost counts grouped by calendar month for
 * the last 6 months. Intended for the Analytics page bar/line chart.
 *
 * The function builds a chronological 6-slot template (oldest → newest) and
 * merges the aggregation results into it, so months with zero leads are still
 * returned with zeros (charts need a data point for every month).
 *
 * @async
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {200} successResponse — {
 *   success, message,
 *   data: Array<{
 *     month:          string,   // e.g. 'Jan 2025'
 *     total:          number,
 *     won:            number,
 *     lost:           number,
 *     conversionRate: number    // (won/total)*100 rounded to 1 decimal; 0 when total=0
 *   }>
 * }
 * Sorted oldest → newest so charts render left-to-right chronologically.
 */
export const getMonthlyStats = async (req, res, next) => {
  devLog('getMonthlyStats → user:', req.user?._id);
  try {
    // Start-of-month 5 months ago (inclusive) → covers 6 calendar months total
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // ── Aggregation pipeline ──────────────────────────────────────────────────
    const monthlyData = await Lead.aggregate([
      {
        // Stage 1: restrict to current user's leads created within the 6-month window
        $match: {
          owner:     new mongoose.Types.ObjectId(req.user._id),
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        // Stage 2: group by calendar year + month; count total, won, and lost
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          won: {
            $sum: { $cond: [{ $eq: ['$status', 'Won']  }, 1, 0] }
          },
          lost: {
            $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] }
          }
        }
      },
      {
        // Stage 3: sort chronologically (oldest first → chart left-to-right)
        $sort: {
          '_id.year':  1,
          '_id.month': 1
        }
      }
    ]);

    // ── Build zero-filled 6-slot chronological template ───────────────────────
    const MONTH_NAMES = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const template = [];
    for (let offset = 5; offset >= 0; offset--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - offset);
      template.push({
        year:       d.getFullYear(),
        monthIndex: d.getMonth() + 1,                          // 1-12, matches $month
        month:      `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, // e.g. 'Jan 2025'
        total: 0,
        won:   0,
        lost:  0
      });
    }

    // ── Merge aggregation results into the template (zero-fill missing months) ─
    monthlyData.forEach(({ _id: { year, month: mongoMonth }, total, won, lost }) => {
      const slot = template.find(
        (t) => t.year === year && t.monthIndex === mongoMonth
      );
      if (slot) {
        slot.total = total;
        slot.won   = won;
        slot.lost  = lost;
      }
    });

    // ── Strip internal fields and add conversionRate per month ────────────────
    const result = template.map(({ month, total, won, lost }) => ({
      month,
      total,
      won,
      lost,
      conversionRate: total > 0
        ? Math.round((won / total) * 1000) / 10   // 1-decimal percentage
        : 0
    }));

    devLog('getMonthlyStats → result:', result);
    return successResponse(res, result, 'Monthly stats retrieved successfully');
  } catch (error) {
    devLog('getMonthlyStats ERROR:', error.message);
    next(error);
  }
};

// ─── searchLeads ──────────────────────────────────────────────────────────────
/**
 * Lightweight autocomplete search endpoint, designed for debounced React
 * SearchBar components. Returns a minimal projection (no full documents) capped
 * at `limit` results for performance.
 *
 * The search is a case-insensitive $regex across name, company, and email.
 * Owner isolation is enforced so users only ever see their own leads.
 *
 * @async
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @query {string} q          — Required. Search term (min 1 char after trim).
 * @query {number} [limit=5]  — Max results to return (capped at 10).
 *
 * @returns {200} successResponse — {
 *   success, message,
 *   data: Array<{ _id, name, company, email, status }>
 * }
 * @returns {400} errorResponse   — Missing or empty query parameter `q`.
 *
 * @example
 *   GET /api/leads/search?q=ali&limit=5
 *   → [{ _id: '...', name: 'Ali Khan', company: 'Acme', email: 'ali@acme.com', status: 'New' }]
 */
export const searchLeads = async (req, res, next) => {
  devLog('searchLeads → user:', req.user?._id, '| q:', req.query.q);
  try {
    const { q, limit = 5 } = req.query;

    // Guard: q must be present and non-empty
    if (!q || !q.trim()) {
      return errorResponse(res, 'Query parameter `q` is required', 400);
    }

    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10);

    const leads = await Lead.find(
      {
        owner: req.user._id,
        $or: [
          { name:    { $regex: q.trim(), $options: 'i' } },
          { company: { $regex: q.trim(), $options: 'i' } },
          { email:   { $regex: q.trim(), $options: 'i' } }
        ]
      },
      // Projection — return only the fields needed for autocomplete
      { _id: 1, name: 1, company: 1, email: 1, status: 1 }
    ).limit(limitNum);

    devLog(`searchLeads → returned ${leads.length} result(s) for q="${q}"`);
    return successResponse(res, leads, 'Search results retrieved successfully');
  } catch (error) {
    devLog('searchLeads ERROR:', error.message);
    next(error);
  }
};
