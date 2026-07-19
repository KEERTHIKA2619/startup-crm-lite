import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';

// ─── Valid enum values (mirrored from Lead model) ─────────────────────────────
const VALID_STATUSES = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: log only in development
// ─────────────────────────────────────────────────────────────────────────────
const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[LeadController]', ...args);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * getLeads — List all leads belonging to the authenticated user with advanced filters and pagination.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.page=1] - Page number to retrieve
 * @param {string} [req.query.limit=20] - Number of items per page
 * @param {string} [req.query.sortBy='createdAt'] - Field to sort leads by
 * @param {string} [req.query.sortOrder='desc'] - Sort direction ('asc' or 'desc')
 * @param {string} [req.query.status] - Filter by lead status (e.g., 'New', 'Won')
 * @param {string} [req.query.source] - Filter by lead source (e.g., 'Website', 'Referral')
 * @param {string} [req.query.search] - Search term matching name, company, or email (case-insensitive)
 * @param {string} [req.query.dateFrom] - Filter leads created on or after this ISO date string
 * @param {string} [req.query.dateTo] - Filter leads created on or before this ISO date string
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing:
 *   - success: boolean
 *   - data: Array of lead documents matching filters
 *   - pagination: { total: number, page: number, limit: number, pages: number, hasNext: boolean, hasPrev: boolean }
 */
