import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function MarketDataTable({ subscriptionTier }) {
  const marketData = [
    { 
      symbol: 'BTC/USDT', 
      price: '$42,150.00', 
      change: '+2.45%', 
      volume: '$2.1B', 
      liquidity: 'High',
      bestExchange: 'Binance',
      trend: 'up'
    },
    { 
      symbol: 'ETH/USDT', 
      price: '$2,651.30', 
      change: '+1.82%', 
      volume: '$1.8B', 
      liquidity: 'High',
      bestExchange: 'Coinbase',
      trend: 'up'
    },
    { 
      symbol: 'BNB/USDT', 
      price: '$315.20', 
      change: '-0.95%', 
      volume: '$420M', 
      liquidity: 'Medium',
      bestExchange: 'Binance',
      trend: 'down'
    },
    { 
      symbol: 'ADA/USDT', 
      price: '$0.4850', 
      change: '+3.12%', 
      volume: '$180M', 
      liquidity: 'Medium',
      bestExchange: 'Kraken',
      trend: 'up'
    },
    { 
      symbol: 'SOL/USDT', 
      price: '$98.45', 
      change: '+5.67%', 
      volume: '$320M', 
      liquidity: 'High',
      bestExchange: 'Bitfinex',
      trend: 'up'
    },
  ]

  const showAdvancedColumns = subscriptionTier !== 'basic'

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-3 text-sm font-medium text-gray-600">Symbol</th>
            <th className="text-left p-3 text-sm font-medium text-gray-600">Price</th>
            <th className="text-left p-3 text-sm font-medium text-gray-600">24h Change</th>
            <th className="text-left p-3 text-sm font-medium text-gray-600">Volume</th>
            {showAdvancedColumns && (
              <>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Liquidity</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Best Exchange</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {marketData.map((item, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{item.symbol}</span>
                  {item.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 ml-2" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 ml-2" />
                  )}
                </div>
              </td>
              <td className="p-3 font-medium text-gray-900">{item.price}</td>
              <td className="p-3">
                <span className={`font-medium ${
                  item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change}
                </span>
              </td>
              <td className="p-3 text-gray-600">{item.volume}</td>
              {showAdvancedColumns && (
                <>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.liquidity === 'High' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.liquidity}
                    </span>
                  </td>
                  <td className="p-3 text-blue-600 font-medium">{item.bestExchange}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {!showAdvancedColumns && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm mb-2">Upgrade to see liquidity data and exchange recommendations</p>
          <button className="btn-primary text-sm">Upgrade Plan</button>
        </div>
      )}
    </div>
  )
}