import React from 'react'
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Zap,
  Bell,
  User,
  LogOut
} from 'lucide-react'

const AppShell = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trading', label: 'Trading', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 glass border-r border-accent-600/20 p-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">LiquidityFlow AI</h1>
            <p className="text-xs text-primary-400">Trade Smarter</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                  activeTab === item.id
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                    : 'text-primary-300 hover:text-white hover:bg-primary-700/30'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Subscription Status */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-300">Pro Plan</span>
            <span className="px-2 py-1 bg-success-500/20 text-success-400 rounded-full text-xs font-medium">
              Active
            </span>
          </div>
          <div className="w-full bg-primary-700 rounded-full h-2 mb-2">
            <div className="bg-gradient-to-r from-accent-500 to-accent-400 h-2 rounded-full w-3/4"></div>
          </div>
          <p className="text-xs text-primary-400">750K / 1M volume used</p>
        </div>

        {/* User Profile */}
        <div className="mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-700/30">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Alex Chen</p>
              <p className="text-xs text-primary-400">alex@trader.com</p>
            </div>
            <LogOut className="w-4 h-4 text-primary-400 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass border-b border-accent-600/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white capitalize">{activeTab}</h2>
              <p className="text-sm text-primary-400">AI-powered trading optimization</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg bg-primary-700/30 hover:bg-primary-700/50 transition-colors">
                <Bell className="w-5 h-5 text-primary-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
                <span className="text-primary-300">Live Data</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell