import React from 'react'
import { BarChart3, TrendingUp, Settings, Home, Zap } from 'lucide-react'

export function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'trading', label: 'Trading', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="w-16 lg:w-64 bg-white/10 backdrop-blur-md border-r border-white/20">
      <div className="p-4 lg:p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="hidden lg:block text-white font-bold text-xl">LiquidityFlow AI</h1>
        </div>
      </div>
      
      <nav className="mt-8 px-2 lg:px-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 lg:px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden lg:block ml-3 font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}