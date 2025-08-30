import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Smartphone } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const DeviceChart = ({ data }) => {
  const colors = [
    'rgb(59, 130, 246)',   // Blue
    'rgb(34, 197, 94)',    // Green
    'rgb(168, 85, 247)',   // Purple
    'rgb(251, 146, 60)',   // Orange
    'rgb(239, 68, 68)'     // Red
  ];

  const chartData = {
    labels: data.map(item => item.device),
    datasets: [
      {
        data: data.map(item => item.scans),
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.8)')),
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: 2,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Calculate total scans
  const totalScans = data.reduce((sum, item) => sum + item.scans, 0);
  
  // Find top device
  const topDevice = data.reduce((max, item) => 
    item.scans > max.scans ? item : max
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Smartphone className="mr-2" size={20} />
            Device Breakdown
          </h3>
          <p className="text-sm text-gray-600">
            QR code scans by device type
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {totalScans.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Scans</div>
        </div>
      </div>

      {/* Top Device Highlight */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-blue-600 font-medium">Most Popular Device</div>
            <div className="text-xl font-bold text-blue-900">{topDevice.device}</div>
            <div className="text-sm text-blue-700">
              {topDevice.scans.toLocaleString()} scans ({topDevice.percentage}%)
            </div>
          </div>
          <div className="text-4xl text-blue-400">
            📱
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-4">
        <Pie data={chartData} options={options} />
      </div>

      {/* Device List */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: colors[index] }}
              ></div>
              <div>
                <div className="font-medium text-gray-900">{item.device}</div>
                <div className="text-sm text-gray-600">
                  {item.scans.toLocaleString()} scans
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{item.percentage}%</div>
              <div className="text-sm text-gray-600">
                {((item.scans / totalScans) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceChart;
