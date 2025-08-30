import React, { useState } from 'react';
import QRGenerator from './components/QRGenerator';
import Dashboard from './components/Dashboard';
import { QrCode, BarChart3 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            QR Code Platform
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Create QR codes and track their performance
          </p>
          
          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setActiveTab('generator')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'generator'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <QrCode size={18} />
                <span>QR Generator</span>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 size={18} />
                <span>Analytics Dashboard</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        {activeTab === 'generator' ? <QRGenerator /> : <Dashboard />}
      </div>
    </div>
  );
}

export default App;
