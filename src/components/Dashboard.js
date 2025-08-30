import React, { useState, useEffect } from 'react';
import StatCards from './dashboard/StatCards';
import ScanChart from './dashboard/ScanChart';
import DeviceChart from './dashboard/DeviceChart';
import QRTable from './dashboard/QRTable';
import FilterBar from './dashboard/FilterBar';
import { 
  overviewStats, 
  timeSeriesData, 
  deviceData, 
  qrCodesData,
  filterOptions,
  realTimeEvents 
} from '../data/mockData';

const Dashboard = () => {
  const [filters, setFilters] = useState({
    dateRange: '30d',
    deviceType: 'all',
    location: 'all'
  });

  const [data, setData] = useState({
    overview: overviewStats,
    timeSeries: timeSeriesData,
    devices: deviceData,
    qrCodes: qrCodesData,
    realTime: realTimeEvents
  });

  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new scan events
      const newEvent = {
        id: Date.now(),
        qrCode: qrCodesData[Math.floor(Math.random() * qrCodesData.length)].name,
        device: ['iPhone', 'Android', 'iPad', 'Desktop'][Math.floor(Math.random() * 4)],
        location: ['New York, US', 'London, UK', 'Berlin, DE', 'Toronto, CA', 'Paris, FR'][Math.floor(Math.random() * 5)],
        time: 'Just now'
      };

      setData(prev => ({
        ...prev,
        realTime: [newEvent, ...prev.realTime.slice(0, 4)]
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter data based on selected filters
  const getFilteredData = () => {
    let filteredQRCodes = [...data.qrCodes];
    let filteredTimeSeries = [...data.timeSeries];

    // Apply date range filter
    if (filters.dateRange !== '30d') {
      const days = parseInt(filters.dateRange);
      filteredTimeSeries = filteredTimeSeries.slice(-days);
    }

    // Apply device type filter
    if (filters.deviceType !== 'all') {
      // In a real app, you would filter based on actual device data
      // For now, we'll just return the original data
    }

    // Apply location filter
    if (filters.location !== 'all') {
      // In a real app, you would filter based on actual location data
      // For now, we'll just return the original data
    }

    return {
      ...data,
      qrCodes: filteredQRCodes,
      timeSeries: filteredTimeSeries
    };
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleExport = (format) => {
    setIsLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `qr-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'csv') {
        const csvContent = generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        link.href = URL.createObjectURL(blob);
      } else {
        // PDF export would be handled by jsPDF
        link.href = '#';
      }
      
      link.click();
      setIsLoading(false);
    }, 1000);
  };

  const generateCSV = () => {
    const headers = ['QR Code Name', 'Type', 'Total Scans', 'Unique Users', 'Conversion Rate', 'Last Scan'];
    const rows = data.qrCodes.map(qr => [
      qr.name,
      qr.type,
      qr.totalScans,
      qr.uniqueUsers,
      `${(qr.conversionRate * 100).toFixed(1)}%`,
      new Date(qr.lastScan).toLocaleDateString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            QR Code Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track and analyze your QR code performance in real-time
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          isLoading={isLoading}
        />

        {/* Overview Stats */}
        <div className="mb-8">
          <StatCards stats={filteredData.overview} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <ScanChart data={filteredData.timeSeries} />
          </div>
          <div className="card">
            <DeviceChart data={filteredData.devices} />
          </div>
        </div>

        {/* QR Codes Table */}
        <div className="card">
          <QRTable 
            data={filteredData.qrCodes}
            realTimeEvents={filteredData.realTime}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
