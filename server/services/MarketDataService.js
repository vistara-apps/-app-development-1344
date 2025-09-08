import axios from 'axios';
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import cron from 'node-cron';

import MarketData from '../models/MarketData.js';
import Exchange from '../models/Exchange.js';
import { logger } from '../utils/logger.js';

export class MarketDataService extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map(); // exchangeId -> WebSocket connection
    this.subscriptions = new Map(); // exchangeId -> Set of symbols
    this.dataCache = new Map(); // symbol -> latest data
    this.isRunning = false;
    this.retryAttempts = new Map(); // exchangeId -> retry count
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  async startDataCollection() {
    if (this.isRunning) {
      logger.warn('Market data collection is already running');
      return;
    }

    logger.info('Starting market data collection service');
    this.isRunning = true;

    try {
      // Initialize exchanges
      await this.initializeExchanges();
      
      // Start WebSocket connections
      await this.startWebSocketConnections();
      
      // Schedule periodic data fetching as backup
      this.schedulePeriodicFetching();
      
      // Schedule health checks
      this.scheduleHealthChecks();
      
      logger.info('Market data collection service started successfully');
    } catch (error) {
      logger.error('Failed to start market data collection:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stopDataCollection() {
    logger.info('Stopping market data collection service');
    this.isRunning = false;

    // Close all WebSocket connections
    for (const [exchangeId, ws] of this.connections) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }

    this.connections.clear();
    this.subscriptions.clear();
    
    logger.info('Market data collection service stopped');
  }

  async initializeExchanges() {
    // Initialize default exchanges if they don't exist
    const defaultExchanges = [
      {
        exchangeId: 'binance',
        name: 'binance',
        displayName: 'Binance',
        type: 'cex',
        baseUrl: 'https://api.binance.com',
        websocketUrl: 'wss://stream.binance.com:9443/ws',
        supportedSymbols: [
          { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', status: 'active' },
          { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', status: 'active' },
          { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', status: 'active' }
        ]
      },
      {
        exchangeId: 'coinbase',
        name: 'coinbase',
        displayName: 'Coinbase Pro',
        type: 'cex',
        baseUrl: 'https://api.exchange.coinbase.com',
        websocketUrl: 'wss://ws-feed.exchange.coinbase.com',
        supportedSymbols: [
          { symbol: 'BTC-USD', baseAsset: 'BTC', quoteAsset: 'USD', status: 'active' },
          { symbol: 'ETH-USD', baseAsset: 'ETH', quoteAsset: 'USD', status: 'active' },
          { symbol: 'SOL-USD', baseAsset: 'SOL', quoteAsset: 'USD', status: 'active' }
        ]
      }
    ];

    for (const exchangeData of defaultExchanges) {
      try {
        await Exchange.findOneAndUpdate(
          { exchangeId: exchangeData.exchangeId },
          exchangeData,
          { upsert: true, new: true }
        );
        logger.info(`Initialized exchange: ${exchangeData.displayName}`);
      } catch (error) {
        logger.error(`Failed to initialize exchange ${exchangeData.displayName}:`, error);
      }
    }
  }

  async startWebSocketConnections() {
    const activeExchanges = await Exchange.getActiveExchanges();
    
    for (const exchange of activeExchanges) {
      try {
        await this.connectToExchange(exchange);
      } catch (error) {
        logger.error(`Failed to connect to ${exchange.displayName}:`, error);
      }
    }
  }

  async connectToExchange(exchange) {
    if (this.connections.has(exchange.exchangeId)) {
      logger.warn(`Already connected to ${exchange.displayName}`);
      return;
    }

    logger.info(`Connecting to ${exchange.displayName} WebSocket`);

    try {
      const ws = new WebSocket(exchange.websocketUrl);
      
      ws.on('open', () => {
        logger.info(`Connected to ${exchange.displayName} WebSocket`);
        this.connections.set(exchange.exchangeId, ws);
        this.retryAttempts.delete(exchange.exchangeId);
        
        // Subscribe to market data
        this.subscribeToMarketData(exchange, ws);
      });

      ws.on('message', (data) => {
        this.handleWebSocketMessage(exchange, data);
      });

      ws.on('error', (error) => {
        logger.error(`WebSocket error for ${exchange.displayName}:`, error);
        this.handleConnectionError(exchange);
      });

      ws.on('close', () => {
        logger.warn(`WebSocket connection closed for ${exchange.displayName}`);
        this.connections.delete(exchange.exchangeId);
        this.handleConnectionError(exchange);
      });

    } catch (error) {
      logger.error(`Failed to create WebSocket connection for ${exchange.displayName}:`, error);
      this.handleConnectionError(exchange);
    }
  }

  subscribeToMarketData(exchange, ws) {
    const symbols = exchange.supportedSymbols
      .filter(s => s.status === 'active')
      .map(s => s.symbol);

    if (exchange.exchangeId === 'binance') {
      // Binance WebSocket subscription format
      const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`);
      const subscribeMessage = {
        method: 'SUBSCRIBE',
        params: streams,
        id: Date.now()
      };
      
      ws.send(JSON.stringify(subscribeMessage));
      logger.info(`Subscribed to ${symbols.length} symbols on Binance`);
      
    } else if (exchange.exchangeId === 'coinbase') {
      // Coinbase WebSocket subscription format
      const subscribeMessage = {
        type: 'subscribe',
        product_ids: symbols,
        channels: ['ticker']
      };
      
      ws.send(JSON.stringify(subscribeMessage));
      logger.info(`Subscribed to ${symbols.length} symbols on Coinbase`);
    }

    this.subscriptions.set(exchange.exchangeId, new Set(symbols));
  }

  handleWebSocketMessage(exchange, data) {
    try {
      const message = JSON.parse(data.toString());
      
      if (exchange.exchangeId === 'binance') {
        this.processBinanceMessage(exchange, message);
      } else if (exchange.exchangeId === 'coinbase') {
        this.processCoinbaseMessage(exchange, message);
      }
      
    } catch (error) {
      logger.error(`Failed to process WebSocket message from ${exchange.displayName}:`, error);
    }
  }

  processBinanceMessage(exchange, message) {
    if (message.stream && message.data) {
      const data = message.data;
      const symbol = data.s; // Symbol
      
      const marketData = {
        symbol,
        exchangeId: exchange.exchangeId,
        timestamp: new Date(data.E), // Event time
        bidPrice: parseFloat(data.b),
        askPrice: parseFloat(data.a),
        bidVolume: parseFloat(data.B),
        askVolume: parseFloat(data.A),
        lastPrice: parseFloat(data.c),
        volume24h: parseFloat(data.v),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l),
        change24h: parseFloat(data.P),
        changePercent24h: parseFloat(data.P)
      };

      this.processMarketData(marketData);
    }
  }

  processCoinbaseMessage(exchange, message) {
    if (message.type === 'ticker') {
      const marketData = {
        symbol: message.product_id,
        exchangeId: exchange.exchangeId,
        timestamp: new Date(message.time),
        bidPrice: parseFloat(message.best_bid),
        askPrice: parseFloat(message.best_ask),
        bidVolume: parseFloat(message.best_bid_size),
        askVolume: parseFloat(message.best_ask_size),
        lastPrice: parseFloat(message.price),
        volume24h: parseFloat(message.volume_24h),
        high24h: parseFloat(message.high_24h),
        low24h: parseFloat(message.low_24h),
        change24h: parseFloat(message.price) - parseFloat(message.open_24h),
        changePercent24h: ((parseFloat(message.price) - parseFloat(message.open_24h)) / parseFloat(message.open_24h)) * 100
      };

      this.processMarketData(marketData);
    }
  }

  async processMarketData(data) {
    try {
      // Calculate additional metrics
      data.liquidityMetrics = {
        spread: data.askPrice - data.bidPrice,
        spreadPercent: ((data.askPrice - data.bidPrice) / ((data.askPrice + data.bidPrice) / 2)) * 100,
        midPrice: (data.askPrice + data.bidPrice) / 2
      };

      // Cache the data
      const cacheKey = `${data.symbol}_${data.exchangeId}`;
      this.dataCache.set(cacheKey, data);

      // Save to database (with rate limiting)
      if (this.shouldSaveToDatabase(data)) {
        const marketData = new MarketData(data);
        await marketData.save();
      }

      // Emit event for real-time updates
      this.emit('marketData', data);
      
    } catch (error) {
      logger.error('Failed to process market data:', error);
    }
  }

  shouldSaveToDatabase(data) {
    // Only save every 10 seconds to avoid database overload
    const cacheKey = `${data.symbol}_${data.exchangeId}_lastSave`;
    const lastSave = this.dataCache.get(cacheKey) || 0;
    const now = Date.now();
    
    if (now - lastSave > 10000) { // 10 seconds
      this.dataCache.set(cacheKey, now);
      return true;
    }
    
    return false;
  }

  handleConnectionError(exchange) {
    const retryCount = this.retryAttempts.get(exchange.exchangeId) || 0;
    
    if (retryCount < this.maxRetries) {
      this.retryAttempts.set(exchange.exchangeId, retryCount + 1);
      
      logger.info(`Retrying connection to ${exchange.displayName} in ${this.retryDelay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
      
      setTimeout(() => {
        if (this.isRunning) {
          this.connectToExchange(exchange);
        }
      }, this.retryDelay);
      
    } else {
      logger.error(`Max retry attempts reached for ${exchange.displayName}`);
      // Update exchange health status
      exchange.updateHealthStatus({
        api: false,
        websocket: false,
        uptime: 0
      });
    }
  }

  schedulePeriodicFetching() {
    // Fetch market data every minute as backup
    cron.schedule('* * * * *', async () => {
      if (!this.isRunning) return;
      
      try {
        await this.fetchRestApiData();
      } catch (error) {
        logger.error('Periodic data fetching failed:', error);
      }
    });
  }

  async fetchRestApiData() {
    const activeExchanges = await Exchange.getActiveExchanges();
    
    for (const exchange of activeExchanges) {
      // Only fetch if WebSocket is not connected
      if (!this.connections.has(exchange.exchangeId)) {
        try {
          await this.fetchExchangeData(exchange);
        } catch (error) {
          logger.error(`Failed to fetch data from ${exchange.displayName}:`, error);
        }
      }
    }
  }

  async fetchExchangeData(exchange) {
    // Implementation would depend on each exchange's REST API
    // This is a simplified version
    logger.info(`Fetching REST API data from ${exchange.displayName}`);
  }

  scheduleHealthChecks() {
    // Check exchange health every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      if (!this.isRunning) return;
      
      try {
        await this.performHealthChecks();
      } catch (error) {
        logger.error('Health check failed:', error);
      }
    });
  }

  async performHealthChecks() {
    const activeExchanges = await Exchange.getActiveExchanges();
    
    for (const exchange of activeExchanges) {
      const isConnected = this.connections.has(exchange.exchangeId);
      const ws = this.connections.get(exchange.exchangeId);
      const isWebSocketHealthy = ws && ws.readyState === WebSocket.OPEN;
      
      await exchange.updateHealthStatus({
        websocket: isWebSocketHealthy,
        uptime: isWebSocketHealthy ? 100 : 0,
        lastHealthCheck: new Date()
      });
    }
  }

  // Public methods for getting market data
  getLatestData(symbol, exchangeId = null) {
    if (exchangeId) {
      return this.dataCache.get(`${symbol}_${exchangeId}`);
    }
    
    // Return data from all exchanges for the symbol
    const results = [];
    for (const [key, data] of this.dataCache) {
      if (key.startsWith(`${symbol}_`)) {
        results.push(data);
      }
    }
    
    return results;
  }

  async getAggregatedData(symbol) {
    const exchangeData = this.getLatestData(symbol);
    
    if (!exchangeData || exchangeData.length === 0) {
      return null;
    }
    
    // Calculate volume-weighted average price
    let totalVolume = 0;
    let weightedPrice = 0;
    let bestBid = 0;
    let bestAsk = Infinity;
    
    for (const data of exchangeData) {
      totalVolume += data.volume24h;
      weightedPrice += data.lastPrice * data.volume24h;
      bestBid = Math.max(bestBid, data.bidPrice);
      bestAsk = Math.min(bestAsk, data.askPrice);
    }
    
    return {
      symbol,
      vwap: weightedPrice / totalVolume,
      bestBid,
      bestAsk,
      spread: bestAsk - bestBid,
      totalVolume,
      exchangeCount: exchangeData.length,
      timestamp: new Date()
    };
  }
}
