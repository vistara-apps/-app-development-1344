import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function PriceChart() {
  const data = [
    { time: '09:00', price: 42150, volume: 1200 },
    { time: '10:00', price: 42280, volume: 1450 },
    { time: '11:00', price: 42100, volume: 1380 },
    { time: '12:00', price: 42350, volume: 1620 },
    { time: '13:00', price: 42450, volume: 1750 },
    { time: '14:00', price: 42320, volume: 1580 },
    { time: '15:00', price: 42580, volume: 1890 },
    { time: '16:00', price: 42720, volume: 2100 },
  ]

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="url(#gradient)" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#8b5cf6' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}