import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  refreshTokens: {
    type: [String],
    default: [],
    select: false,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    },
  },
});

// Index for email lookup
userSchema.index({ email: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function(): string {
  const payload = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role,
  };

  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', options);
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function(): string {
  const payload = {
    userId: this._id.toString(),
    type: 'refresh',
  };

  const options: SignOptions = { expiresIn: '30d' };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret', options);
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by reset token
userSchema.statics.findByPasswordResetToken = function(token: string) {
  return this.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
};

export default mongoose.model<IUser>('User', userSchema); 