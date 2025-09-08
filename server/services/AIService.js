import { EventEmitter } from 'events';
import MarketData from '../models/MarketData.js';
import Trade from '../models/Trade.js';
import Exchange from '../models/Exchange.js';
import { logger } from '../utils/logger.js';

export class AIService extends EventEmitter {
  constructor() {
    super();
    this.models = {
      slippagePrediction: new SlippagePredictionModel(),
      liquidityRouting: new LiquidityRoutingModel(),
      orderSizing: new OrderSizingModel(),
      marketCondition: new MarketConditionModel()
    };
    this.cache = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    logger.info('Initializing AI Service');
    
    try {
      // Initialize all models
      await Promise.all([
        this.models.slippagePrediction.initialize(),
        this.models.liquidityRouting.initialize(),
        this.models.orderSizing.initialize(),
        this.models.marketCondition.initialize()
      ]);

      this.isInitialized = true;
      logger.info('AI Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Service:', error);
      throw error;
    }
  }

  async analyzeTradeOpportunity(params) {
    const { symbol, side, orderSize, userId, userPreferences = {} } = params;

    try {
      // Get current market data
      const marketData = await this.getMarketData(symbol);
      if (!marketData || marketData.length === 0) {
        throw new Error(`No market data available for ${symbol}`);
      }

      // Analyze market conditions
      const marketCondition = await this.models.marketCondition.analyze(marketData);
      
      // Predict slippage for different scenarios
      const slippagePredictions = await this.predictSlippage(symbol, side, orderSize, marketData);
      
      // Find optimal routing strategy
      const routingStrategy = await this.findOptimalRouting(symbol, side, orderSize, marketData, userPreferences);
      
      // Calculate optimal order sizing
      const orderSizingRecommendation = await this.optimizeOrderSize(symbol, side, orderSize, marketData, userPreferences);
      
      // Generate comprehensive recommendation
      const recommendation = this.generateRecommendation({
        symbol,
        side,
        orderSize,
        marketData,
        marketCondition,
        slippagePredictions,
        routingStrategy,
        orderSizingRecommendation,
        userPreferences
      });

      // Cache the analysis
      const cacheKey = `${symbol}_${side}_${orderSize}_${Date.now()}`;
      this.cache.set(cacheKey, recommendation);

      return recommendation;

    } catch (error) {
      logger.error('Failed to analyze trade opportunity:', error);
      throw error;
    }
  }

  async predictSlippage(symbol, side, orderSize, marketData) {
    const predictions = [];

    for (const data of marketData) {
      try {
        const prediction = await this.models.slippagePrediction.predict({
          symbol,
          side,
          orderSize,
          marketData: data,
          historicalData: await this.getHistoricalData(symbol, data.exchangeId)
        });

        predictions.push({
          exchangeId: data.exchangeId,
          ...prediction
        });
      } catch (error) {
        logger.error(`Failed to predict slippage for ${data.exchangeId}:`, error);
      }
    }

    return predictions;
  }

  async findOptimalRouting(symbol, side, orderSize, marketData, userPreferences) {
    try {
      const routing = await this.models.liquidityRouting.optimize({
        symbol,
        side,
        orderSize,
        marketData,
        userPreferences,
        constraints: {
          maxExchanges: userPreferences.maxExchanges || 3,
          minAllocation: userPreferences.minAllocation || 0.1,
          maxSlippage: userPreferences.maxSlippage || 0.5
        }
      });

      return routing;
    } catch (error) {
      logger.error('Failed to find optimal routing:', error);
      throw error;
    }
  }

  async optimizeOrderSize(symbol, side, orderSize, marketData, userPreferences) {
    try {
      const optimization = await this.models.orderSizing.optimize({
        symbol,
        side,
        requestedSize: orderSize,
        marketData,
        userPreferences,
        riskParameters: {
          maxRisk: userPreferences.maxRisk || 0.02,
          timeHorizon: userPreferences.timeHorizon || 300 // 5 minutes
        }
      });

      return optimization;
    } catch (error) {
      logger.error('Failed to optimize order size:', error);
      throw error;
    }
  }

