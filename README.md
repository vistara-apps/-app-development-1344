# LiquidityFlow AI

**Trade smarter with AI-powered liquidity aggregation and slippage minimization.**

LiquidityFlow AI is an advanced cryptocurrency trading platform that uses artificial intelligence to optimize trade execution across multiple exchanges, minimize slippage, and maximize trading efficiency.

## 🚀 Features

### Core Features
- **Multi-Exchange Data Aggregation**: Real-time price and volume data from multiple cryptocurrency exchanges
- **Intelligent Liquidity Routing**: AI-powered routing to find optimal trading venues with best liquidity
- **AI-Powered Slippage Minimization**: Predictive models to anticipate and mitigate slippage
- **Predictive Order Sizing**: AI recommendations for optimal order sizes based on market conditions

### Technical Features
- **Real-time WebSocket Connections**: Live market data streaming
- **Advanced AI Models**: Machine learning for slippage prediction and routing optimization
- **Comprehensive Analytics**: Detailed performance metrics and trading insights
- **Multi-tier Subscription System**: Flexible pricing based on trading volume and features
- **Professional Dashboard**: Modern, responsive UI with real-time updates

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **State Management**: React hooks and context
- **Real-time Updates**: WebSocket integration

### Backend (Node.js + Express)
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with comprehensive middleware
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: WebSocket server for live updates
- **Authentication**: JWT-based authentication
- **Logging**: Winston for structured logging

### AI/ML Services
- **Slippage Prediction**: Machine learning models for price impact estimation
- **Liquidity Routing**: Optimization algorithms for multi-exchange execution
- **Market Analysis**: Real-time market condition assessment
- **Order Sizing**: AI-driven position sizing recommendations

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 5.0+
- Redis (optional, for caching)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd liquidityflow-ai
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit the environment variables
   nano server/.env
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:5.0
   
   # Or start your local MongoDB instance
   mongod
   ```

5. **Start the application**
   ```bash
   # Start backend server (from root directory)
   cd server && npm run dev &
   
   # Start frontend development server (from root directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

## 🔧 Configuration

### Environment Variables

Key environment variables in `server/.env`:

```env
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/liquidityflow-ai

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
```

### Database Models

The application uses the following main data models:

- **User**: User accounts, subscriptions, and preferences
- **Exchange**: Exchange configurations and health status
- **MarketData**: Real-time and historical market data
- **Trade**: Trade execution records and performance metrics

## 🤖 AI Models

### Slippage Prediction Model
- Analyzes order book depth and historical data
- Predicts price impact for different order sizes
- Provides confidence scores for predictions

### Liquidity Routing Model
- Evaluates multiple execution strategies
- Optimizes order splitting across exchanges
- Considers fees, latency, and market conditions

### Order Sizing Model
- Recommends optimal position sizes
- Considers risk parameters and market liquidity
- Adapts to user preferences and constraints

### Market Condition Model
- Assesses current market volatility and trends
- Identifies optimal execution timing
- Provides risk assessments and mitigation strategies

## 📊 API Documentation

### Authentication
```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

### Market Data
```bash
GET /api/market-data/latest/:symbol
GET /api/market-data/aggregated/:symbol
GET /api/market-data/history/:symbol
```

### AI Analysis
```bash
POST /api/ai/analyze-trade
GET /api/ai/recommendations/:symbol
POST /api/ai/optimize-order
```

### Trading
```bash
POST /api/trading/execute
GET /api/trading/history
GET /api/trading/performance
```

### WebSocket Events
```javascript
// Client to Server
{
  "type": "authenticate",
  "payload": { "token": "jwt-token" }
}

{
  "type": "subscribe",
  "payload": { "channels": ["market-data:BTCUSDT"] }
}

// Server to Client
{
  "type": "broadcast",
  "channel": "market-data:BTCUSDT",
  "data": { /* market data */ }
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured CORS policies
- **Helmet Security**: Security headers and protection
- **Password Hashing**: bcrypt for secure password storage

## 📈 Subscription Tiers

### Basic ($29/month)
- Up to $100K trading volume
- Basic AI optimization
- 5 exchange connections
- Email support
- Standard analytics

### Pro ($79/month)
- Up to $1M trading volume
- Advanced AI optimization
- 15 exchange connections
- Priority support
- Advanced analytics
- Custom alerts

### Premium ($199/month)
- Unlimited trading volume
- Enterprise AI features
- Unlimited exchanges
- 24/7 dedicated support
- Real-time analytics
- API access
- Custom integrations

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-production-secret
   ```

2. **Build Frontend**
   ```bash
   npm run build
   ```

3. **Start Production Server**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test

# Run integration tests
npm run test:integration
```

## 📝 Development

### Code Structure
```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── styles/            # CSS and styling
├── server/                # Backend source code
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   └── utils/             # Backend utilities
└── docs/                  # Documentation
```

### Development Guidelines
- Follow ESLint configuration for code style
- Use TypeScript for type safety (optional)
- Write comprehensive tests for new features
- Document API changes in the README
- Follow semantic versioning for releases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Email**: Contact support at support@liquidityflow.ai
- **Discord**: Join our community Discord server

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core platform development
- ✅ Basic AI models implementation
- ✅ Multi-exchange data aggregation
- ✅ Real-time WebSocket integration

### Phase 2 (Next)
- 🔄 Advanced AI model training
- 🔄 Additional exchange integrations
- 🔄 Mobile application
- 🔄 Advanced analytics dashboard

### Phase 3 (Future)
- 📋 Institutional features
- 📋 API marketplace
- 📋 Algorithmic trading strategies
- 📋 DeFi protocol integrations

---

**Built with ❤️ by the LiquidityFlow AI team**
