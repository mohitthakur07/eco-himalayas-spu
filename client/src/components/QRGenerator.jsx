import { useState } from 'react';
import { X, Download, Sparkles } from 'lucide-react';
import { qrService } from '../services/qrService';
import { authService } from '../services/authService';

const QRGenerator = ({ onClose, onGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!authService.isAuthenticated()) {
      setError('Please login to generate QR codes');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate random waste type and weight for variety
      const wasteTypes = ['plastic', 'paper', 'glass', 'metal', 'organic'];
      const randomWasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
      const randomWeight = (Math.random() * 4 + 1).toFixed(1); // 1.0 to 5.0 kg
      
      const result = await qrService.generateQR(randomWasteType, parseFloat(randomWeight));
      setQrCode(result.qrCode);
      if (onGenerated) onGenerated(result.qrCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode.qrCodeImage;
    link.download = `eco-qr-${qrCode.id}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
            <Sparkles size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate QR Code</h2>
          <p className="text-sm text-gray-500">Get instant eco-coins reward!</p>
        </div>

        {!qrCode ? (
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Random Reward</h3>
              <p className="text-sm text-gray-600 mb-4">Generate a QR code and get a surprise reward when validated!</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                <Sparkles size={16} />
                <span>5 - 60 eco-coins</span>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}

            <button 
              type="submit" 
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
            
            <p className="text-xs text-center text-gray-500">
              Each QR code is unique and can only be used once
            </p>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 flex items-center justify-center">
              <img src={qrCode.qrCodeImage} alt="QR Code" className="w-48 h-48" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">QR Code ID:</span>
                <strong className="text-sm font-semibold text-gray-900">{qrCode.qrData}</strong>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Potential Reward:</span>
                <strong className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                  <Sparkles size={16} />
                  {qrCode.estimatedReward} coins
                </strong>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Status:</span>
                <strong className="text-sm font-semibold text-blue-600 uppercase">{qrCode.status}</strong>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={downloadQR} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={20} />
                Download
              </button>
              <button 
                onClick={onClose} 
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 bg-blue-50 px-4 py-3 rounded-xl">
              💡 Show this QR code at any Eco Himalayas collection station to receive your reward!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;