  generateRecommendation(analysisData) {
    const {
      symbol,
      side,
      orderSize,
      marketData,
      marketCondition,
      slippagePredictions,
      routingStrategy,
      orderSizingRecommendation
    } = analysisData;

    // Calculate confidence score
    const confidence = this.calculateConfidence(analysisData);
    
    // Determine best strategy
    const strategy = this.selectBestStrategy(routingStrategy, slippagePredictions);
    
    // Calculate estimated savings
    const estimatedSavings = this.calculateEstimatedSavings(slippagePredictions, strategy);
    
    // Generate timing recommendation
    const timing = this.generateTimingRecommendation(marketCondition, slippagePredictions);

    return {
      symbol,
      side,
      orderSize,
      confidence,
      strategy: strategy.name,
      reasoning: strategy.reasoning,
      estimatedSavings,
      timing,
      optimalExchanges: strategy.exchanges,
      slippagePrediction: {
        expected: strategy.expectedSlippage,
        range: {
          min: Math.min(...slippagePredictions.map(p => p.slippage)),
          max: Math.max(...slippagePredictions.map(p => p.slippage))
        }
      },
      riskAssessment: {
        level: marketCondition.riskLevel,
        factors: marketCondition.riskFactors,
        mitigation: strategy.riskMitigation
      },
      executionPlan: {
        immediate: timing.immediate,
        delayRecommended: timing.delaySeconds,
        totalEstimatedTime: strategy.estimatedExecutionTime,
        steps: strategy.executionSteps
      },
      alternatives: this.generateAlternatives(analysisData),
      metadata: {
        analysisTime: new Date(),
        modelVersions: this.getModelVersions(),
        dataQuality: this.assessDataQuality(marketData)
      }
    };
  }

  selectBestStrategy(routingStrategy, slippagePredictions) {
    // Sort strategies by expected performance
    const strategies = routingStrategy.strategies.sort((a, b) => 
      (b.expectedSavings - b.estimatedRisk) - (a.expectedSavings - a.estimatedRisk)
    );

    const bestStrategy = strategies[0];
    
    return {
      name: bestStrategy.type,
      reasoning: bestStrategy.reasoning,
      exchanges: bestStrategy.allocation,
      expectedSlippage: bestStrategy.expectedSlippage,
      estimatedExecutionTime: bestStrategy.estimatedTime,
      riskMitigation: bestStrategy.riskMitigation,
      executionSteps: bestStrategy.steps
    };
  }

  calculateConfidence(analysisData) {
    const { marketData, slippagePredictions } = analysisData;
    
    let confidence = 100;
    
    // Reduce confidence based on data quality
    const dataQuality = this.assessDataQuality(marketData);
    confidence *= (dataQuality / 100);
    
    // Reduce confidence based on prediction variance
    const slippageVariance = this.calculateVariance(slippagePredictions.map(p => p.slippage));
    confidence *= Math.max(0.5, 1 - (slippageVariance / 10));
    
    // Reduce confidence based on market volatility
    const volatility = this.calculateVolatility(marketData);
    confidence *= Math.max(0.6, 1 - (volatility / 20));
    
    return Math.max(50, Math.min(100, Math.round(confidence)));
  }

  calculateEstimatedSavings(slippagePredictions, strategy) {
    // Calculate baseline slippage (worst single exchange)
    const worstSlippage = Math.max(...slippagePredictions.map(p => p.slippage));
    
    // Calculate optimized slippage
    const optimizedSlippage = strategy.expectedSlippage;
    
    // Calculate savings
    const slippageSavings = worstSlippage - optimizedSlippage;
    
    return {
      slippageReduction: slippageSavings,
      dollarAmount: slippageSavings * strategy.exchanges.reduce((sum, e) => sum + e.allocation, 0) * 100, // Simplified calculation
      percentage: (slippageSavings / worstSlippage) * 100
    };
  }

  generateTimingRecommendation(marketCondition, slippagePredictions) {
    const { volatility, trend, liquidity } = marketCondition;
    
    // Immediate execution conditions
    if (volatility < 0.02 && liquidity > 0.8) {
      return {
        immediate: true,
        delaySeconds: 0,
        reason: 'Optimal market conditions detected'
      };
    }
    
    // High volatility - recommend waiting
    if (volatility > 0.05) {
      return {
        immediate: false,
        delaySeconds: 300, // 5 minutes
        reason: 'High volatility detected, waiting for stabilization'
      };
    }
    
    // Low liquidity - recommend splitting over time
    if (liquidity < 0.3) {
      return {
        immediate: false,
        delaySeconds: 180, // 3 minutes
        reason: 'Low liquidity, recommend time-weighted execution'
      };
    }
    
    return {
      immediate: true,
      delaySeconds: 0,
      reason: 'Normal market conditions'
    };
  }

