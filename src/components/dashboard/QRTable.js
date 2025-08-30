import React, { useState } from 'react';
import { 
  Table, 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal,
  Eye,
  Download,
  Edit,
  Trash2,
  Globe,
  Wifi,
  User,
  FileText
} from 'lucide-react';

const QRTable = ({ data, realTimeEvents }) => {
  const [sortField, setSortField] = useState('totalScans');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'lastScan') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter data
  const filteredData = sortedData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'URL':
        return <Globe size={16} className="text-blue-600" />;
      case 'WiFi':
        return <Wifi size={16} className="text-green-600" />;
      case 'Contact':
        return <User size={16} className="text-purple-600" />;
      case 'Text':
        return <FileText size={16} className="text-orange-600" />;
      default:
        return <Globe size={16} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === 'active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {status === 'active' ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getConversionRateColor = (rate) => {
    if (rate >= 0.8) return 'text-green-600';
    if (rate >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Table className="mr-2" size={20} />
            QR Code Performance
          </h3>
          <p className="text-sm text-gray-600">
            Individual QR code statistics and performance metrics
          </p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search QR codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Eye className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      {/* Real-time Activity */}
      {realTimeEvents && realTimeEvents.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {realTimeEvents.slice(0, 3).map((event, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-blue-800 font-medium">{event.qrCode}</span>
                <span className="text-blue-600 mx-2">•</span>
                <span className="text-blue-700">{event.device}</span>
                <span className="text-blue-600 mx-2">•</span>
                <span className="text-blue-700">{event.location}</span>
                <span className="text-blue-500 ml-auto">{event.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  QR Code Name
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? <TrendingUp size={12} className="ml-1" /> : <TrendingDown size={12} className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalScans')}
              >
                <div className="flex items-center">
                  Total Scans
                  {sortField === 'totalScans' && (
                    sortDirection === 'asc' ? <TrendingUp size={12} className="ml-1" /> : <TrendingDown size={12} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('uniqueUsers')}
              >
                <div className="flex items-center">
                  Unique Users
                  {sortField === 'uniqueUsers' && (
                    sortDirection === 'asc' ? <TrendingUp size={12} className="ml-1" /> : <TrendingDown size={12} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('conversionRate')}
              >
                <div className="flex items-center">
                  Conversion Rate
                  {sortField === 'conversionRate' && (
                    sortDirection === 'asc' ? <TrendingUp size={12} className="ml-1" /> : <TrendingDown size={12} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('lastScan')}
              >
                <div className="flex items-center">
                  Last Scan
                  {sortField === 'lastScan' && (
                    sortDirection === 'asc' ? <TrendingUp size={12} className="ml-1" /> : <TrendingDown size={12} className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.url}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.totalScans.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.uniqueUsers.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getConversionRateColor(item.conversionRate)}`}>
                    {(item.conversionRate * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.lastScan).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 p-1">
                      <Eye size={16} />
                    </button>
                    <button className="text-green-600 hover:text-green-900 p-1">
                      <Download size={16} />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 p-1">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <Table className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No QR codes found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first QR code.'}
          </p>
        </div>
      )}

      {/* Summary */}
      {filteredData.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {filteredData.length} of {data.length} QR codes
          </div>
          <div className="flex items-center space-x-4">
            <div>
              Total Scans: {filteredData.reduce((sum, item) => sum + item.totalScans, 0).toLocaleString()}
            </div>
            <div>
              Avg Conversion: {((filteredData.reduce((sum, item) => sum + item.conversionRate, 0) / filteredData.length) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRTable;
