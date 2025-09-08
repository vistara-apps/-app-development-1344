import React, { useState } from 'react'
import { 
  User, 
  CreditCard, 
  Shield, 
  Bell, 
  Key, 
  BarChart, 
  Zap,
  ChevronRight,
  Check,
  X
} from 'lucide-react'

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile')
  const [notifications, setNotifications] = useState({
    tradingAlerts: true,
    priceAlerts: false,
    slippageAlerts: true,
    systemUpdates: true
  })
  const [aiSettings, setAiSettings] = useState({
    autoExecution: false,
    riskLevel: 'medium',
    maxSlippage: '0.5',
    minConfidence: '80'
  })

  const settingSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'ai', label: 'AI Settings', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart }
  ]

  const subscriptionPlans = [
    {
      name: 'Basic',
      price: '$29',
      period: '/month',
      features: [
        'Up to $100K trading volume',
        'Basic AI optimization',
        '5 exchange connections',
        'Email support',
        'Standard analytics'
      ],
      current: false
    },
    {
      name: 'Pro',
      price: '$79',
      period: '/month',
      features: [
        'Up to $1M trading volume',
        'Advanced AI optimization',
        '15 exchange connections',
        'Priority support',
        'Advanced analytics',
        'Custom alerts'
      ],
      current: true
    },
    {
      name: 'Premium',
      price: '$199',
      period: '/month',
      features: [
        'Unlimited trading volume',
        'Enterprise AI features',
        'Unlimited exchanges',
        '24/7 dedicated support',
        'Real-time analytics',
        'API access',
        'Custom integrations'
      ],
      current: false
    }
  ]

  const connectedExchanges = [
    { name: 'Binance', status: 'connected', permissions: 'Trade + Read' },
    { name: 'Coinbase Pro', status: 'connected', permissions: 'Read Only' },
    { name: 'Kraken', status: 'connected', permissions: 'Trade + Read' },
    { name: 'Uniswap', status: 'error', permissions: 'None' },
    { name: 'dYdX', status: 'disconnected', permissions: 'None' }
  ]

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Profile Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">First Name</label>
              <input 
                type="text" 
                defaultValue="Alex"
                className="w-full bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-white focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">Last Name</label>
              <input 
                type="text" 
                defaultValue="Chen"
                className="w-full bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-white focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">Email Address</label>
            <input 
              type="email" 
              defaultValue="alex@trader.com"
              className="w-full bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-white focus:border-accent-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">Timezone</label>
            <select className="w-full bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-white focus:border-accent-500 focus:outline-none">
              <option>UTC-8 (Pacific Time)</option>
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC+0 (Greenwich Time)</option>
              <option>UTC+8 (Singapore Time)</option>
            </select>
          </div>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  )

  const renderSubscriptionSection = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Subscription Plans</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`p-6 rounded-lg border-2 transition-colors ${
                plan.current 
                  ? 'border-accent-500 bg-accent-500/10' 
                  : 'border-primary-600 bg-primary-700/30 hover:border-primary-500'
              }`}
            >
              <div className="text-center mb-6">
                <h4 className="text-xl font-semibold text-white mb-2">{plan.name}</h4>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-primary-400">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                    <span className="text-primary-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plan.current 
                    ? 'bg-accent-500 text-white cursor-default' 
                    : 'bg-primary-600 text-white hover:bg-primary-500'
                }`}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAPISection = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Exchange API Keys</h3>
        <div className="space-y-4">
          {connectedExchanges.map((exchange, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-primary-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-400">
                    {exchange.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{exchange.name}</p>
                  <p className="text-sm text-primary-400">{exchange.permissions}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  exchange.status === 'connected' 
                    ? 'bg-success-500/20 text-success-400'
                    : exchange.status === 'error'
                    ? 'bg-danger-500/20 text-danger-400'
                    : 'bg-primary-500/20 text-primary-400'
                }`}>
                  {exchange.status}
                </span>
                <button className="btn-secondary text-sm">
                  {exchange.status === 'connected' ? 'Manage' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-primary mt-4">Add New Exchange</button>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-primary-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
                <p className="text-sm text-primary-400">
                  {key === 'tradingAlerts' && 'Get notified about trade executions and order updates'}
                  {key === 'priceAlerts' && 'Receive alerts when prices reach your specified levels'}
                  {key === 'slippageAlerts' && 'Notifications when slippage exceeds your threshold'}
                  {key === 'systemUpdates' && 'Important system updates and maintenance notices'}
                </p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  value ? 'bg-accent-500' : 'bg-primary-600'
                }`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAISection = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-6">AI Optimization Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-primary-700/30 rounded-lg">
            <div>
              <p className="text-white font-medium">Auto-Execute Recommendations</p>
              <p className="text-sm text-primary-400">Automatically execute AI-optimized trades</p>
            </div>
            <button
              onClick={() => setAiSettings(prev => ({ ...prev, autoExecution: !prev.autoExecution }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                aiSettings.autoExecution ? 'bg-accent-500' : 'bg-primary-600'
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                aiSettings.autoExecution ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">Risk Level</label>
            <select 
              value={aiSettings.riskLevel}
              onChange={(e) => setAiSettings(prev => ({ ...prev, riskLevel: e.target.value }))}
              className="w-full bg-primary-700/50 border border-primary-600 rounded-lg px-3 py-2 text-white focus:border-accent-500 focus:outline-none"
            >
              <option value="conservative">Conservative</option>
              <option value="medium">Medium</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">
              Maximum Slippage Tolerance: {aiSettings.maxSlippage}%
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={aiSettings.maxSlippage}
              onChange={(e) => setAiSettings(prev => ({ ...prev, maxSlippage: e.target.value }))}
              className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">
              Minimum AI Confidence: {aiSettings.minConfidence}%
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={aiSettings.minConfidence}
              onChange={(e) => setAiSettings(prev => ({ ...prev, minConfidence: e.target.value }))}
              className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
        <button className="btn-primary mt-6">Save AI Settings</button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection()
      case 'subscription':
        return renderSubscriptionSection()
      case 'api':
        return renderAPISection()
      case 'notifications':
        return renderNotificationsSection()
      case 'ai':
        return renderAISection()
      case 'security':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Security Settings</h3>
            <div className="space-y-4">
              <p className="text-primary-400">Two-factor authentication, password management, and security logs.</p>
              <button className="btn-primary">Enable 2FA</button>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Analytics Preferences</h3>
            <div className="space-y-4">
              <p className="text-primary-400">Customize your analytics dashboard and reporting preferences.</p>
              <button className="btn-primary">Configure Dashboard</button>
            </div>
          </div>
        )
      default:
        return renderProfileSection()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Settings Navigation */}
      <div className="lg:col-span-1">
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
          <nav className="space-y-1">
            {settingSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                      : 'text-primary-300 hover:text-white hover:bg-primary-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="lg:col-span-3">
        {renderContent()}
      </div>
    </div>
  )
}

export default Settings