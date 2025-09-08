import React, { useState } from 'react'
import { ArrowUpDown, Zap, AlertTriangle } from 'lucide-react'

export function Trading({ subscriptionTier }) {
  const [tradeForm, setTradeForm] = useState({
    pair: 'BTC/USDT',
    side: 'buy',
    amount: '',
    orderType: 'market'
  })

  const [aiPrediction, setAiPrediction] = useState({
    predictedSlippage: '0.15%',
    optimalSize: '$47,500',
    bestExchange: 'Binance',
    confidence: '94%'
  })

  const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Bitfinex', 'KuCoin']
  const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT']

  const handleInputChange = (field, value) => {
    setTradeForm(prev => ({ ...prev, [field]: value }))
  }

  const handleTrade = () => {
    // Simulate trade execution
    alert(`Trade executed: ${tradeForm.side.toUpperCase()} ${tradeForm.amount} ${tradeForm.pair}`)
  }

  const isPremiumFeature = (feature) => {
    if (subscriptionTier === 'basic') return feature !== 'basic'
    if (subscriptionTier === 'pro') return feature === 'premium'
    return false
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Order</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trading Pair</label>
                <select 
                  value={tradeForm.pair}
                  onChange={(e) => handleInputChange('pair', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {pairs.map(pair => (
                    <option key={pair} value={pair}>{pair}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInputChange('side', 'buy')}
                    className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
                      tradeForm.side === 'buy' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => handleInputChange('side', 'sell')}
                    className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
                      tradeForm.side === 'sell' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD)</label>
              <input
                type="number"
                value={tradeForm.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="Enter amount"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button 
              onClick={handleTrade}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <ArrowUpDown className="w-5 h-5" />
              <span>Execute Trade</span>
            </button>
          </div>

          {/* Exchange Selection */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exchange Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {exchanges.map((exchange, index) => (
                <div key={exchange} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{exchange}</span>
                  <div className={`w-3 h-3 rounded-full ${
                    index < 3 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Predictions Sidebar */}
        <div className="space-y-6">
          <div className={`card p-6 ${isPremiumFeature('pro') ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Predictions</h3>
              {isPremiumFeature('pro') && (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            
            {isPremiumFeature('pro') ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-2">Upgrade to Pro to access AI predictions</p>
                <button className="btn-primary text-sm">Upgrade</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Predicted Slippage</span>
                  <span className="text-sm text-green-600">{aiPrediction.predictedSlippage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Optimal Size</span>
                  <span className="text-sm text-gray-600">{aiPrediction.optimalSize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Best Exchange</span>
                  <span className="text-sm text-blue-600">{aiPrediction.bestExchange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm text-green-600">{aiPrediction.confidence}</span>
                </div>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Today's Volume</span>
                <span className="text-sm font-medium">$12.4K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Trades Executed</span>
                <span className="text-sm font-medium">7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Slippage</span>
                <span className="text-sm font-medium text-green-600">0.18%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}