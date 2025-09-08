import React from 'react'
import { TrendingUp, PieChart, BarChart3, AlertTriangle } from 'lucide-react'
import { PriceChart } from './PriceChart'

export function Analytics({ subscriptionTier }) {
  const isPremiumFeature = (feature) => {
    if (subscriptionTier === 'basic') return feature !== 'basic'
    if (subscriptionTier === 'pro') return feature === 'premium'
    return false
  }

  const analyticsData = [
    { period: 'Last 7 Days', volume: '$45.2K', trades: 23, slippage: '0.21%' },
    { period: 'Last 30 Days', volume: '$187.8K', trades: 96, slippage: '0.24%' },
    { period: 'Last 90 Days', volume: '$523.1K', trades: 284, slippage: '0.19%' },
  ]

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {analyticsData.map((data, index) => (
          <div key={index} className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{data.period}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Volume</span>
                <span className="font-semibold">{data.volume}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trades</span>
                <span className="font-semibold">{data.trades}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Slippage</span>
                <span className="font-semibold text-green-600">{data.slippage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
          <PriceChart />
        </div>

        <div className={`card p-6 ${isPremiumFeature('premium') ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Analysis</h3>
            {isPremiumFeature('premium') && (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          
          {isPremiumFeature('premium') ? (
            <div className="text-center py-8">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Advanced risk analysis available in Premium</p>
              <button className="btn-primary">Upgrade to Premium</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium">Risk Score</span>
                <span className="text-sm font-bold text-green-700">Low (2.3/10)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium">Diversification</span>
                <span className="text-sm font-bold text-blue-700">Good (7.8/10)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-sm font-medium">Volatility</span>
                <span className="text-sm font-bold text-yellow-700">Medium (5.2/10)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Trading History</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Export CSV
            </button>
            <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Generate Report
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Pair</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Side</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Price</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Slippage</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Exchange</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2024-01-15', pair: 'BTC/USDT', side: 'Buy', amount: '$5,000', price: '$42,150', slippage: '0.12%', exchange: 'Binance' },
                { date: '2024-01-14', pair: 'ETH/USDT', side: 'Sell', amount: '$3,200', price: '$2,651', slippage: '0.18%', exchange: 'Coinbase' },
                { date: '2024-01-13', pair: 'BNB/USDT', side: 'Buy', amount: '$1,500', price: '$315.20', slippage: '0.09%', exchange: 'Binance' },
              ].map((trade, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-sm">{trade.date}</td>
                  <td className="p-3 text-sm font-medium">{trade.pair}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trade.side === 'Buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{trade.amount}</td>
                  <td className="p-3 text-sm">{trade.price}</td>
                  <td className="p-3 text-sm text-green-600">{trade.slippage}</td>
                  <td className="p-3 text-sm">{trade.exchange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}