  generateAlternatives(analysisData) {
    // Generate 2-3 alternative strategies
    return [
      {
        name: 'Conservative Single Exchange',
        description: 'Execute on the most liquid exchange',
        tradeoffs: 'Lower complexity, potentially higher slippage'
      },
      {
        name: 'Time-Weighted Average',
        description: 'Split order over 15-minute window',
        tradeoffs: 'Reduced market impact, longer execution time'
      },
      {
        name: 'Aggressive Multi-Exchange',
        description: 'Split across all available exchanges',
        tradeoffs: 'Maximum slippage reduction, higher complexity'
      }
    ];
  }

  async getMarketData(symbol) {
    // Get latest market data for all exchanges
    return await MarketData.find({
      symbol,
      timestamp: { $gte: new Date(Date.now() - 60000) } // Last minute
    }).sort({ timestamp: -1 }).limit(10);
  }

  async getHistoricalData(symbol, exchangeId, hours = 24) {
    const startTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    return await MarketData.find({
      symbol,
      exchangeId,
      timestamp: { $gte: startTime }
    }).sort({ timestamp: -1 }).limit(1000);
  }

  assessDataQuality(marketData) {
    if (!marketData || marketData.length === 0) return 0;
    
    let qualityScore = 100;
    
    // Check data freshness
    const latestTimestamp = Math.max(...marketData.map(d => d.timestamp.getTime()));
    const ageMinutes = (Date.now() - latestTimestamp) / (1000 * 60);
    if (ageMinutes > 5) qualityScore -= 20;
    
    // Check spread reasonableness
    const avgSpread = marketData.reduce((sum, d) => sum + d.spreadPercent, 0) / marketData.length;
    if (avgSpread > 1) qualityScore -= 15; // Spread > 1%
    
    // Check for anomalies
    const anomalyCount = marketData.reduce((sum, d) => sum + (d.quality?.anomalies?.length || 0), 0);
    qualityScore -= Math.min(30, anomalyCount * 5);
    
    return Math.max(0, qualityScore);
  }

  calculateVariance(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  calculateVolatility(marketData) {
    if (marketData.length < 2) return 0;
    
    const priceChanges = [];
    for (let i = 1; i < marketData.length; i++) {
      const change = Math.abs((marketData[i].lastPrice - marketData[i-1].lastPrice) / marketData[i-1].lastPrice);
      priceChanges.push(change);
    }
    
    return priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
  }

  getModelVersions() {
    return {
      slippagePrediction: this.models.slippagePrediction.version,
      liquidityRouting: this.models.liquidityRouting.version,
      orderSizing: this.models.orderSizing.version,
      marketCondition: this.models.marketCondition.version
    };
  }
}

// Simplified AI Models (in production, these would be more sophisticated)
class SlippagePredictionModel {
  constructor() {
    this.version = '1.0.0';
  }

  async initialize() {
    // Initialize model parameters
    logger.info('Slippage Prediction Model initialized');
  }

  async predict({ symbol, side, orderSize, marketData, historicalData }) {
    // Simplified slippage prediction based on order book depth
    const { bidVolume, askVolume, spreadPercent } = marketData;
    const relevantVolume = side === 'buy' ? askVolume : bidVolume;
    
    // Basic slippage calculation
    const liquidityRatio = orderSize / (relevantVolume * marketData.lastPrice);
    const baseSlippage = spreadPercent / 2; // Half spread as base
    const impactSlippage = liquidityRatio * 0.1; // 10% impact per liquidity ratio
    
    const totalSlippage = baseSlippage + impactSlippage;
    
    return {
      slippage: Math.max(0.01, totalSlippage), // Minimum 0.01%
      confidence: Math.max(60, 100 - (liquidityRatio * 50)),
      factors: {
        spread: baseSlippage,
        impact: impactSlippage,
        liquidity: liquidityRatio
      }
    };
  }
}

class LiquidityRoutingModel {
  constructor() {
    this.version = '1.0.0';
  }

  async initialize() {
    logger.info('Liquidity Routing Model initialized');
  }

