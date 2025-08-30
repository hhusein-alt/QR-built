import React from 'react';
import { Globe, FileText, Wifi, User } from 'lucide-react';

const DataInput = ({ qrData, setQrData }) => {
  const tabs = [
    { id: 'url', label: 'URL', icon: Globe },
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'contact', label: 'Contact', icon: User }
  ];

  const handleInputChange = (field, value) => {
    setQrData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWifiChange = (field, value) => {
    setQrData(prev => ({
      ...prev,
      wifi: {
        ...prev.wifi,
        [field]: value
      }
    }));
  };

  const handleContactChange = (field, value) => {
    setQrData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">QR Code Data</h2>
      
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleInputChange('type', tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                qrData.type === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* URL Input */}
      {qrData.type === 'url' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={qrData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="https://example.com"
              className={`input-field ${
                qrData.content && !validateUrl(qrData.content)
                  ? 'border-red-500 focus:ring-red-500'
                  : ''
              }`}
            />
            {qrData.content && !validateUrl(qrData.content) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid URL</p>
            )}
          </div>
        </div>
      )}

      {/* Text Input */}
      {qrData.type === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Content
            </label>
            <textarea
              value={qrData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Enter any text you want to encode..."
              rows={4}
              className="input-field resize-none"
            />
          </div>
        </div>
      )}

      {/* WiFi Input */}
      {qrData.type === 'wifi' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network Name (SSID)
            </label>
            <input
              type="text"
              value={qrData.wifi.ssid}
              onChange={(e) => handleWifiChange('ssid', e.target.value)}
              placeholder="My WiFi Network"
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={qrData.wifi.password}
              onChange={(e) => handleWifiChange('password', e.target.value)}
              placeholder="WiFi password"
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encryption Type
            </label>
            <select
              value={qrData.wifi.encryption}
              onChange={(e) => handleWifiChange('encryption', e.target.value)}
              className="input-field"
            >
              <option value="WPA">WPA/WPA2/WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
          </div>
        </div>
      )}

      {/* Contact Input */}
      {qrData.type === 'contact' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={qrData.contact.name}
              onChange={(e) => handleContactChange('name', e.target.value)}
              placeholder="John Doe"
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={qrData.contact.phone}
              onChange={(e) => handleContactChange('phone', e.target.value)}
              placeholder="+1 234 567 8900"
              className={`input-field ${
                qrData.contact.phone && !validatePhone(qrData.contact.phone)
                  ? 'border-red-500 focus:ring-red-500'
                  : ''
              }`}
            />
            {qrData.contact.phone && !validatePhone(qrData.contact.phone) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid phone number</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={qrData.contact.email}
              onChange={(e) => handleContactChange('email', e.target.value)}
              placeholder="john@example.com"
              className={`input-field ${
                qrData.contact.email && !validateEmail(qrData.contact.email)
                  ? 'border-red-500 focus:ring-red-500'
                  : ''
              }`}
            />
            {qrData.contact.email && !validateEmail(qrData.contact.email) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <input
              type="text"
              value={qrData.contact.company}
              onChange={(e) => handleContactChange('company', e.target.value)}
              placeholder="Company Name"
              className="input-field"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DataInput;
