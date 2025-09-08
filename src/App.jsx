import React, { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Trading } from './components/Trading'
import { Analytics } from './components/Analytics'
import { Settings } from './components/Settings'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [subscriptionTier, setSubscriptionTier] = useState('basic')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard subscriptionTier={subscriptionTier} />
      case 'trading':
        return <Trading subscriptionTier={subscriptionTier} />
      case 'analytics':
        return <Analytics subscriptionTier={subscriptionTier} />
      case 'settings':
        return <Settings subscriptionTier={subscriptionTier} setSubscriptionTier={setSubscriptionTier} />
      default:
        return <Dashboard subscriptionTier={subscriptionTier} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="flex h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header subscriptionTier={subscriptionTier} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App