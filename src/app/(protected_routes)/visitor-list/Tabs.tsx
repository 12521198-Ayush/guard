import React from 'react'

interface Props {
  activeTab: 'PERSONAL' | 'VENDOR'
  onChange: (tab: 'PERSONAL' | 'VENDOR') => void
}

const Tabs: React.FC<Props> = ({ activeTab, onChange }) => {
  return (
    <div className="flex bg-smoke-light p-1 rounded-full shadow-inner mb-6 transition-all duration-300">
      {(['PERSONAL', 'VENDOR'] as const).map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-in-out
              ${
                isActive
                  ? 'bg-blue-200 text-blue-800 shadow-md'  // Light blue for active tab
                  : 'bg-transparent text-gray-600'  // Lighter text color for inactive
              }`}
          >
            {tab === 'PERSONAL' ? 'Guests' : 'Vendors'}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
