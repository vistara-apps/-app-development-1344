import React from 'react'
import { Bell, User, Crown } from 'lucide-react'

export function Header({ subscriptionTier }) {
  const getTierInfo = () => {
    switch (subscriptionTier) {
      case 'premium':
        return { name: 'Premium', color: 'text-yellow-400', icon: Crown }
      case 'pro':
        return { name: 'Pro', color: 'text-purple-400', icon: Crown }
      default:
        return { name: 'Basic', color: 'text-blue-400', icon: User }
    }
  }

  const tierInfo = getTierInfo()
  const TierIcon = tierInfo.icon

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-white text-lg lg:text-xl font-semibold">Trading Dashboard</h2>
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-white/20 rounded-full">
            <TierIcon className={`w-4 h-4 ${tierInfo.color}`} />
            <span className="text-white text-sm font-medium">{tierInfo.name}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}