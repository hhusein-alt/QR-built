import React from 'react';
import QRCode from 'qrcode';
import { Download, FileImage, FileCode } from 'lucide-react';

const DownloadButton = ({ qrCodeUrl, isGenerating, qrData, style }) => {
  const generateFileName = (format) => {
    let baseName = 'qr-code';
    
    // Generate meaningful filename based on content
    if (qrData.type === 'url' && qrData.content) {
      try {
        const url = new URL(qrData.content);
        baseName = url.hostname.replace(/[^a-zA-Z0-9]/g, '-');
      } catch {
        baseName = 'url';
      }
    } else if (qrData.type === 'text' && qrData.content) {
      baseName = qrData.content.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '-');
    } else if (qrData.type === 'wifi' && qrData.wifi.ssid) {
      baseName = qrData.wifi.ssid.replace(/[^a-zA-Z0-9]/g, '-');
    } else if (qrData.type === 'contact' && qrData.contact.name) {
      baseName = qrData.contact.name.replace(/[^a-zA-Z0-9]/g, '-');
    }
    
    return `${baseName}.${format}`;
  };

  const downloadPNG = async () => {
    if (!qrCodeUrl) return;

    try {
      // If logo is present, use canvas data
      if (style.logo) {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.download = generateFileName('png');
          link.href = canvas.toDataURL('image/png');
          link.click();
          return;
        }
      }

      // Otherwise use the QR code URL directly
      const link = document.createElement('a');
      link.download = generateFileName('png');
      link.href = qrCodeUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading PNG:', error);
      alert('Failed to download PNG file');
    }
  };

  const downloadSVG = async () => {
    if (!qrCodeUrl) return;

    try {
      // Generate QR code as SVG
      const qrString = generateQRString();
      const svgString = await QRCode.toString(qrString, {
        type: 'svg',
        width: style.size,
        margin: 2,
        color: {
          dark: style.foreground,
          light: style.background
        },
        errorCorrectionLevel: style.errorCorrectionLevel
      });

      // Create and download SVG file
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = generateFileName('svg');
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading SVG:', error);
      alert('Failed to download SVG file');
    }
  };

  const generateQRString = () => {
    switch (qrData.type) {
      case 'url':
        return qrData.content;
      case 'text':
        return qrData.content;
      case 'wifi':
        if (!qrData.wifi.ssid) return '';
        return `WIFI:S:${qrData.wifi.ssid};T:${qrData.wifi.encryption};P:${qrData.wifi.password};;`;
      case 'contact':
        if (!qrData.contact.name) return '';
        const contactString = `BEGIN:VCARD\nVERSION:3.0\nFN:${qrData.contact.name}`;
        const phone = qrData.contact.phone ? `\nTEL:${qrData.contact.phone}` : '';
        const email = qrData.contact.email ? `\nEMAIL:${qrData.contact.email}` : '';
        const company = qrData.contact.company ? `\nORG:${qrData.contact.company}` : '';
        return contactString + phone + email + company + '\nEND:VCARD';
      default:
        return qrData.content;
    }
  };

  const hasValidData = () => {
    switch (qrData.type) {
      case 'url':
      case 'text':
        return qrData.content.trim() !== '';
      case 'wifi':
        return qrData.wifi.ssid.trim() !== '';
      case 'contact':
        return qrData.contact.name.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Download className="mr-2" size={20} />
        Download QR Code
      </h2>

      <div className="space-y-3">
        <button
          onClick={downloadPNG}
          disabled={!qrCodeUrl || isGenerating || !hasValidData()}
          className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileImage size={18} />
          <span>Download as PNG</span>
        </button>

        <button
          onClick={downloadSVG}
          disabled={!qrCodeUrl || isGenerating || !hasValidData()}
          className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileCode size={18} />
          <span>Download as SVG</span>
        </button>
      </div>

      {!hasValidData() && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please enter valid data to enable download options.
          </p>
        </div>
      )}

      {qrCodeUrl && hasValidData() && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ QR code ready for download
          </p>
          <p className="text-xs text-green-600 mt-1">
            File will be named: {generateFileName('png')}
          </p>
        </div>
      )}

      {/* Format Information */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Format Information</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <FileImage size={14} />
            <span><strong>PNG:</strong> High quality, suitable for printing and digital use</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileCode size={14} />
            <span><strong>SVG:</strong> Scalable vector format, perfect for web and design</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadButton;
