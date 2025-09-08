import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  subscriptionTier: {
    type: String,
    enum: ['basic', 'pro', 'premium'],
    default: 'basic'
  },
  tradingVolumeLimit: {
    type: Number,
    default: 100000 // $100K for basic tier
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  preferences: {
    notifications: {
      tradingAlerts: { type: Boolean, default: true },
      priceAlerts: { type: Boolean, default: false },
      slippageAlerts: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true }
    },
    aiSettings: {
      autoExecution: { type: Boolean, default: false },
      riskLevel: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'medium' 
      },
      maxSlippage: { type: Number, default: 0.5 },
      minConfidence: { type: Number, default: 80 }
    }
  },
  apiKeys: [{
    exchange: {
      type: String,
      required: true
    },
    apiKey: {
      type: String,
      required: true
    },
    apiSecret: {
      type: String,
      required: true
    },
    permissions: {
      type: String,
      enum: ['read', 'trade', 'read+trade'],
      default: 'read'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'pro', 'premium'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active'
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  stats: {
    totalTrades: { type: Number, default: 0 },
    totalVolume: { type: Number, default: 0 },
    totalSlippageSaved: { type: Number, default: 0 },
    averageSlippage: { type: Number, default: 0 },
    lastTradeDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ 'subscription.status': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim();
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update subscription tier limits
userSchema.methods.updateSubscriptionLimits = function() {
  const limits = {
    basic: 100000,
    pro: 1000000,
    premium: Infinity
  };
  
  this.tradingVolumeLimit = limits[this.subscriptionTier] || limits.basic;
};

// Method to check if user can make trade
userSchema.methods.canTrade = function(amount) {
  if (this.subscriptionTier === 'premium') return true;
  return this.stats.totalVolume + amount <= this.tradingVolumeLimit;
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

export default mongoose.model('User', userSchema);
