import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, Zap } from 'lucide-react'
import { PriceChart } from './PriceChart'
import { MarketDataTable } from './MarketDataTable'

export function Dashboard({ subscriptionTier }) {
  const stats = [
    { 
      label: 'Total Volume', 
      value: '$127.8K', 
      change: '+12.5%', 
      trend: 'up',
      icon: DollarSign 
    },
    { 
      label: 'Slippage Saved', 
      value: '0.34%', 
      change: '+0.12%', 
      trend: 'up',
      icon: Zap 
    },
    { 
      label: 'Active Exchanges', 
      value: '8', 
      change: '+2', 
      trend: 'up',
      icon: TrendingUp 
    },
    { 
      label: 'Avg. Execution', 
      value: '1.2s', 
      change: '-0.3s', 
      trend: 'up',
      icon: Zap 
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card p-4 lg:p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-accent rounded-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="card p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trends</h3>
          <PriceChart />
        </div>
        
        <div className="card p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Liquidity Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Best Route</span>
              <span className="text-sm text-gray-600">Binance → Coinbase</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Predicted Slippage</span>
              <span className="text-sm text-green-600">0.12%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Optimal Size</span>
              <span className="text-sm text-gray-600">$50K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Data Table */}
      <div className="card p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Market Data</h3>
        <MarketDataTable subscriptionTier={subscriptionTier} />
      </div>
    </div>
  )
}