  async optimize({ symbol, side, orderSize, marketData, userPreferences, constraints }) {
    const strategies = [];
    
    // Strategy 1: Single best exchange
    const bestExchange = marketData.reduce((best, current) => 
      current.spreadPercent < best.spreadPercent ? current : best
    );
    
    strategies.push({
      type: 'single_exchange',
      reasoning: `Best spread on ${bestExchange.exchangeId}`,
      allocation: [{ exchangeId: bestExchange.exchangeId, allocation: 1.0 }],
      expectedSlippage: bestExchange.spreadPercent / 2,
      expectedSavings: 0,
      estimatedRisk: 0.1,
      estimatedTime: 2000,
      steps: ['Execute full order on single exchange'],
      riskMitigation: ['Monitor execution closely']
    });
    
    // Strategy 2: Split across top exchanges
    if (marketData.length > 1) {
      const topExchanges = marketData
        .sort((a, b) => a.spreadPercent - b.spreadPercent)
        .slice(0, Math.min(3, marketData.length));
      
      const allocation = topExchanges.map((exchange, index) => ({
        exchangeId: exchange.exchangeId,
        allocation: index === 0 ? 0.6 : 0.4 / (topExchanges.length - 1)
      }));
      
      const weightedSlippage = allocation.reduce((sum, alloc) => {
        const exchange = topExchanges.find(e => e.exchangeId === alloc.exchangeId);
        return sum + (alloc.allocation * exchange.spreadPercent / 2);
      }, 0);
      
      strategies.push({
        type: 'multi_exchange',
        reasoning: 'Split order to minimize slippage',
        allocation,
        expectedSlippage: weightedSlippage,
        expectedSavings: (bestExchange.spreadPercent / 2) - weightedSlippage,
        estimatedRisk: 0.05,
        estimatedTime: 5000,
        steps: ['Split order across exchanges', 'Execute simultaneously'],
        riskMitigation: ['Diversify execution risk', 'Monitor all exchanges']
      });
    }
    
    return { strategies };
  }
}

class OrderSizingModel {
  constructor() {
    this.version = '1.0.0';
  }

  async initialize() {
    logger.info('Order Sizing Model initialized');
  }

  async optimize({ symbol, side, requestedSize, marketData, userPreferences, riskParameters }) {
    // Simplified order sizing based on available liquidity
    const totalLiquidity = marketData.reduce((sum, data) => {
      const relevantVolume = side === 'buy' ? data.askVolume : data.bidVolume;
      return sum + (relevantVolume * data.lastPrice);
    }, 0);
    
    const requestedValue = requestedSize * marketData[0].lastPrice;
    const liquidityUtilization = requestedValue / totalLiquidity;
    
    let recommendedSize = requestedSize;
    let reasoning = 'Order size is optimal';
    
    if (liquidityUtilization > 0.1) { // Using more than 10% of liquidity
      recommendedSize = requestedSize * 0.8; // Reduce by 20%
      reasoning = 'Reduced size to minimize market impact';
    }
    
    return {
      recommendedSize,
      originalSize: requestedSize,
      reasoning,
      liquidityUtilization,
      riskAssessment: liquidityUtilization > 0.1 ? 'high' : 'normal'
    };
  }
}

class MarketConditionModel {
  constructor() {
    this.version = '1.0.0';
  }

  async initialize() {
    logger.info('Market Condition Model initialized');
  }

  async analyze(marketData) {
    // Calculate market condition metrics
    const spreads = marketData.map(d => d.spreadPercent);
    const avgSpread = spreads.reduce((sum, s) => sum + s, 0) / spreads.length;
    
    const volumes = marketData.map(d => d.volume24h);
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    
    // Determine market condition
    let condition = 'normal';
    let riskLevel = 'medium';
    const riskFactors = [];
    
    if (avgSpread > 0.5) {
      condition = 'illiquid';
      riskLevel = 'high';
      riskFactors.push('Wide spreads detected');
    }
    
    if (avgVolume < 1000000) { // Less than $1M volume
      condition = 'low_volume';
      riskLevel = 'high';
      riskFactors.push('Low trading volume');
    }
    
    return {
      condition,
      riskLevel,
      riskFactors,
      volatility: avgSpread / 100, // Simplified volatility measure
      trend: 'neutral', // Would need more data for trend analysis
      liquidity: Math.min(1, avgVolume / 10000000) // Normalized liquidity score
    };
  }
}