export const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search,
      source,
      dateFrom,
      dateTo,
    } = req.query;

    const pageNum  = parseInt(page,  10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    // 1. Build base filter: scope to the authenticated user
    const filter = { owner: req.user._id };

    // 2. Filter by status (skip if 'All' is passed or empty)
    if (status && status !== 'All') {
      filter.status = status;
    }

    // 3. Filter by source (skip if 'All' is passed or empty)
    if (source && source !== 'All') {
      filter.source = source;
    }

    // 4. Date range filters
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!isNaN(fromDate.getTime())) {
          filter.createdAt.$gte = fromDate;
        }
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (!isNaN(toDate.getTime())) {
          filter.createdAt.$lte = toDate;
        }
      }
      if (Object.keys(filter.createdAt).length === 0) {
        delete filter.createdAt;
      }
    }

    // 5. Search filter (case-insensitive regex)
    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { name:    regex },
        { company: regex },
        { email:   regex },
      ];
    }

    devLog(`getLeads — filter: ${JSON.stringify(filter)}, page: ${pageNum}, limit: ${limitNum}`);

    const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    return paginatedResponse(res, leads, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * createLead — Create a new lead owned by the authenticated user.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Lead configuration details
 * @param {string} req.body.name - Full name of the lead
 * @param {string} req.body.company - Company name
 * @param {string} req.body.email - Valid email address
 * @param {string} [req.body.phone] - Contact number
 * @param {string} [req.body.status] - Initial status
 * @param {string} [req.body.source] - Lead source
 * @param {string} [req.body.notes] - Custom notes description
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing the newly created lead document
 */
export const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, source, notes } = req.body;

    devLog(`createLead — creating lead for user ${req.user._id}: ${email}`);

    const lead = await Lead.create({
      name,
      company,
      email,
      phone,
      status,
      source,
      notes,
      owner: req.user._id,
    });

    return successResponse(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * getLeadById — Fetch a single lead by its MongoDB ObjectId.
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Lead ObjectId
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing the lead details if found and authorized
 */
export const getLeadById = async (req, res, next) => {
  try {
    devLog(`getLeadById — id: ${req.params.id}, user: ${req.user._id}`);

    const lead = await Lead.findOne({
      _id:   req.params.id,
      owner: req.user._id,
    });

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * updateLead — Update all editable fields of an existing lead.
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Lead ObjectId
 * @param {Object} req.body - Fields to update
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing the updated lead document
 */
export const updateLead = async (req, res, next) => {
  try {
    devLog(`updateLead — id: ${req.params.id}, user: ${req.user._id}`);

    const existing = await Lead.findOne({
      _id:   req.params.id,
      owner: req.user._id,
    });

    if (!existing) {
      return errorResponse(res, 'Lead not found', 404);
    }

    // Strip owner field to prevent changing lead ownership
    const { owner: _removed, ...updateData } = req.body;

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    devLog(`updateLead — updated lead ${updatedLead._id}`);

    return successResponse(res, updatedLead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * updateLeadStatus — Lightweight endpoint to update only the status field.
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Lead ObjectId
 * @param {Object} req.body - Contains status field
 * @param {string} req.body.status - Must be one of the valid enum values
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with the updated lead document
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    devLog(`updateLeadStatus — id: ${req.params.id}, status: ${status}`);

    if (!VALID_STATUSES.includes(status)) {
      return errorResponse(
        res,
        `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        400
      );
    }

    const updatedLead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    devLog(`updateLeadStatus — lead ${updatedLead._id} is now "${status}"`);

    return successResponse(res, updatedLead, `Lead status updated to "${status}"`);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * deleteLead — Permanently delete a lead.
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Lead ObjectId
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response confirming successful deletion
 */
export const deleteLead = async (req, res, next) => {
  try {
    devLog(`deleteLead — id: ${req.params.id}, user: ${req.user._id}`);

    const lead = await Lead.findOne({
      _id:   req.params.id,
      owner: req.user._id,
    });

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    await lead.deleteOne();

    devLog(`deleteLead — deleted lead ${req.params.id}`);

    return successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * getLeadStats — Aggregate overview statistics for the authenticated user's leads in a SINGLE query.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response containing analytics stats:
 *   - totalLeads: number
 *   - statusBreakdown: { New: number, Contacted: number, 'Meeting Scheduled': number, 'Proposal Sent': number, Won: number, Lost: number }
 *   - conversionRate: number (percentage of won leads out of total leads, rounded to 1 decimal)
 *   - sourceBreakdown: { Website: number, Referral: number, LinkedIn: number, 'Cold Call': number, 'Email Campaign': number, Other: number }
 *   - thisMonthLeads: number (count of leads created in current calendar month)
 *   - lastMonthLeads: number (count of leads created in last calendar month)
 *   - growthRate: number (growth rate percentage from last month to this month, rounded to 1 decimal)
 */
export const getLeadStats = async (req, res, next) => {
  try {
    devLog(`getLeadStats — user: ${req.user._id}`);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed for MongoDB $month

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonthVal = lastMonthDate.getMonth() + 1;

    const aggregateResult = await Lead.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $facet: {
          totalCount: [
            { $count: 'count' }
          ],
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          sourceCounts: [
            { $group: { _id: '$source', count: { $sum: 1 } } }
          ],
          monthlyCounts: [
            {
              $project: {
                isThisMonth: {
                  $cond: [
                    {
                      $and: [
                        { $eq: [{ $year: '$createdAt' }, currentYear] },
                        { $eq: [{ $month: '$createdAt' }, currentMonth] }
                      ]
                    },
                    1,
                    0
                  ]
                },
                isLastMonth: {
                  $cond: [
                    {
                      $and: [
                        { $eq: [{ $year: '$createdAt' }, lastMonthYear] },
                        { $eq: [{ $month: '$createdAt' }, lastMonthVal] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                thisMonthLeads: { $sum: '$isThisMonth' },
                lastMonthLeads: { $sum: '$isLastMonth' }
              }
            }
          ]
        }
      }
    ]);

    const result = aggregateResult[0] || {};
    const totalLeads = result.totalCount?.[0]?.count || 0;

    const statusBreakdown = {
      'New': 0,
      'Contacted': 0,
      'Meeting Scheduled': 0,
      'Proposal Sent': 0,
      'Won': 0,
      'Lost': 0
    };
    if (result.statusCounts) {
      result.statusCounts.forEach(item => {
        if (item._id && statusBreakdown.hasOwnProperty(item._id)) {
          statusBreakdown[item._id] = item.count;
        }
      });
    }

    // Safely calculate conversion rate (Won leads / total leads) * 100
    const wonLeads = statusBreakdown['Won'] || 0;
    const conversionRate = totalLeads > 0
      ? parseFloat(((wonLeads / totalLeads) * 100).toFixed(1))
      : 0.0;

    const sourceBreakdown = {
      'Website': 0,
      'Referral': 0,
      'LinkedIn': 0,
      'Cold Call': 0,
      'Email Campaign': 0,
      'Other': 0
    };
    if (result.sourceCounts) {
      result.sourceCounts.forEach(item => {
        if (item._id && sourceBreakdown.hasOwnProperty(item._id)) {
          sourceBreakdown[item._id] = item.count;
        }
      });
    }

    const thisMonthLeads = result.monthlyCounts?.[0]?.thisMonthLeads || 0;
    const lastMonthLeads = result.monthlyCounts?.[0]?.lastMonthLeads || 0;

    // Safely calculate monthly growth rate avoiding division by zero
    let growthRate = 0.0;
    if (lastMonthLeads > 0) {
      growthRate = parseFloat((((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100).toFixed(1));
    } else if (thisMonthLeads > 0) {
      growthRate = 100.0;
    }

    const stats = {
      totalLeads,
      statusBreakdown,
      conversionRate,
      sourceBreakdown,
      thisMonthLeads,
      lastMonthLeads,
      growthRate
    };

    devLog(`getLeadStats — result: ${JSON.stringify(stats)}`);

    return successResponse(res, stats, 'Lead stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * getMonthlyStats — Aggregate lead creation, wins, losses, and conversion rate for the last 6 months.
 * Handles missing months by generating them with zero counts.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with 6-month historical list:
 *   - month: string (e.g. 'Jan 2026')
 *   - total: number (total leads created)
 *   - won: number (won count)
 *   - lost: number (lost count)
 *   - conversionRate: number (won/total percentage, rounded to 1 decimal)
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    devLog(`getMonthlyStats — user: ${req.user._id}`);

    // Calculate start date: 5 months ago (start of the month)
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const pipeline = [
      {
        $match: {
          owner:     new mongoose.Types.ObjectId(req.user._id),
          createdAt: { $gte: start },
        },
      },
      {
        $project: {
          year:  { $year:  '$createdAt' },
          month: { $month: '$createdAt' },
          isWon: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] },
          isLost: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] },
        },
      },
      {
        $group: {
          _id:   { year: '$year', month: '$month' },
          total: { $sum: 1 },
          won:   { $sum: '$isWon' },
          lost:  { $sum: '$isLost' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ];

    const rawData = await Lead.aggregate(pipeline);

    const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const result = [];
    // Ensure all 6 months are accounted for even if they contain zero leads
    for (let i = 5; i >= 0; i--) {
      const d         = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearVal   = d.getFullYear();
      const monthVal  = d.getMonth() + 1; // 1-indexed

      const bucket = rawData.find(
        (r) => r._id.year === yearVal && r._id.month === monthVal
      );

      const total = bucket ? bucket.total : 0;
      const won = bucket ? bucket.won : 0;
      const lost = bucket ? bucket.lost : 0;
      const conversionRate = total > 0
        ? parseFloat(((won / total) * 100).toFixed(1))
        : 0.0;

      result.push({
        month: `${MONTH_ABBR[d.getMonth()]} ${yearVal}`,
        total,
        won,
        lost,
        conversionRate,
      });
    }

    devLog(`getMonthlyStats — result: ${JSON.stringify(result)}`);

    return successResponse(res, result, 'Monthly stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * searchLeads — Lightweight autocomplete search for React SearchBar.
 * Returns only _id, name, company, email, status, capped to 5 results for performance.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.q] - Search query parameter
 * @param {string} [req.query.limit=5] - Maximum number of results (hard-capped at 5)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with autocomplete results
 */
export const searchLeads = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;
    const limitNum = Math.min(parseInt(limit, 10) || 5, 5);

    if (!q || !q.trim()) {
      return successResponse(res, [], 'Search query is empty');
    }

    const regex = { $regex: q.trim(), $options: 'i' };
    const filter = {
      owner: req.user._id,
      $or: [
        { name: regex },
        { company: regex },
        { email: regex }
      ]
    };

    devLog(`searchLeads — query: ${q.trim()}, limit: ${limitNum}`);

    const leads = await Lead.find(filter)
      .select('_id name company email status')
      .limit(limitNum);

    return successResponse(res, leads, 'Search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};

