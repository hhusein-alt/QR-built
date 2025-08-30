import React, { useRef } from 'react';
import { Palette, Image, Settings } from 'lucide-react';

const StyleCustomizer = ({ style, setStyle }) => {
  const fileInputRef = useRef(null);

  const handleStyleChange = (field, value) => {
    setStyle(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setStyle(prev => ({
          ...prev,
          logo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setStyle(prev => ({
      ...prev,
      logo: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const presetColors = [
    { name: 'Classic', foreground: '#000000', background: '#FFFFFF' },
    { name: 'Blue', foreground: '#1E40AF', background: '#FFFFFF' },
    { name: 'Green', foreground: '#059669', background: '#FFFFFF' },
    { name: 'Purple', foreground: '#7C3AED', background: '#FFFFFF' },
    { name: 'Red', foreground: '#DC2626', background: '#FFFFFF' },
    { name: 'Dark', foreground: '#FFFFFF', background: '#1F2937' },
    { name: 'Inverted', foreground: '#FFFFFF', background: '#000000' },
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Settings className="mr-2" size={20} />
        Customize Style
      </h2>

      {/* Size Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          QR Code Size: {style.size}px
        </label>
        <input
          type="range"
          min="128"
          max="512"
          step="32"
          value={style.size}
          onChange={(e) => handleStyleChange('size', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>128px</span>
          <span>512px</span>
        </div>
      </div>

      {/* Color Presets */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Palette className="mr-2" size={16} />
          Color Presets
        </label>
        <div className="grid grid-cols-4 gap-2">
          {presetColors.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                handleStyleChange('foreground', preset.foreground);
                handleStyleChange('background', preset.background);
              }}
              className="p-2 rounded-lg border-2 hover:border-primary-500 transition-colors"
              style={{
                borderColor: 
                  style.foreground === preset.foreground && 
                  style.background === preset.background 
                    ? '#3B82F6' 
                    : '#E5E7EB'
              }}
            >
              <div
                className="w-full h-8 rounded border"
                style={{
                  background: `linear-gradient(45deg, ${preset.foreground} 25%, transparent 25%), linear-gradient(-45deg, ${preset.foreground} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${preset.foreground} 75%), linear-gradient(-45deg, transparent 75%, ${preset.foreground} 75%)`,
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                  backgroundColor: preset.background
                }}
              />
              <span className="text-xs mt-1 block text-gray-600">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Custom Colors
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Foreground</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={style.foreground}
                onChange={(e) => handleStyleChange('foreground', e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={style.foreground}
                onChange={(e) => handleStyleChange('foreground', e.target.value)}
                className="flex-1 input-field text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Background</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={style.background}
                onChange={(e) => handleStyleChange('background', e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={style.background}
                onChange={(e) => handleStyleChange('background', e.target.value)}
                className="flex-1 input-field text-sm"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Correction Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Error Correction Level
        </label>
        <select
          value={style.errorCorrectionLevel}
          onChange={(e) => handleStyleChange('errorCorrectionLevel', e.target.value)}
          className="input-field"
        >
          <option value="L">Low (7%)</option>
          <option value="M">Medium (15%)</option>
          <option value="Q">Quartile (25%)</option>
          <option value="H">High (30%)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Higher levels allow for more damage/obstruction while still being scannable
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Image className="mr-2" size={16} />
          Logo (Optional)
        </label>
        
        {style.logo ? (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={style.logo}
                alt="Logo preview"
                className="w-16 h-16 object-contain border rounded-lg"
              />
              <button
                onClick={removeLogo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Logo will be centered on the QR code
            </p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-sm"
            >
              Choose Image
            </button>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG up to 2MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleCustomizer;
