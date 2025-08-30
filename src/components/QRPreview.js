import React, { useRef, useEffect } from 'react';
import { QrCode, Loader2 } from 'lucide-react';

const QRPreview = ({ qrCodeUrl, isGenerating, error, style }) => {
  const canvasRef = useRef(null);

  // Add logo to QR code
  useEffect(() => {
    if (qrCodeUrl && style.logo && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Create a new image for the QR code
      const qrImage = new Image();
      qrImage.onload = () => {
        // Set canvas size
        canvas.width = style.size;
        canvas.height = style.size;
        
        // Draw QR code
        ctx.drawImage(qrImage, 0, 0, style.size, style.size);
        
        // Add logo
        const logoImage = new Image();
        logoImage.onload = () => {
          // Calculate logo size (20% of QR code size)
          const logoSize = style.size * 0.2;
          const logoX = (style.size - logoSize) / 2;
          const logoY = (style.size - logoSize) / 2;
          
          // Create circular mask for logo
          ctx.save();
          ctx.beginPath();
          ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, 2 * Math.PI);
          ctx.clip();
          
          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
          ctx.restore();
        };
        logoImage.src = style.logo;
      };
      qrImage.src = qrCodeUrl;
    }
  }, [qrCodeUrl, style.logo, style.size]);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <QrCode className="mr-2" size={20} />
        QR Code Preview
      </h2>

      <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        {isGenerating ? (
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-primary-600" size={48} />
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <QrCode className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-red-600 mb-2">Error generating QR code</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : qrCodeUrl ? (
          <div className="text-center">
            {style.logo ? (
              <canvas
                ref={canvasRef}
                className="border rounded-lg shadow-sm"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            ) : (
              <img
                src={qrCodeUrl}
                alt="Generated QR Code"
                className="border rounded-lg shadow-sm"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}
            <p className="text-sm text-gray-500 mt-3">
              Size: {style.size}px | Error Correction: {style.errorCorrectionLevel}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <QrCode className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">No QR code to display</p>
            <p className="text-sm text-gray-500">
              Enter some data to generate a QR code
            </p>
          </div>
        )}
      </div>

      {/* QR Code Information */}
      {qrCodeUrl && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">QR Code Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Dimensions:</span>
              <span className="ml-2 text-blue-900">{style.size} × {style.size}px</span>
            </div>
            <div>
              <span className="text-blue-700">Error Correction:</span>
              <span className="ml-2 text-blue-900">{style.errorCorrectionLevel}</span>
            </div>
            <div>
              <span className="text-blue-700">Foreground:</span>
              <span className="ml-2 text-blue-900">{style.foreground}</span>
            </div>
            <div>
              <span className="text-blue-700">Background:</span>
              <span className="ml-2 text-blue-900">{style.background}</span>
            </div>
            {style.logo && (
              <div className="col-span-2">
                <span className="text-blue-700">Logo:</span>
                <span className="ml-2 text-blue-900">✓ Added</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRPreview;
