import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('7d')
  const [performanceData, setPerformanceData] = useState([])
  const [slippageData, setSlippageData] = useState([])
  const [exchangeData, setExchangeData] = useState([])
  const [profitData, setProfitData] = useState([])

  useEffect(() => {
    // Generate mock analytics data
    const generatePerformanceData = () => {
      const data = []
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
      for (let i = 0; i < days; i++) {
        data.push({
          date: `Day ${i + 1}`,
          portfolio: 100000 + Math.random() * 50000,
          benchmark: 100000 + Math.random() * 30000,
          slippageSaved: Math.random() * 1000
        })
      }
      return data
    }

    const generateSlippageData = () => {
      const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Uniswap', 'dYdX']
      return exchanges.map(exchange => ({
        exchange,
        avgSlippage: Math.random() * 2,
        slippageSaved: Math.random() * 5,
        trades: Math.floor(Math.random() * 100) + 50
      }))
    }

    const generateExchangeData = () => [
      { name: 'Binance', value: 35, color: '#f59e0b' },
      { name: 'Coinbase', value: 25, color: '#6366f1' },
      { name: 'Kraken', value: 20, color: '#10b981' },
      { name: 'Uniswap', value: 15, color: '#ef4444' },
      { name: 'Others', value: 5, color: '#8b5cf6' }
    ]

    const generateProfitData = () => {
      const data = []
      for (let i = 0; i < 12; i++) {
        data.push({
          month: `M${i + 1}`,
          profit: Math.random() * 10000 - 2000,
          fees: Math.random() * 500,
          slippageSaved: Math.random() * 1500
        })
      }
      return data
    }

    setPerformanceData(generatePerformanceData())
    setSlippageData(generateSlippageData())
    setExchangeData(generateExchangeData())
    setProfitData(generateProfitData())
  }, [timeframe])

  const metrics = [
    {
      title: 'Total Slippage Saved',
      value: '$12,847.32',
      change: '+18.5%',
      changeType: 'positive',
      icon: Target
    },
    {
      title: 'Average Execution Time',
      value: '2.3s',
      change: '-0.7s',
      changeType: 'positive',
      icon: Zap
    },
    {
      title: 'Successful Optimizations',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Trading Volume',
      value: '$2.1M',
      change: '+15.3%',
      changeType: 'positive',
      icon: Calendar
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Performance Analytics</h2>
          <p className="text-primary-400">Detailed insights into your trading optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-white focus:border-accent-500 focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-accent-400" />
                </div>
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-success-400' : 'text-danger-400'
                }`}>
                  {metric.change}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                <p className="text-sm text-primary-400">{metric.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Portfolio Performance */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Portfolio Performance</h3>
              <p className="text-sm text-primary-400">vs Market Benchmark</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                <span className="text-primary-300">Portfolio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-primary-300">Benchmark</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis hide />
                <Area 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fill="url(#portfolioGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#64748b" 
                  strokeWidth={2}
                  fill="url(#benchmarkGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exchange Distribution */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Exchange Usage</h3>
              <p className="text-sm text-primary-400">Trading volume distribution</p>
            </div>
          </div>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={exchangeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {exchangeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {exchangeData.map((exchange, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: exchange.color }}
                ></div>
                <span className="text-sm text-primary-300">{exchange.name}</span>
                <span className="text-sm text-white font-medium ml-auto">{exchange.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Slippage Analysis */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Slippage Analysis</h3>
              <p className="text-sm text-primary-400">By exchange</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slippageData}>
                <XAxis 
                  dataKey="exchange" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis hide />
                <Bar dataKey="slippageSaved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {slippageData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-primary-300">{item.exchange}</span>
                <div className="flex items-center gap-4">
                  <span className="text-white">Avg: {item.avgSlippage.toFixed(2)}%</span>
                  <span className="text-success-400">Saved: {item.slippageSaved.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly P&L */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Monthly P&L</h3>
              <p className="text-sm text-primary-400">Profit, fees, and savings</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis hide />
                <Bar dataKey="profit" fill="#6366f1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="slippageSaved" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
              <span className="text-primary-300">Net Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <span className="text-primary-300">Slippage Saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Trade Analysis</h3>
          <span className="text-sm text-primary-400">Last 10 trades</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-primary-400">Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary-400">Pair</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary-400">Side</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary-400">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary-400">Exchange</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary-400">Slippage</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-primary-400">Saved</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '14:32', pair: 'BTC/USD', side: 'Buy', amount: '0.5', exchange: 'Binance', slippage: '0.12%', saved: '$89' },
                { time: '14:15', pair: 'ETH/USD', side: 'Sell', amount: '2.3', exchange: 'Coinbase', slippage: '0.08%', saved: '$156' },
                { time: '13:58', pair: 'SOL/USD', side: 'Buy', amount: '50', exchange: 'Kraken', slippage: '0.15%', saved: '$67' },
                { time: '13:42', pair: 'AVAX/USD', side: 'Buy', amount: '100', exchange: 'Uniswap', slippage: '0.31%', saved: '$234' },
                { time: '13:21', pair: 'BTC/USD', side: 'Sell', amount: '0.2', exchange: 'Binance', slippage: '0.09%', saved: '$45' }
              ].map((trade, index) => (
                <tr key={index} className="border-b border-primary-800/50">
                  <td className="py-3 px-4 text-sm text-white">{trade.time}</td>
                  <td className="py-3 px-4 text-sm text-white font-medium">{trade.pair}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.side === 'Buy' 
                        ? 'bg-success-500/20 text-success-400' 
                        : 'bg-danger-500/20 text-danger-400'
                    }`}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-white">{trade.amount}</td>
                  <td className="py-3 px-4 text-sm text-primary-300">{trade.exchange}</td>
                  <td className="py-3 px-4 text-sm text-warning-400">{trade.slippage}</td>
                  <td className="py-3 px-4 text-sm text-success-400 font-medium">{trade.saved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analytics