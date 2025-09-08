import React, { useState, useEffect } from 'react'
import { 
  ArrowUpDown, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'

const Trading = () => {
  const [tradeForm, setTradeForm] = useState({
    pair: 'BTC/USD',
    side: 'buy',
    amount: '',
    orderType: 'market'
  })
  const [aiRecommendation, setAiRecommendation] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] })
  const [activeOrders, setActiveOrders] = useState([])

  // Simulate AI analysis when form changes
  useEffect(() => {
    if (tradeForm.amount && parseFloat(tradeForm.amount) > 0) {
      setIsAnalyzing(true)
      const timer = setTimeout(() => {
        setAiRecommendation({
          optimalExchange: 'Binance',
          estimatedSlippage: '0.12%',
          slippageSavings: '$89.34',
          confidence: 92,
          recommendation: 'Split order across 2 exchanges for optimal execution',
          executionTime: '~2.3s'
        })
        setIsAnalyzing(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [tradeForm.amount])

  // Generate mock order book data
  useEffect(() => {
    const generateOrderBook = () => {
      const basePrice = 42000
      const bids = []
      const asks = []
      
      for (let i = 0; i < 10; i++) {
        bids.push({
          price: basePrice - (i * 5),
          amount: Math.random() * 5,
          total: Math.random() * 100000
        })
        asks.push({
          price: basePrice + (i * 5),
          amount: Math.random() * 5,
          total: Math.random() * 100000
        })
      }
      
      setOrderBook({ bids, asks })
    }

    generateOrderBook()
    const interval = setInterval(generateOrderBook, 3000)
    return () => clearInterval(interval)
  }, [])

  // Mock active orders
  useEffect(() => {
    setActiveOrders([
      {
        id: '1',
        pair: 'ETH/USD',
        side: 'buy',
        amount: '2.5',
        price: '$2,840.50',
        status: 'partially_filled',
        filled: '60%',
        exchange: 'Coinbase'
      },
      {
        id: '2',
        pair: 'BTC/USD',
        side: 'sell',
        amount: '0.1',
        price: '$42,150.00',
        status: 'pending',
        filled: '0%',
        exchange: 'Kraken'
      }
    ])
  }, [])

  const handleInputChange = (field, value) => {
    setTradeForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitOrder = () => {
    if (!tradeForm.amount || !aiRecommendation) return
    
    const newOrder = {
      id: Date.now().toString(),
      pair: tradeForm.pair,
      side: tradeForm.side,
      amount: tradeForm.amount,
      price: tradeForm.orderType === 'market' ? 'Market' : '$42,000',
      status: 'pending',
      filled: '0%',
      exchange: aiRecommendation.optimalExchange
    }
    
    setActiveOrders(prev => [newOrder, ...prev])
    setTradeForm(prev => ({ ...prev, amount: '' }))
    setAiRecommendation(null)
  }

  const pairs = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'AVAX/USD', 'DOT/USD']

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Trading Form */}
      <div className="xl:col-span-1 space-y-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Place Order</h3>
            <div className="flex items-center gap-2 text-sm text-success-400">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
              AI Enabled
            </div>
          </div>

          <div className="space-y-4">
            {/* Trading Pair */}
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">Trading Pair</label>
              <select 
                value={tradeForm.pair}
                onChange={(e) => handleInputChange('pair', e.target.value)}
                className="w-full bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-white focus:border-accent-500 focus:outline-none"
              >
                {pairs.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
            </div>

            {/* Order Type */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleInputChange('orderType', 'market')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  tradeForm.orderType === 'market' 
                    ? 'bg-accent-500 text-white' 
                    : 'bg-primary-700/50 text-primary-300 hover:bg-primary-700'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => handleInputChange('orderType', 'limit')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  tradeForm.orderType === 'limit' 
                    ? 'bg-accent-500 text-white' 
                    : 'bg-primary-700/50 text-primary-300 hover:bg-primary-700'
                }`}
              >
                Limit
              </button>
            </div>

            {/* Buy/Sell Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleInputChange('side', 'buy')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  tradeForm.side === 'buy' 
                    ? 'bg-success-500 text-white' 
                    : 'bg-primary-700/50 text-primary-300 hover:bg-primary-700'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => handleInputChange('side', 'sell')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  tradeForm.side === 'sell' 
                    ? 'bg-danger-500 text-white' 
                    : 'bg-primary-700/50 text-primary-300 hover:bg-primary-700'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={tradeForm.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-white focus:border-accent-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-primary-400 text-sm">
                  {tradeForm.pair.split('/')[0]}
                </span>
              </div>
            </div>

            {/* AI Recommendation */}
            {isAnalyzing && (
              <div className="p-4 bg-accent-500/10 border border-accent-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-accent-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">AI analyzing optimal execution...</span>
                </div>
              </div>
            )}

            {aiRecommendation && !isAnalyzing && (
              <div className="p-4 bg-success-500/10 border border-success-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-success-400" />
                  <span className="text-sm font-medium text-success-400">AI Recommendation</span>
                  <span className="px-2 py-1 bg-success-500/20 text-success-400 rounded-full text-xs">
                    {aiRecommendation.confidence}% confidence
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary-300">Optimal Exchange:</span>
                    <span className="text-white font-medium">{aiRecommendation.optimalExchange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Estimated Slippage:</span>
                    <span className="text-white font-medium">{aiRecommendation.estimatedSlippage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Potential Savings:</span>
                    <span className="text-success-400 font-medium">{aiRecommendation.slippageSavings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-300">Execution Time:</span>
                    <span className="text-white font-medium">{aiRecommendation.executionTime}</span>
                  </div>
                </div>
                <p className="text-xs text-primary-400 mt-3">{aiRecommendation.recommendation}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={!tradeForm.amount || !aiRecommendation}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              {tradeForm.side === 'buy' ? 'Buy' : 'Sell'} {tradeForm.pair.split('/')[0]}
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Balance</h3>
          <div className="space-y-3">
            {[
              { symbol: 'USD', amount: '25,430.50', usd: '25,430.50' },
              { symbol: 'BTC', amount: '1.2534', usd: '52,847.32' },
              { symbol: 'ETH', amount: '12.4', usd: '35,124.80' },
              { symbol: 'SOL', amount: '89.2', usd: '8,456.30' }
            ].map((balance, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-500/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-accent-400">{balance.symbol}</span>
                  </div>
                  <span className="text-white font-medium">{balance.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{balance.amount}</div>
                  <div className="text-xs text-primary-400">${balance.usd}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Book & Market Data */}
      <div className="xl:col-span-2 space-y-6">
        {/* Order Book */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Order Book - {tradeForm.pair}</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Asks */}
            <div>
              <h4 className="text-sm font-medium text-danger-400 mb-3">Asks (Sell Orders)</h4>
              <div className="space-y-1">
                {orderBook.asks.slice(0, 8).map((ask, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-danger-400">${ask.price.toLocaleString()}</span>
                    <span className="text-primary-300">{ask.amount.toFixed(4)}</span>
                    <span className="text-primary-400">${ask.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bids */}
            <div>
              <h4 className="text-sm font-medium text-success-400 mb-3">Bids (Buy Orders)</h4>
              <div className="space-y-1">
                {orderBook.bids.slice(0, 8).map((bid, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-success-400">${bid.price.toLocaleString()}</span>
                    <span className="text-primary-300">{bid.amount.toFixed(4)}</span>
                    <span className="text-primary-400">${bid.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Active Orders</h3>
            <span className="text-sm text-primary-400">{activeOrders.length} orders</span>
          </div>
          
          {activeOrders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-primary-400 mx-auto mb-3" />
              <p className="text-primary-400">No active orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <div key={order.id} className="p-4 bg-primary-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.side === 'buy' 
                          ? 'bg-success-500/20 text-success-400' 
                          : 'bg-danger-500/20 text-danger-400'
                      }`}>
                        {order.side.toUpperCase()}
                      </span>
                      <span className="text-white font-medium">{order.pair}</span>
                      <span className="text-primary-400">•</span>
                      <span className="text-primary-400 text-sm">{order.exchange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === 'partially_filled' && (
                        <CheckCircle className="w-4 h-4 text-warning-400" />
                      )}
                      {order.status === 'pending' && (
                        <Clock className="w-4 h-4 text-primary-400" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'partially_filled' 
                          ? 'bg-warning-500/20 text-warning-400'
                          : 'bg-primary-500/20 text-primary-400'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-primary-400">Amount:</span>
                      <span className="text-white ml-2">{order.amount}</span>
                    </div>
                    <div>
                      <span className="text-primary-400">Price:</span>
                      <span className="text-white ml-2">{order.price}</span>
                    </div>
                    <div>
                      <span className="text-primary-400">Filled:</span>
                      <span className="text-white ml-2">{order.filled}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Trading