import React, { useState } from 'react'
import { Check, Crown, Zap } from 'lucide-react'

export function Settings({ subscriptionTier, setSubscriptionTier }) {
  const [activeTab, setActiveTab] = useState('subscription')
  
  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$29',
      period: 'month',
      features: [
        'Multi-exchange data aggregation',
        'Basic liquidity routing',
        'Up to 100 trades/month',
        'Email support',
        'Basic analytics'
      ],
      limitations: [
        'No AI predictions',
        'No advanced analytics',
        'Limited exchange connections'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$79',
      period: 'month',
      popular: true,
      features: [
        'Everything in Basic',
        'AI-powered slippage minimization',
        'Predictive order sizing',
        'Up to 1,000 trades/month',
        'Priority support',
        'Advanced analytics',
        'Custom alerts'
      ],
      limitations: [
        'Limited risk analysis',
        'Standard execution speed'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$199',
      period: 'month',
      features: [
        'Everything in Pro',
        'Unlimited trades',
        'Advanced risk analysis',
        'Portfolio optimization',
        'Real-time market insights',
        'White-glove support',
        'Custom integrations',
        'Priority execution'
      ],
      limitations: []
    }
  ]

  const handleUpgrade = (planId) => {
    setSubscriptionTier(planId)
    alert(`Upgraded to ${planId} plan!`)
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="card p-6">
        <div className="flex space-x-4 border-b border-gray-200">
          {['subscription', 'exchanges', 'preferences'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Subscription Management */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600">Unlock advanced AI features and maximize your trading potential</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`card-elevated p-6 relative ${
                  subscriptionTier === plan.id ? 'ring-2 ring-blue-500' : ''
                } ${plan.popular ? 'transform scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-accent text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    {plan.id === 'premium' && <Crown className="w-6 h-6 text-yellow-500 mr-2" />}
                    {plan.id === 'pro' && <Zap className="w-6 h-6 text-purple-500 mr-2" />}
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={subscriptionTier === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    subscriptionTier === plan.id
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'btn-primary hover:opacity-90'
                  }`}
                >
                  {subscriptionTier === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exchange Settings */}
      {activeTab === 'exchanges' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Exchanges</h3>
          <div className="space-y-4">
            {['Binance', 'Coinbase Pro', 'Kraken', 'Bitfinex', 'KuCoin'].map((exchange, index) => (
              <div key={exchange} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index < 3 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="font-medium">{exchange}</span>
                </div>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  index < 3 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}>
                  {index < 3 ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Auto-execute trades</label>
                  <p className="text-sm text-gray-600">Automatically execute trades based on AI recommendations</p>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Risk alerts</label>
                  <p className="text-sm text-gray-600">Receive notifications for high-risk trades</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Email reports</label>
                  <p className="text-sm text-gray-600">Weekly performance and analytics reports</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Management</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum trade size</label>
                <input
                  type="number"
                  placeholder="$10,000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum slippage tolerance</label>
                <input
                  type="number"
                  placeholder="0.5%"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}