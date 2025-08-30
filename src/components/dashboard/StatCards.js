import React from 'react';
import { 
  QrCode, 
  Users, 
  TrendingUp, 
  Target,
  Activity,
  Globe,
  Smartphone,
  BarChart3
} from 'lucide-react';

const StatCards = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Scans',
      value: stats.totalScans.toLocaleString(),
      change: `+${stats.weekGrowth}%`,
      changeType: 'positive',
      icon: QrCode,
      color: 'blue',
      description: 'Total QR code scans'
    },
    {
      title: 'Unique Users',
      value: stats.uniqueUsers.toLocaleString(),
      change: `+${stats.monthGrowth}%`,
      changeType: 'positive',
      icon: Users,
      color: 'green',
      description: 'Unique visitors'
    },
    {
      title: 'Scan Rate',
      value: `${(stats.scanRate * 100).toFixed(1)}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: Target,
      color: 'purple',
      description: 'Conversion rate'
    },
    {
      title: 'Active QR Codes',
      value: stats.activeQRCodes,
      change: `${stats.activeQRCodes}/${stats.totalQRCodes}`,
      changeType: 'neutral',
      icon: Activity,
      color: 'orange',
      description: 'Currently active'
    },
    {
      title: 'Today\'s Scans',
      value: stats.todayScans,
      change: `+${Math.floor(Math.random() * 20) + 5}%`,
      changeType: 'positive',
      icon: TrendingUp,
      color: 'indigo',
      description: 'Scans today'
    },
    {
      title: 'Avg. Conversion',
      value: `${(stats.averageConversionRate * 100).toFixed(1)}%`,
      change: '+1.2%',
      changeType: 'positive',
      icon: BarChart3,
      color: 'pink',
      description: 'Average rate'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      pink: 'bg-pink-50 text-pink-600 border-pink-200'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg border ${getColorClasses(card.color)}`}>
                <Icon size={24} />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeColor(card.changeType)}`}>
                {card.change}
              </div>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {card.value}
              </h3>
              <p className="text-sm text-gray-600">
                {card.title}
              </p>
            </div>
            
            <p className="text-xs text-gray-500">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
