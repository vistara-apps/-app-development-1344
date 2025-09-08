import { EventEmitter } from 'events';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export class WebSocketService extends EventEmitter {
  constructor(wss) {
    super();
    this.wss = wss;
    this.clients = new Map(); // userId -> Set of WebSocket connections
    this.subscriptions = new Map(); // connectionId -> Set of subscriptions
    this.connectionCount = 0;
  }

  handleConnection(ws, req) {
    const connectionId = ++this.connectionCount;
    logger.info(`WebSocket connection ${connectionId} established`);

    // Initialize connection data
    ws.connectionId = connectionId;
    ws.isAlive = true;
    ws.subscriptions = new Set();

    // Set up ping/pong for connection health
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle incoming messages
    ws.on('message', (data) => {
      this.handleMessage(ws, data);
    });

    // Handle connection close
    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error(`WebSocket error for connection ${connectionId}:`, error);
    });

    // Send welcome message
    this.sendMessage(ws, {
      type: 'welcome',
      connectionId,
      timestamp: new Date().toISOString()
    });

    // Start heartbeat
    this.startHeartbeat();
  }

  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data.toString());
      const { type, payload } = message;

      logger.debug(`Received message type: ${type} from connection ${ws.connectionId}`);

      switch (type) {
        case 'authenticate':
          this.handleAuthentication(ws, payload);
          break;
        
        case 'subscribe':
          this.handleSubscription(ws, payload);
          break;
        
        case 'unsubscribe':
          this.handleUnsubscription(ws, payload);
          break;
        
        case 'ping':
          this.sendMessage(ws, { type: 'pong', timestamp: new Date().toISOString() });
          break;
        
        default:
          logger.warn(`Unknown message type: ${type} from connection ${ws.connectionId}`);
          this.sendError(ws, 'Unknown message type', type);
      }
    } catch (error) {
      logger.error(`Failed to parse WebSocket message from connection ${ws.connectionId}:`, error);
      this.sendError(ws, 'Invalid message format');
    }
  }

  handleAuthentication(ws, payload) {
    try {
      const { token } = payload;
      
      if (!token) {
        this.sendError(ws, 'Authentication token required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const { userId, username } = decoded;

      // Store user information
      ws.userId = userId;
      ws.username = username;
      ws.isAuthenticated = true;

      // Add to clients map
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId).add(ws);

      logger.info(`User ${username} authenticated on connection ${ws.connectionId}`);

      this.sendMessage(ws, {
        type: 'authenticated',
        user: { userId, username },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`Authentication failed for connection ${ws.connectionId}:`, error);
      this.sendError(ws, 'Authentication failed');
    }
  }

  handleSubscription(ws, payload) {
    if (!ws.isAuthenticated) {
      this.sendError(ws, 'Authentication required');
      return;
    }

    const { channels } = payload;
    
    if (!Array.isArray(channels)) {
      this.sendError(ws, 'Channels must be an array');
      return;
    }

    for (const channel of channels) {
      if (this.isValidChannel(channel)) {
        ws.subscriptions.add(channel);
        
        // Add to global subscriptions map
        if (!this.subscriptions.has(ws.connectionId)) {
          this.subscriptions.set(ws.connectionId, new Set());
        }
        this.subscriptions.get(ws.connectionId).add(channel);

        logger.debug(`Connection ${ws.connectionId} subscribed to ${channel}`);
      } else {
        this.sendError(ws, `Invalid channel: ${channel}`);
      }
    }

    this.sendMessage(ws, {
      type: 'subscribed',
      channels: Array.from(ws.subscriptions),
      timestamp: new Date().toISOString()
    });
  }

  handleUnsubscription(ws, payload) {
    if (!ws.isAuthenticated) {
      this.sendError(ws, 'Authentication required');
      return;
    }

    const { channels } = payload;
    
    if (!Array.isArray(channels)) {
      this.sendError(ws, 'Channels must be an array');
      return;
    }

    for (const channel of channels) {
      ws.subscriptions.delete(channel);
      
      // Remove from global subscriptions map
      if (this.subscriptions.has(ws.connectionId)) {
        this.subscriptions.get(ws.connectionId).delete(channel);
      }

      logger.debug(`Connection ${ws.connectionId} unsubscribed from ${channel}`);
    }

    this.sendMessage(ws, {
      type: 'unsubscribed',
      channels: Array.from(ws.subscriptions),
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnection(ws) {
    logger.info(`WebSocket connection ${ws.connectionId} closed`);

    // Remove from clients map
    if (ws.userId && this.clients.has(ws.userId)) {
      this.clients.get(ws.userId).delete(ws);
      if (this.clients.get(ws.userId).size === 0) {
        this.clients.delete(ws.userId);
      }
    }

    // Remove from subscriptions map
    this.subscriptions.delete(ws.connectionId);
  }

  isValidChannel(channel) {
    const validChannels = [
      'market-data',
      'trade-updates',
      'ai-recommendations',
      'system-notifications',
      'user-notifications'
    ];

    // Check for symbol-specific channels
    if (channel.startsWith('market-data:') || 
        channel.startsWith('trade-updates:') ||
        channel.startsWith('ai-recommendations:')) {
      return true;
    }

    return validChannels.includes(channel);
  }

  sendMessage(ws, message) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        logger.error(`Failed to send message to connection ${ws.connectionId}:`, error);
      }
    }
  }

  sendError(ws, message, details = null) {
    this.sendMessage(ws, {
      type: 'error',
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast methods
  broadcastToChannel(channel, message) {
    let sentCount = 0;

    for (const [connectionId, subscriptions] of this.subscriptions) {
      if (subscriptions.has(channel)) {
        // Find the WebSocket connection
        for (const client of this.wss.clients) {
          if (client.connectionId === connectionId && client.readyState === client.OPEN) {
            this.sendMessage(client, {
              type: 'broadcast',
              channel,
              data: message,
              timestamp: new Date().toISOString()
            });
            sentCount++;
            break;
          }
        }
      }
    }

    logger.debug(`Broadcasted to ${sentCount} clients on channel: ${channel}`);
    return sentCount;
  }

  broadcastToUser(userId, message) {
    const userConnections = this.clients.get(userId);
    if (!userConnections) return 0;

    let sentCount = 0;
    for (const ws of userConnections) {
      if (ws.readyState === ws.OPEN) {
        this.sendMessage(ws, {
          type: 'user-message',
          data: message,
          timestamp: new Date().toISOString()
        });
        sentCount++;
      }
    }

    logger.debug(`Sent message to ${sentCount} connections for user: ${userId}`);
    return sentCount;
  }

  broadcastMarketData(marketData) {
    const channel = `market-data:${marketData.symbol}`;
    return this.broadcastToChannel(channel, marketData);
  }

  broadcastTradeUpdate(tradeUpdate) {
    // Broadcast to user-specific channel
    const userChannel = `trade-updates:${tradeUpdate.userId}`;
    this.broadcastToChannel(userChannel, tradeUpdate);

    // Also broadcast to general trade updates channel
    return this.broadcastToChannel('trade-updates', tradeUpdate);
  }

  broadcastAIRecommendation(recommendation) {
    const channel = `ai-recommendations:${recommendation.symbol}`;
    return this.broadcastToChannel(channel, recommendation);
  }

  broadcastSystemNotification(notification) {
    return this.broadcastToChannel('system-notifications', notification);
  }

  startHeartbeat() {
    // Prevent multiple heartbeat intervals
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          logger.info(`Terminating inactive connection ${ws.connectionId}`);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Statistics and monitoring
  getStats() {
    const totalConnections = this.wss.clients.size;
    const authenticatedConnections = Array.from(this.wss.clients)
      .filter(ws => ws.isAuthenticated).length;
    const totalSubscriptions = Array.from(this.subscriptions.values())
      .reduce((sum, subs) => sum + subs.size, 0);

    return {
      totalConnections,
      authenticatedConnections,
      uniqueUsers: this.clients.size,
      totalSubscriptions,
      channels: this.getActiveChannels()
    };
  }

  getActiveChannels() {
    const channels = new Set();
    for (const subscriptions of this.subscriptions.values()) {
      for (const channel of subscriptions) {
        channels.add(channel);
      }
    }
    return Array.from(channels);
  }

  // Cleanup method
  shutdown() {
    logger.info('Shutting down WebSocket service');
    
    this.stopHeartbeat();
    
    // Close all connections
    this.wss.clients.forEach((ws) => {
      ws.close(1000, 'Server shutdown');
    });

    // Clear data structures
    this.clients.clear();
    this.subscriptions.clear();
  }
}
