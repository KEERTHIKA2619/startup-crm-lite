import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Regex for validating email format
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
      message: '{VALUE} is not a valid status'
    },
    default: 'New'
  },
  source: {
    type: String,
    enum: {
      values: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'],
      message: '{VALUE} is not a valid source'
    },
    default: 'Website'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field: age (returns number of days since the lead was created)
leadSchema.virtual('age').get(function() {
  if (!this.createdAt) return 0;
  const diffInMs = Date.now() - this.createdAt.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return Math.floor(diffInDays);
});

// Compound index on (owner, status) for fast filtered queries
leadSchema.index({ owner: 1, status: 1 });

// Index on email for fast lookup
leadSchema.index({ email: 1 });

// Compound index for owner and createdAt (useful for date range filters and sorting by createdAt)
leadSchema.index({ owner: 1, createdAt: -1 });

// Compound index for status, source, and owner
leadSchema.index({ owner: 1, status: 1, source: 1 });

// Indexes for autocomplete search scoped by owner
leadSchema.index({ owner: 1, name: 1 });
leadSchema.index({ owner: 1, company: 1 });
leadSchema.index({ owner: 1, email: 1 });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;

