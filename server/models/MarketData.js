import mongoose from 'mongoose';

const marketDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true
  },
  exchangeId: {
    type: String,
    required: true,
    ref: 'Exchange',
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  bidPrice: {
    type: Number,
    required: true
  },
  askPrice: {
    type: Number,
    required: true
  },
  bidVolume: {
    type: Number,
    required: true
  },
  askVolume: {
    type: Number,
    required: true
  },
  lastPrice: {
    type: Number,
    required: true
  },
  volume24h: {
    type: Number,
    default: 0
  },
  high24h: {
    type: Number,
    default: 0
  },
  low24h: {
    type: Number,
    default: 0
  },
  change24h: {
    type: Number,
    default: 0
  },
  changePercent24h: {
    type: Number,
    default: 0
  },
  vwap24h: { // Volume Weighted Average Price
    type: Number,
    default: 0
  },
  openInterest: Number, // For futures
  fundingRate: Number, // For perpetual futures
  orderBook: {
    bids: [{
      price: Number,
      quantity: Number
    }],
    asks: [{
      price: Number,
      quantity: Number
    }],
    lastUpdate: Date
  },
  trades: [{
    id: String,
    price: Number,
    quantity: Number,
    side: {
      type: String,
      enum: ['buy', 'sell']
    },
    timestamp: Date
  }],
  liquidityMetrics: {
    spread: Number, // Ask - Bid
    spreadPercent: Number, // (Ask - Bid) / Mid * 100
    midPrice: Number, // (Ask + Bid) / 2
    depth: {
      bids: Number, // Total bid volume in top 10 levels
      asks: Number, // Total ask volume in top 10 levels
      total: Number
    },
    slippageEstimate: {
      buy: {
        '1000': Number,   // Slippage for $1K order
        '10000': Number,  // Slippage for $10K order
        '100000': Number  // Slippage for $100K order
      },
      sell: {
        '1000': Number,
        '10000': Number,
        '100000': Number
      }
    }
  },
  technicalIndicators: {
    rsi: Number,
    macd: {
      macd: Number,
      signal: Number,
      histogram: Number
    },
    bollinger: {
      upper: Number,
      middle: Number,
      lower: Number
    },
    ema: {
      ema12: Number,
      ema26: Number,
      ema50: Number,
      ema200: Number
    }
  },
  quality: {
    score: { type: Number, default: 100 }, // Data quality score 0-100
    latency: Number, // Milliseconds from exchange to our system
    staleness: Number, // Seconds since last update
    anomalies: [String] // List of detected anomalies
  }
}, {
  timestamps: true,
  // TTL index - automatically delete documents older than 30 days
  expireAfterSeconds: 30 * 24 * 60 * 60
});

// Compound indexes for efficient queries
marketDataSchema.index({ symbol: 1, exchangeId: 1, timestamp: -1 });
marketDataSchema.index({ exchangeId: 1, timestamp: -1 });
marketDataSchema.index({ timestamp: -1 });
marketDataSchema.index({ symbol: 1, timestamp: -1 });

// Virtual for spread calculation
marketDataSchema.virtual('spread').get(function() {
  return this.askPrice - this.bidPrice;
});

// Virtual for spread percentage
marketDataSchema.virtual('spreadPercent').get(function() {
  const midPrice = (this.askPrice + this.bidPrice) / 2;
  return ((this.askPrice - this.bidPrice) / midPrice) * 100;
});

// Virtual for mid price
marketDataSchema.virtual('midPrice').get(function() {
  return (this.askPrice + this.bidPrice) / 2;
});

// Method to calculate liquidity depth
marketDataSchema.methods.calculateLiquidityDepth = function(levels = 10) {
  const bidsDepth = this.orderBook.bids
    .slice(0, levels)
    .reduce((sum, level) => sum + (level.price * level.quantity), 0);
    
  const asksDepth = this.orderBook.asks
    .slice(0, levels)
    .reduce((sum, level) => sum + (level.price * level.quantity), 0);
    
  return {
    bids: bidsDepth,
    asks: asksDepth,
    total: bidsDepth + asksDepth
  };
};

// Method to estimate slippage for a given order size
marketDataSchema.methods.estimateSlippage = function(orderSize, side = 'buy') {
  const book = side === 'buy' ? this.orderBook.asks : this.orderBook.bids;
  let remainingSize = orderSize;
  let totalCost = 0;
  let weightedPrice = 0;
  
  for (const level of book) {
    if (remainingSize <= 0) break;
    
    const levelSize = Math.min(remainingSize, level.quantity);
    const levelCost = levelSize * level.price;
    
    totalCost += levelCost;
    weightedPrice += levelCost;
    remainingSize -= levelSize;
  }
  
  if (remainingSize > 0) {
    // Not enough liquidity
    return null;
  }
  
  const avgPrice = weightedPrice / orderSize;
  const referencePrice = side === 'buy' ? this.askPrice : this.bidPrice;
  const slippage = Math.abs((avgPrice - referencePrice) / referencePrice) * 100;
  
  return {
    avgPrice,
    slippage,
    totalCost
  };
};

// Method to check data freshness
marketDataSchema.methods.isFresh = function(maxAgeSeconds = 60) {
  const ageSeconds = (Date.now() - this.timestamp.getTime()) / 1000;
  return ageSeconds <= maxAgeSeconds;
};

// Method to detect anomalies
marketDataSchema.methods.detectAnomalies = function(previousData) {
  const anomalies = [];
  
  if (!previousData) return anomalies;
  
  // Check for extreme price movements (>10% in 1 minute)
  const priceChange = Math.abs((this.lastPrice - previousData.lastPrice) / previousData.lastPrice);
  if (priceChange > 0.1) {
    anomalies.push('extreme_price_movement');
  }
  
  // Check for abnormal spreads (>5%)
  if (this.spreadPercent > 5) {
    anomalies.push('wide_spread');
  }
  
  // Check for zero volume
  if (this.volume24h === 0) {
    anomalies.push('zero_volume');
  }
  
  return anomalies;
};

// Static method to get latest data for symbol
marketDataSchema.statics.getLatestForSymbol = function(symbol, exchangeId = null) {
  const query = { symbol };
  if (exchangeId) query.exchangeId = exchangeId;
  
  return this.findOne(query).sort({ timestamp: -1 });
};

// Static method to get aggregated market data across exchanges
marketDataSchema.statics.getAggregatedData = function(symbol, timeframe = '1h') {
  const pipeline = [
    { $match: { symbol } },
    {
      $group: {
        _id: {
          symbol: '$symbol',
          period: {
            $dateTrunc: {
              date: '$timestamp',
              unit: timeframe === '1h' ? 'hour' : 'minute'
            }
          }
        },
        avgPrice: { $avg: '$lastPrice' },
        maxPrice: { $max: '$lastPrice' },
        minPrice: { $min: '$lastPrice' },
        totalVolume: { $sum: '$volume24h' },
        avgSpread: { $avg: { $subtract: ['$askPrice', '$bidPrice'] } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.period': -1 } },
    { $limit: 100 }
  ];
  
  return this.aggregate(pipeline);
};

export default mongoose.model('MarketData', marketDataSchema);
