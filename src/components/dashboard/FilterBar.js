import React from 'react';
import { 
  Filter, 
  Download, 
  FileText, 
  FileDown,
  Calendar,
  Smartphone,
  MapPin,
  RefreshCw
} from 'lucide-react';

const FilterBar = ({ filters, filterOptions, onFilterChange, onExport, isLoading }) => {
  return (
    <div className="card mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date Range Filter */}
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
              className="input-field text-sm min-w-[140px]"
            >
              {filterOptions.dateRanges.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Device Type Filter */}
          <div className="flex items-center space-x-2">
            <Smartphone size={16} className="text-gray-500" />
            <select
              value={filters.deviceType}
              onChange={(e) => onFilterChange('deviceType', e.target.value)}
              className="input-field text-sm min-w-[140px]"
            >
              {filterOptions.deviceTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-gray-500" />
            <select
              value={filters.location}
              onChange={(e) => onFilterChange('location', e.target.value)}
              className="input-field text-sm min-w-[140px]"
            >
              {filterOptions.locations.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export and Actions */}
        <div className="flex items-center space-x-3">
          {/* Export Dropdown */}
          <div className="relative group">
            <button
              disabled={isLoading}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => onExport('csv')}
                  disabled={isLoading}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <FileText size={16} className="mr-2" />
                  Export as CSV
                </button>
                <button
                  onClick={() => onExport('pdf')}
                  disabled={isLoading}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <FileDown size={16} className="mr-2" />
                  Export as PDF
                </button>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            disabled={isLoading}
            className="btn-secondary p-2 disabled:opacity-50"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Filter size={14} />
          <span>Active Filters:</span>
          <div className="flex flex-wrap gap-2">
            {filters.dateRange !== '30d' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filterOptions.dateRanges.find(f => f.value === filters.dateRange)?.label}
                <button
                  onClick={() => onFilterChange('dateRange', '30d')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.deviceType !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {filterOptions.deviceTypes.find(f => f.value === filters.deviceType)?.label}
                <button
                  onClick={() => onFilterChange('deviceType', 'all')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.location !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {filterOptions.locations.find(f => f.value === filters.location)?.label}
                <button
                  onClick={() => onFilterChange('location', 'all')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          {(filters.dateRange !== '30d' || filters.deviceType !== 'all' || filters.location !== 'all') && (
            <button
              onClick={() => {
                onFilterChange('dateRange', '30d');
                onFilterChange('deviceType', 'all');
                onFilterChange('location', 'all');
              }}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-blue-800">
            <RefreshCw size={16} className="animate-spin mr-2" />
            <span className="text-sm">Processing export...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
