import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  tradeId: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  symbol: {
    type: String,
    required: true,
    index: true
  },
  side: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  orderType: {
    type: String,
    enum: ['market', 'limit', 'stop', 'stop_limit'],
    default: 'market'
  },
  orderSize: {
    type: Number,
    required: true,
    min: 0
  },
  requestedPrice: Number, // For limit orders
  entryPrice: Number, // Actual execution price
  exitPrice: Number, // For closed positions
  executionTime: Date,
  exchangeUsed: [{
    exchangeId: {
      type: String,
      required: true,
      ref: 'Exchange'
    },
    portion: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    price: Number,
    quantity: Number,
    fees: Number,
    orderId: String // Exchange-specific order ID
  }],
  slippage: {
    expected: Number,
    actual: Number,
    saved: Number // Amount saved by AI optimization
  },
  status: {
    type: String,
    enum: ['pending', 'partially_filled', 'filled', 'cancelled', 'rejected', 'expired'],
    default: 'pending',
    index: true
  },
  slippageMinimized: {
    type: Boolean,
    default: false
  },
  aiRecommendation: {
    strategy: String, // 'single_exchange', 'split_order', 'time_weighted', etc.
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    reasoning: String,
    estimatedSavings: Number,
    optimalExchanges: [{
      exchangeId: String,
      allocation: Number,
      expectedPrice: Number,
      expectedSlippage: Number
    }],
    timing: {
      immediate: Boolean,
      delayRecommended: Number, // Seconds to wait
      reason: String
    }
  },
  execution: {
    strategy: String, // Actual strategy used
    totalFees: Number,
    totalSlippage: Number,
    executionTime: Number, // Milliseconds
    partialFills: [{
      exchangeId: String,
      quantity: Number,
      price: Number,
      timestamp: Date,
      fees: Number
    }],
    failedAttempts: [{
      exchangeId: String,
      error: String,
      timestamp: Date,
      retryCount: Number
    }]
  },
  performance: {
    slippageSaved: Number, // USD amount saved
    feesTotal: Number,
    executionQuality: {
      type: Number,
      min: 0,
      max: 100
    }, // 0-100 score
    benchmarkComparison: {
      singleExchangeBest: Number,
      volumeWeightedAverage: Number,
      improvement: Number // Percentage improvement
    }
  },
  riskMetrics: {
    exposureTime: Number, // Milliseconds exposed to market risk
    priceImpact: Number, // Percentage
    liquidityUtilized: Number, // Percentage of available liquidity used
    marketCondition: {
      type: String,
      enum: ['normal', 'volatile', 'illiquid', 'trending']
    }
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    apiVersion: String,
    clientOrderId: String,
    tags: [String], // User-defined tags
    notes: String
  },
  compliance: {
    kycVerified: Boolean,
    riskAssessment: String,
    jurisdictionChecks: [String],
    sanctionsScreening: {
      status: String,
      timestamp: Date,
      provider: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1, createdAt: -1 });
tradeSchema.index({ status: 1 });
tradeSchema.index({ executionTime: -1 });
tradeSchema.index({ 'exchangeUsed.exchangeId': 1 });
tradeSchema.index({ tradeId: 1 });

// Virtual for total value
tradeSchema.virtual('totalValue').get(function() {
  return this.orderSize * (this.entryPrice || this.requestedPrice || 0);
});

// Virtual for profit/loss (for closed positions)
tradeSchema.virtual('pnl').get(function() {
  if (!this.exitPrice || !this.entryPrice) return 0;
  
  const multiplier = this.side === 'buy' ? 1 : -1;
  return (this.exitPrice - this.entryPrice) * this.orderSize * multiplier;
});

// Virtual for execution efficiency
tradeSchema.virtual('executionEfficiency').get(function() {
  if (!this.aiRecommendation?.estimatedSavings || !this.performance?.slippageSaved) {
    return 0;
  }
  
  return (this.performance.slippageSaved / this.aiRecommendation.estimatedSavings) * 100;
});

// Method to calculate actual slippage
tradeSchema.methods.calculateActualSlippage = function() {
  if (!this.entryPrice || !this.requestedPrice) return 0;
  
  const referencePrice = this.requestedPrice;
  const actualPrice = this.entryPrice;
  
  return Math.abs((actualPrice - referencePrice) / referencePrice) * 100;
};

// Method to update trade status
tradeSchema.methods.updateStatus = function(newStatus, additionalData = {}) {
  this.status = newStatus;
  
  if (newStatus === 'filled') {
    this.executionTime = new Date();
    this.slippage.actual = this.calculateActualSlippage();
  }
  
  // Merge additional data
  Object.assign(this, additionalData);
  
  return this.save();
};

// Method to add partial fill
tradeSchema.methods.addPartialFill = function(fillData) {
  if (!this.execution.partialFills) {
    this.execution.partialFills = [];
  }
  
  this.execution.partialFills.push({
    ...fillData,
    timestamp: new Date()
  });
  
  // Update status if fully filled
  const totalFilled = this.execution.partialFills.reduce((sum, fill) => sum + fill.quantity, 0);
  if (totalFilled >= this.orderSize) {
    this.status = 'filled';
    this.executionTime = new Date();
  } else {
    this.status = 'partially_filled';
  }
  
  return this.save();
};

// Method to calculate performance metrics
tradeSchema.methods.calculatePerformance = function() {
  if (this.status !== 'filled') return;
  
  const totalFees = this.execution.partialFills?.reduce((sum, fill) => sum + (fill.fees || 0), 0) || 0;
  const actualSlippage = this.calculateActualSlippage();
  const expectedSlippage = this.slippage.expected || 0;
  const slippageSaved = Math.max(0, (expectedSlippage - actualSlippage) * this.totalValue / 100);
  
  this.performance = {
    slippageSaved,
    feesTotal: totalFees,
    executionQuality: Math.max(0, 100 - (actualSlippage * 10)), // Simple quality score
    benchmarkComparison: {
      improvement: ((expectedSlippage - actualSlippage) / expectedSlippage) * 100
    }
  };
  
  return this.save();
};

// Static method to get user's trading statistics
tradeSchema.statics.getUserStats = function(userId, timeframe = '30d') {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeframe));
  
  return this.aggregate([
    {
      $match: {
        userId,
        status: 'filled',
        executionTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalTrades: { $sum: 1 },
        totalVolume: { $sum: '$totalValue' },
        totalSlippageSaved: { $sum: '$performance.slippageSaved' },
        averageSlippage: { $avg: '$slippage.actual' },
        averageExecutionTime: { $avg: '$execution.executionTime' },
        successRate: {
          $avg: {
            $cond: [{ $eq: ['$status', 'filled'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Static method to get market insights
tradeSchema.statics.getMarketInsights = function(symbol, timeframe = '24h') {
  const startDate = new Date();
  const hours = timeframe === '24h' ? 24 : parseInt(timeframe);
  startDate.setHours(startDate.getHours() - hours);
  
  return this.aggregate([
    {
      $match: {
        symbol,
        status: 'filled',
        executionTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$exchangeUsed.exchangeId',
        tradeCount: { $sum: 1 },
        totalVolume: { $sum: '$totalValue' },
        averageSlippage: { $avg: '$slippage.actual' },
        averagePrice: { $avg: '$entryPrice' }
      }
    },
    { $sort: { totalVolume: -1 } }
  ]);
};

export default mongoose.model('Trade', tradeSchema);
