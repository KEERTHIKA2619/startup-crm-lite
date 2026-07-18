import mongoose from 'mongoose';

/**
 * Mongoose schema defining the Lead model structure, validations, indexes, and virtuals.
 * Represents a CRM lead in the Startup CRM Lite system.
 * 
 * @typedef {Object} Lead
 * @property {string} name - Full name of the lead contact, min length 2, max length 100.
 * @property {string} company - Name of the organization or company the lead is associated with.
 * @property {string} email - Lead contact's email address, validated format.
 * @property {string} [phone] - Optional phone number for contact.
 * @property {('New'|'Contacted'|'Meeting Scheduled'|'Proposal Sent'|'Won'|'Lost')} status - The current pipeline status of the lead, defaults to 'New'.
 * @property {('Website'|'Referral'|'LinkedIn'|'Cold Call'|'Email Campaign'|'Other')} source - Origin of the lead, defaults to 'Website'.
 * @property {string} [notes] - Optional internal notes regarding the lead, max length 1000.
 * @property {mongoose.Types.ObjectId} owner - Reference to the User who created/owns this lead.
 * @property {Date} createdAt - Automatically generated creation timestamp.
 * @property {Date} updatedAt - Automatically generated update timestamp.
 * @property {number} age - Virtual property calculating days elapsed since the lead was created.
 */
const leadSchema = new mongoose.Schema(
  {
    /**
     * Full name of the lead contact person.
     * - Required: Yes.
     * - Trim: Removes surrounding whitespace.
     * - Length: Minimum 2 characters, maximum 100 characters.
     */
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Lead name must be at least 2 characters long'],
      maxlength: [100, 'Lead name cannot exceed 100 characters']
    },

    /**
     * The company or organization the lead belongs to.
     * - Required: Yes.
     * - Trim: Removes surrounding whitespace.
     */
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },

    /**
     * The primary email address of the lead contact.
     * - Required: Yes.
     * - Trim: Removes surrounding whitespace.
     * - Validation: Regex validation to guarantee proper email structure.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Email must be a valid email address'
      ]
    },

    /**
     * Optional phone number of the lead.
     * - Required: No.
     * - Trim: Removes surrounding whitespace.
     */
    phone: {
      type: String,
      trim: true
    },

    /**
     * Job title or lead role
     */
    title: {
      type: String,
      trim: true
    },

    /**
     * Value of the lead/deal
     */
    value: {
      type: Number,
      default: 0
    },

    /**
     * The current status of the lead in the CRM pipeline.
     * - Values restricted to pipeline enum values matching frontend options:
     *   ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost']
     * - Default: 'New'
     */
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
        message: 'Status must be one of: New, Contacted, Meeting Scheduled, Proposal Sent, Won, Lost'
      },
      default: 'New'
    },

    /**
     * The channel or source from which the lead originated.
     * - Values restricted to enum matching frontend options:
     *   ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other']
     * - Default: 'Website'
     */
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'],
        message: 'Source must be one of: Website, Referral, LinkedIn, Cold Call, Email Campaign, Other'
      },
      default: 'Website'
    },

    /**
     * Optional additional details, logs, or custom notes regarding the lead.
     * - Length: Maximum 1000 characters.
     */
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },

    /**
     * The user account that created/manages this lead.
     * - Required: Yes.
     * - Ref: 'User' (relates to User model)
     */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner (User ID) is required']
    }
  },
  {
    timestamps: true,
    // Enable virtual fields to be included in JSON and object representations
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Virtual property calculating the age of the lead in number of days since creation.
 * Crucial for CRM pipeline age and conversion velocity analytics.
 * 
 * @name age
 * @type {number}
 */
leadSchema.virtual('age').get(function () {
  if (!this.createdAt) return 0;
  const timeDifferenceMs = Date.now() - this.createdAt.getTime();
  const millisecondsInADay = 1000 * 60 * 60 * 24;
  return Math.floor(timeDifferenceMs / millisecondsInADay);
});

// Compound index on owner + status — powers dashboard pipeline filter queries
leadSchema.index({ owner: 1, status: 1 });

// Compound index on owner + createdAt — powers date-range filters and monthly aggregations
leadSchema.index({ owner: 1, createdAt: -1 });

// Compound index on owner + source — powers the source breakdown aggregation
leadSchema.index({ owner: 1, source: 1 });

// Index on email for fast uniqueness checks and email-based searches
leadSchema.index({ email: 1 });

// Text index across name, company, email — powers the /search autocomplete endpoint
leadSchema.index(
  { name: 'text', company: 'text', email: 'text' },
  { name: 'lead_text_search', weights: { name: 10, company: 5, email: 1 } }
);

const Lead = mongoose.model('Lead', leadSchema);

export { leadSchema };
export default Lead;
