import React, { useState, useCallback, useEffect } from 'react';
import QRCode from 'qrcode';
import DataInput from './DataInput';
import StyleCustomizer from './StyleCustomizer';
import QRPreview from './QRPreview';
import DownloadButton from './DownloadButton';

const QRGenerator = () => {
  const [qrData, setQrData] = useState({
    type: 'url',
    content: '',
    wifi: {
      ssid: '',
      password: '',
      encryption: 'WPA'
    },
    contact: {
      name: '',
      phone: '',
      email: '',
      company: ''
    }
  });

  const [style, setStyle] = useState({
    size: 256,
    foreground: '#000000',
    background: '#FFFFFF',
    errorCorrectionLevel: 'M',
    logo: null
  });

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Generate QR code data string based on type
  const generateQRString = useCallback(() => {
    switch (qrData.type) {
      case 'url':
        return qrData.content;
      case 'text':
        return qrData.content;
      case 'wifi':
        if (!qrData.wifi.ssid) return '';
        const wifiString = `WIFI:S:${qrData.wifi.ssid};T:${qrData.wifi.encryption};P:${qrData.wifi.password};;`;
        return wifiString;
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
  }, [qrData]);

  // Generate QR code
  const generateQRCode = useCallback(async () => {
    const qrString = generateQRString();
    
    if (!qrString.trim()) {
      setQrCodeUrl('');
      setError('');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const options = {
        width: style.size,
        margin: 2,
        color: {
          dark: style.foreground,
          light: style.background
        },
        errorCorrectionLevel: style.errorCorrectionLevel
      };

      const url = await QRCode.toDataURL(qrString, options);
      setQrCodeUrl(url);
    } catch (err) {
      setError('Failed to generate QR code. Please check your input.');
      console.error('QR Code generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [generateQRString, style]);

  // Generate QR code when data or style changes
  useEffect(() => {
    const timeoutId = setTimeout(generateQRCode, 300);
    return () => clearTimeout(timeoutId);
  }, [generateQRCode]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input and Customization */}
        <div className="space-y-6">
          <DataInput 
            qrData={qrData} 
            setQrData={setQrData} 
          />
          <StyleCustomizer 
            style={style} 
            setStyle={setStyle} 
          />
        </div>

        {/* Right Column - Preview and Download */}
        <div className="space-y-6">
          <QRPreview 
            qrCodeUrl={qrCodeUrl}
            isGenerating={isGenerating}
            error={error}
            style={style}
          />
          <DownloadButton 
            qrCodeUrl={qrCodeUrl}
            isGenerating={isGenerating}
            qrData={qrData}
            style={style}
          />
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
