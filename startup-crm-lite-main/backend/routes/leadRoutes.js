/**
 * @file routes/leadRoutes.js
 * @description Express router for the Lead resource.
 *
 * All routes are protected behind the `protect` middleware via router.use().
 * Validation is handled by express-validator chains, then passed through the
 * `validate` middleware which formats and returns 400 errors automatically.
 *
 * Endpoint map:
 *   GET    /api/leads                → getLeads        (paginated, filtered list)
 *   POST   /api/leads                → createLead      (create a new lead)
 *   GET    /api/leads/stats          → getLeadStats    (single aggregation: KPIs)
 *   GET    /api/leads/monthly-stats  → getMonthlyStats (6-month bar chart data)
 *   GET    /api/leads/search         → searchLeads     (autocomplete — max 10 results)
 *   GET    /api/leads/:id            → getLeadById     (single lead by ID)
 *   PUT    /api/leads/:id            → updateLead      (full update)
 *   PATCH  /api/leads/:id/status     → updateLeadStatus (status-only update)
 *   DELETE /api/leads/:id            → deleteLead      (delete a lead)
 */

import express from 'express';
import { body, param } from 'express-validator';

import protect  from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads
} from '../controllers/leadController.js';

const router = express.Router();

// ─── Global protection ────────────────────────────────────────────────────────
// Apply the protect middleware to EVERY route defined on this router.
router.use(protect);

// ─── Valid enum constants ─────────────────────────────────────────────────────
const VALID_STATUSES = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const VALID_SOURCES  = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

// ─── Validation rule sets ─────────────────────────────────────────────────────

/**
 * idParamValidation
 * Validates that the `:id` URL parameter is a valid MongoDB ObjectId.
 */
const idParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID format — must be a valid MongoDB ObjectId')
];

/**
 * leadValidationRules
 * Validates the body fields required when creating or fully updating a lead.
 *
 * Rules:
 *   name    — required, trimmed, minimum length 2
 *   company — required, trimmed, not empty
 *   email   — required, valid RFC-5321 email address
 *   status  — optional; if provided must match one of the 6 pipeline stages
 *   source  — optional; if provided must match one of the 6 source channels
 *   phone   — optional, trimmed
 *   notes   — optional, trimmed
 */
const leadValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
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

  body('title')
    .optional()
    .trim(),

  body('value')
    .optional()
    .customSanitizer(val => val === '' ? 0 : Number(val))
    .isNumeric()
    .withMessage('Value must be a number'),

  body('notes')
    .optional()
    .trim()
];

/**
 * updateStatusValidationRules
 * Validates the body and :id param for the PATCH /:id/status endpoint.
 *
 * Rules:
 *   id     — must be a valid MongoDB ObjectId (from param)
 *   status — required, must match one of the 6 pipeline stage values
 */
const updateStatusValidationRules = [
  ...idParamValidation,
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`)
];

// ─── Route definitions ────────────────────────────────────────────────────────
// NOTE: Static paths (/stats, /monthly-stats) are declared BEFORE the dynamic
// /:id path to prevent Express from treating them as ObjectId parameters.

/**
 * @route  GET /api/leads
 * @desc   Return a paginated, filtered list of leads for the authenticated user.
 * @access Private (JWT required)
 * @query  { status, search, page, limit, sortBy, sortOrder }
 */
router.get('/', getLeads);

/**
 * @route   GET /api/leads/stats
 * @desc    Get dashboard lead status metrics and conversion rate
 * @access  Private
 */
router.get('/stats', getLeadStats);
router.get('/stats/summary', getLeadStats);

/**
 * @route   GET /api/leads/monthly-stats
 * @desc    Get monthly lead count history (last 6 months)
 * @access  Private
 */
router.get('/monthly-stats', getMonthlyStats);
router.get('/stats/monthly', getMonthlyStats);

/**
 * @route  GET /api/leads/search
 * @desc   Autocomplete search — returns up to 10 leads matching ?q=<term> for the
 *         authenticated user. Intended for debounced React SearchBar components.
 * @access Private (JWT required)
 * @query  q     {string} — Required. Search term matched against name/company/email.
 * @query  limit {number} — Optional. Max results (default 5, max 10).
 */
router.get('/search', searchLeads);

/**
 * @route  GET /api/leads/:id
 * @desc   Return a single lead document belonging to the authenticated user.
 * @access Private (JWT required)
 * @param  id — MongoDB ObjectId of the lead
 */
router.get('/:id', validate(idParamValidation), getLeadById);

/**
 * @route  POST /api/leads
 * @desc   Create a new lead owned by the authenticated user.
 * @access Private (JWT required)
 * @body   { name, company, email, phone?, status?, source?, notes? }
 */
router.post('/', validate(leadValidationRules), createLead);

/**
 * @route  PUT /api/leads/:id
 * @desc   Fully update an existing lead belonging to the authenticated user.
 * @access Private (JWT required)
 * @param  id — MongoDB ObjectId of the lead
 * @body   { name, company, email, phone?, status?, source?, notes? }
 */
router.put('/:id', validate([...idParamValidation, ...leadValidationRules]), updateLead);

/**
 * @route  PATCH /api/leads/:id/status
 * @desc   Update only the pipeline status of a lead belonging to the authenticated user.
 * @access Private (JWT required)
 * @param  id — MongoDB ObjectId of the lead
 * @body   { status }
 */
router.patch('/:id/status', validate(updateStatusValidationRules), updateLeadStatus);

/**
 * @route  DELETE /api/leads/:id
 * @desc   Permanently delete a lead belonging to the authenticated user.
 * @access Private (JWT required)
 * @param  id — MongoDB ObjectId of the lead
 */
router.delete('/:id', validate(idParamValidation), deleteLead);

export default router;
