import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'

const Dashboard = () => {
  const [marketData, setMarketData] = useState([])
  const [performanceData, setPerformanceData] = useState([])
  const [volumeData, setVolumeData] = useState([])

  // Simulate real-time data
  useEffect(() => {
    const generateMarketData = () => {
      const data = []
      const basePrice = 42000
      for (let i = 0; i < 24; i++) {
        data.push({
          time: `${i}:00`,
          price: basePrice + Math.random() * 2000 - 1000,
          volume: Math.random() * 1000000
        })
      }
      return data
    }

    const generatePerformanceData = () => {
      const data = []
      for (let i = 0; i < 7; i++) {
        data.push({
          day: `Day ${i + 1}`,
          slippageSaved: Math.random() * 5,
          profit: Math.random() * 10000
        })
      }
      return data
    }

    const generateVolumeData = () => {
      const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Uniswap', 'dYdX']
      return exchanges.map(exchange => ({
        exchange,
        volume: Math.random() * 1000000,
        trades: Math.floor(Math.random() * 1000)
      }))
    }

    setMarketData(generateMarketData())
    setPerformanceData(generatePerformanceData())
    setVolumeData(generateVolumeData())

    const interval = setInterval(() => {
      setMarketData(generateMarketData())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: '$156,742.89',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      title: 'Slippage Saved Today',
      value: '2.34%',
      change: '+0.87%',
      changeType: 'positive',
      icon: Zap
    },
    {
      title: 'Active Trades',
      value: '7',
      change: '+2',
      changeType: 'positive',
      icon: Activity
    },
    {
      title: '24h Volume',
      value: '$89,234',
      change: '-5.2%',
      changeType: 'negative',
      icon: TrendingUp
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-accent-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.changeType === 'positive' ? 'text-success-400' : 'text-danger-400'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-primary-400">{stat.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">BTC/USD Price</h3>
              <p className="text-sm text-primary-400">Last 24 hours</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">$42,589.34</p>
              <p className="text-sm text-success-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +2.34%
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis hide />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fill="url(#priceGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Slippage Optimization</h3>
              <p className="text-sm text-primary-400">Weekly performance</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="slippageSaved" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Exchange Volume and Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exchange Volume */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Exchange Volume Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} layout="horizontal">
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="exchange" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  width={80}
                />
                <Bar dataKey="volume" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent AI Recommendations */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">AI Recommendations</h3>
          <div className="space-y-4">
            {[
              {
                pair: 'ETH/USD',
                action: 'Split Order',
                reason: 'High slippage detected on single exchange',
                confidence: 89,
                savings: '$234'
              },
              {
                pair: 'BTC/USD',
                action: 'Route to Binance',
                reason: 'Best liquidity depth available',
                confidence: 95,
                savings: '$567'
              },
              {
                pair: 'SOL/USD',
                action: 'Wait 15min',
                reason: 'Volatility spike predicted',
                confidence: 76,
                savings: '$123'
              }
            ].map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-primary-700/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{rec.pair}</span>
                    <span className="px-2 py-1 bg-accent-500/20 text-accent-400 rounded text-xs">
                      {rec.action}
                    </span>
                  </div>
                  <p className="text-sm text-primary-400">{rec.reason}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-success-400 font-medium">{rec.savings}</div>
                  <div className="text-xs text-primary-400">{rec.confidence}% confidence</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard