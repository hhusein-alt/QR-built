// Mock data for QR Code Analytics Dashboard

// Generate random data for the last 30 days
const generateTimeSeriesData = (days = 30) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      scans: Math.floor(Math.random() * 500) + 100,
      uniqueUsers: Math.floor(Math.random() * 300) + 50,
      conversionRate: (Math.random() * 0.3 + 0.1).toFixed(2)
    });
  }
  
  return data;
};

// Device breakdown data
export const deviceData = [
  { device: 'iPhone', scans: 2847, percentage: 45.2 },
  { device: 'Android', scans: 2341, percentage: 37.1 },
  { device: 'iPad', scans: 567, percentage: 9.0 },
  { device: 'Desktop', scans: 398, percentage: 6.3 },
  { device: 'Other', scans: 157, percentage: 2.4 }
];

// Geographic data
export const geographicData = [
  { country: 'United States', scans: 2156, percentage: 34.2 },
  { country: 'United Kingdom', scans: 892, percentage: 14.1 },
  { country: 'Germany', scans: 756, percentage: 12.0 },
  { country: 'Canada', scans: 634, percentage: 10.1 },
  { country: 'France', scans: 523, percentage: 8.3 },
  { country: 'Australia', scans: 445, percentage: 7.1 },
  { country: 'Japan', scans: 398, percentage: 6.3 },
  { country: 'Other', scans: 546, percentage: 8.7 }
];

// QR Code performance data
export const qrCodesData = [
  {
    id: 1,
    name: 'Company Website',
    type: 'URL',
    url: 'https://company.com',
    totalScans: 1247,
    uniqueUsers: 892,
    conversionRate: 0.72,
    lastScan: '2024-01-15T10:30:00Z',
    status: 'active'
  },
  {
    id: 2,
    name: 'Product Catalog',
    type: 'URL',
    url: 'https://company.com/catalog',
    totalScans: 892,
    uniqueUsers: 634,
    conversionRate: 0.71,
    lastScan: '2024-01-15T09:15:00Z',
    status: 'active'
  },
  {
    id: 3,
    name: 'WiFi Network',
    type: 'WiFi',
    url: 'Office WiFi',
    totalScans: 567,
    uniqueUsers: 234,
    conversionRate: 0.41,
    lastScan: '2024-01-15T08:45:00Z',
    status: 'active'
  },
  {
    id: 4,
    name: 'Contact Info',
    type: 'Contact',
    url: 'John Doe',
    totalScans: 445,
    uniqueUsers: 398,
    conversionRate: 0.89,
    lastScan: '2024-01-15T07:20:00Z',
    status: 'active'
  },
  {
    id: 5,
    name: 'Event Registration',
    type: 'URL',
    url: 'https://event.company.com',
    totalScans: 334,
    uniqueUsers: 289,
    conversionRate: 0.87,
    lastScan: '2024-01-14T16:30:00Z',
    status: 'active'
  },
  {
    id: 6,
    name: 'Promotional Offer',
    type: 'URL',
    url: 'https://promo.company.com',
    totalScans: 289,
    uniqueUsers: 245,
    conversionRate: 0.85,
    lastScan: '2024-01-14T15:10:00Z',
    status: 'active'
  },
  {
    id: 7,
    name: 'Customer Support',
    type: 'URL',
    url: 'https://support.company.com',
    totalScans: 234,
    uniqueUsers: 198,
    conversionRate: 0.85,
    lastScan: '2024-01-14T14:25:00Z',
    status: 'active'
  },
  {
    id: 8,
    name: 'Social Media',
    type: 'URL',
    url: 'https://instagram.com/company',
    totalScans: 198,
    uniqueUsers: 167,
    conversionRate: 0.84,
    lastScan: '2024-01-14T13:40:00Z',
    status: 'active'
  }
];

// Time series data
export const timeSeriesData = generateTimeSeriesData();

// Overview statistics
export const overviewStats = {
  totalScans: 6310,
  uniqueUsers: 2856,
  scanRate: 0.73,
  topQRCode: 'Company Website',
  totalQRCodes: 8,
  activeQRCodes: 8,
  averageConversionRate: 0.76,
  todayScans: 234,
  todayUniqueUsers: 189,
  weekGrowth: 12.5,
  monthGrowth: 8.3
};

// Filter options
export const filterOptions = {
  dateRanges: [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Last year', value: '1y' }
  ],
  deviceTypes: [
    { label: 'All Devices', value: 'all' },
    { label: 'iPhone', value: 'iphone' },
    { label: 'Android', value: 'android' },
    { label: 'iPad', value: 'ipad' },
    { label: 'Desktop', value: 'desktop' },
    { label: 'Other', value: 'other' }
  ],
  locations: [
    { label: 'All Locations', value: 'all' },
    { label: 'United States', value: 'us' },
    { label: 'United Kingdom', value: 'uk' },
    { label: 'Germany', value: 'de' },
    { label: 'Canada', value: 'ca' },
    { label: 'France', value: 'fr' },
    { label: 'Australia', value: 'au' },
    { label: 'Japan', value: 'jp' }
  ]
};

// Real-time scan events (for demo purposes)
export const realTimeEvents = [
  { id: 1, qrCode: 'Company Website', device: 'iPhone', location: 'New York, US', time: '2 minutes ago' },
  { id: 2, qrCode: 'Product Catalog', device: 'Android', location: 'London, UK', time: '5 minutes ago' },
  { id: 3, qrCode: 'WiFi Network', device: 'iPad', location: 'Berlin, DE', time: '8 minutes ago' },
  { id: 4, qrCode: 'Contact Info', device: 'iPhone', location: 'Toronto, CA', time: '12 minutes ago' },
  { id: 5, qrCode: 'Event Registration', device: 'Desktop', location: 'Paris, FR', time: '15 minutes ago' }
];

export default {
  overviewStats,
  timeSeriesData,
  deviceData,
  geographicData,
  qrCodesData,
  filterOptions,
  realTimeEvents
};
