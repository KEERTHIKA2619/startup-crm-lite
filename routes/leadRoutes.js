import { Router } from 'express';
import { body, param } from 'express-validator';

import { protect }          from '../middleware/auth.js';
import { validate }         from '../middleware/validate.js';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads,
} from '../controllers/leadController.js';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL PROTECTION
// Apply protect middleware to every route in this file.
// Any unauthenticated request is rejected before reaching a controller.
// ─────────────────────────────────────────────────────────────────────────────
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION RULES
// ─────────────────────────────────────────────────────────────────────────────

/** Allowed enum values mirrored from the Lead model */
const VALID_STATUSES = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const VALID_SOURCES  = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

/**
 * createLeadRules — Full validation for the POST /leads endpoint.
 * name, company, and email are required; status and source must be valid enum values.
 */
const createLeadRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('company')
    .trim()
    .notEmpty().withMessage('Company is required'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('source')
    .optional()
    .isIn(VALID_SOURCES)
    .withMessage(`Source must be one of: ${VALID_SOURCES.join(', ')}`),

  body('phone')
    .optional()
    .trim(),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * updateLeadRules — Same rules as create but all fields are optional.
 * Useful for partial updates — only provided fields are validated.
 */
const updateLeadRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('company')
    .optional()
    .trim()
    .notEmpty().withMessage('Company cannot be empty'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('source')
    .optional()
    .isIn(VALID_SOURCES)
    .withMessage(`Source must be one of: ${VALID_SOURCES.join(', ')}`),

  body('phone')
    .optional()
    .trim(),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * updateStatusRules — Validates the single { status } field for the PATCH status endpoint.
 */
const updateStatusRules = [
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
];

/**
 * idParamRules — Ensures route :id params are valid MongoDB ObjectIds.
 */
const idParamRules = [
  param('id')
    .isMongoId().withMessage('Invalid lead ID format'),
];

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
//
// PRODUCTION NOTE on rate limiting:
//   Add express-rate-limit middleware before the routes below to prevent
//   API abuse. Example:
//     import rateLimit from 'express-rate-limit';
//     const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
//     router.use(apiLimiter);
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Route 1: GET /api/leads/stats
 * Aggregated statistics for the Dashboard StatsCard.
 * Must be declared BEFORE /:id routes to avoid "stats" being treated as an id.
 */
router.get('/stats', getLeadStats);
router.get('/stats/summary', getLeadStats);

/**
 * Route 2: GET /api/leads/monthly
 * Monthly lead and win counts for the Analytics bar chart.
 * Must be declared BEFORE /:id routes for the same reason.
 */
router.get('/monthly', getMonthlyStats);
router.get('/stats/monthly', getMonthlyStats);

/**
 * Route: GET /api/leads/search
 * Quick autocomplete search.
 * Must be declared BEFORE /:id routes to avoid "search" being treated as an id.
 */
router.get('/search', searchLeads);

/**
 * Route 3: GET /api/leads
 * List all leads for the authenticated user with filtering, search, and pagination.
 * Query params: status, search, page, limit, sortBy, sortOrder
 */
router.get('/', getLeads);

/**
 * Route 4: POST /api/leads
 * Create a new lead owned by the authenticated user.
 */
router.post('/', validate(createLeadRules), createLead);

/**
 * Route 5: GET /api/leads/:id
 * Retrieve a single lead by ID (must belong to the authenticated user).
 */
router.get('/:id', validate(idParamRules), getLeadById);

/**
 * Route 6: PUT /api/leads/:id
 * Update all editable fields of an existing lead.
 */
router.put('/:id', validate([...idParamRules, ...updateLeadRules]), updateLead);

/**
 * Route 7: PATCH /api/leads/:id/status
 * Lightweight status-only update for kanban-style drag-and-drop UX.
 */
router.patch('/:id/status', validate([...idParamRules, ...updateStatusRules]), updateLeadStatus);

/**
 * Route 8: DELETE /api/leads/:id
 * Permanently delete a lead (must belong to the authenticated user).
 */
router.delete('/:id', validate(idParamRules), deleteLead);

export default router;
