import mongoose from 'mongoose';

const exchangeSchema = new mongoose.Schema({
  exchangeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['cex', 'dex'], // Centralized or Decentralized Exchange
    required: true
  },
  baseUrl: {
    type: String,
    required: true
  },
  websocketUrl: String,
  apiVersion: String,
  supportedFeatures: {
    spot: { type: Boolean, default: true },
    futures: { type: Boolean, default: false },
    options: { type: Boolean, default: false },
    margin: { type: Boolean, default: false },
    websocket: { type: Boolean, default: true },
    orderBook: { type: Boolean, default: true },
    trades: { type: Boolean, default: true }
  },
  rateLimits: {
    requests: {
      perSecond: { type: Number, default: 10 },
      perMinute: { type: Number, default: 1200 },
      perHour: { type: Number, default: 72000 }
    },
    websocket: {
      connectionsPerIP: { type: Number, default: 5 },
      subscriptionsPerConnection: { type: Number, default: 1024 }
    }
  },
  fees: {
    maker: { type: Number, default: 0.001 }, // 0.1%
    taker: { type: Number, default: 0.001 }, // 0.1%
    withdrawal: { type: Map, of: Number } // Symbol -> fee mapping
  },
  supportedSymbols: [{
    symbol: String,
    baseAsset: String,
    quoteAsset: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'delisted'],
      default: 'active'
    },
    minOrderSize: Number,
    maxOrderSize: Number,
    tickSize: Number,
    stepSize: Number
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastHealthCheck: Date,
  healthStatus: {
    api: { type: Boolean, default: true },
    websocket: { type: Boolean, default: true },
    latency: { type: Number, default: 0 }, // in milliseconds
    uptime: { type: Number, default: 100 } // percentage
  },
  configuration: {
    timeout: { type: Number, default: 30000 }, // 30 seconds
    retryAttempts: { type: Number, default: 3 },
    retryDelay: { type: Number, default: 1000 }, // 1 second
    enableSandbox: { type: Boolean, default: false }
  },
  metadata: {
    country: String,
    founded: Date,
    volume24h: Number,
    rank: Number,
    description: String,
    website: String,
    logo: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
exchangeSchema.index({ exchangeId: 1 });
exchangeSchema.index({ name: 1 });
exchangeSchema.index({ status: 1 });
exchangeSchema.index({ isActive: 1 });
exchangeSchema.index({ 'supportedSymbols.symbol': 1 });

// Virtual for active symbols count
exchangeSchema.virtual('activeSymbolsCount').get(function() {
  return this.supportedSymbols.filter(s => s.status === 'active').length;
});

// Method to check if symbol is supported
exchangeSchema.methods.supportsSymbol = function(symbol) {
  return this.supportedSymbols.some(s => 
    s.symbol === symbol && s.status === 'active'
  );
};

// Method to get symbol configuration
exchangeSchema.methods.getSymbolConfig = function(symbol) {
  return this.supportedSymbols.find(s => 
    s.symbol === symbol && s.status === 'active'
  );
};

// Method to check if exchange is healthy
exchangeSchema.methods.isHealthy = function() {
  return this.status === 'active' && 
         this.isActive && 
         this.healthStatus.api && 
         this.healthStatus.websocket &&
         this.healthStatus.uptime > 95;
};

// Method to update health status
exchangeSchema.methods.updateHealthStatus = function(status) {
  this.healthStatus = { ...this.healthStatus, ...status };
  this.lastHealthCheck = new Date();
  return this.save();
};

// Static method to get active exchanges
exchangeSchema.statics.getActiveExchanges = function() {
  return this.find({ 
    status: 'active', 
    isActive: true 
  }).sort({ 'metadata.rank': 1 });
};

// Static method to get exchanges supporting a symbol
exchangeSchema.statics.getExchangesForSymbol = function(symbol) {
  return this.find({
    status: 'active',
    isActive: true,
    'supportedSymbols': {
      $elemMatch: {
        symbol: symbol,
        status: 'active'
      }
    }
  });
};

export default mongoose.model('Exchange', exchangeSchema);
