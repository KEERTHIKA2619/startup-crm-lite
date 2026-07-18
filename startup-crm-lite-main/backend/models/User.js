import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Mongoose schema defining the User model structure and validation constraints.
 * Represents a user or admin in the Startup CRM Lite system.
 * 
 * @typedef {Object} User
 * @property {string} name - Full name of the user, min length 2, max length 50.
 * @property {string} email - Unique, validated email address (stored in lowercase).
 * @property {string} password - Hashed password for user authentication.
 * @property {('admin'|'user')} role - Role of the user, defaults to 'user'.
 * @property {boolean} isActive - Status of the user account, defaults to true.
 * @property {Date} createdAt - Automatically generated creation timestamp.
 * @property {Date} updatedAt - Automatically generated update timestamp.
 */
const userSchema = new mongoose.Schema(
  {
    /**
     * The full name of the user.
     * - Required: Yes.
     * - Trim: Removes surrounding whitespace.
     * - Length: Minimum 2 characters, maximum 50 characters.
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    /**
     * The unique email address used for login and notifications.
     * - Required: Yes.
     * - Unique: No duplicate email addresses allowed.
     * - Lowercase: Converted to lowercase to maintain consistency.
     * - Trim: Removes surrounding whitespace.
     * - Validation: Regex validation to ensure it follows a standard email format.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Email must be a valid email address'
      ]
    },

    /**
     * The user's hashed password.
     * - Required: Yes.
     * - Length: Minimum 6 characters (before hashing).
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },

    /**
     * The authorization role of the user inside the application.
     * - Type: String with restricted values ('admin' or 'user').
     * - Default: 'user'
     */
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'Role must be either admin or user'
      },
      default: 'user'
    },

    /**
     * Indicates whether the user account is active or suspended.
     * - Default: true
     */
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save middleware to hash the password before saving the user document.
 * Hashes the password using bcryptjs with 10 salt rounds, only if the password field is modified or new.
 */
userSchema.pre('save', async function () {
  // Only re-hash when the password field has actually changed
  if (!this.isModified('password')) return;

  const salt   = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


/**
 * Instance method to compare a candidate password with the user's stored hashed password.
 * 
 * @param {string} candidatePassword - The plain text password to compare.
 * @returns {Promise<boolean>} Resolves to true if passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

/**
 * Overrides the default toJSON method to remove sensitive information (like the password field)
 * before returning the document as JSON.
 * 
 * @returns {Object} Clean user object without password field.
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export { userSchema };
export default User;
