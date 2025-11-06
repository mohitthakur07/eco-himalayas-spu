import { useState } from 'react';
import { QrCode, X, Download } from 'lucide-react';
import { qrService } from '../services/qrService';
import { authService } from '../services/authService';
import './QRGenerator.css';

const QRGenerator = ({ onClose, onGenerated }) => {
  const [wasteType, setWasteType] = useState('plastic');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState(null);

  const wasteTypes = [
    { value: 'plastic', label: 'Plastic', rate: 10 },
    { value: 'paper', label: 'Paper', rate: 5 },
    { value: 'glass', label: 'Glass', rate: 8 },
    { value: 'metal', label: 'Metal', rate: 12 },
    { value: 'organic', label: 'Organic', rate: 3 },
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!authService.isAuthenticated()) {
      setError('Please login to generate QR codes');
      return;
    }

    if (!weight || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await qrService.generateQR(wasteType, parseFloat(weight));
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

  const selectedType = wasteTypes.find(t => t.value === wasteType);
  const estimatedReward = weight ? Math.round(parseFloat(weight) * selectedType.rate) : 0;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <button className="qr-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="qr-modal-header">
          <QrCode size={32} />
          <h2>Generate QR Code</h2>
          <p>Create a QR code for your waste collection</p>
        </div>

        {!qrCode ? (
          <form onSubmit={handleGenerate} className="qr-form">
            <div className="form-group">
              <label>Waste Type</label>
              <select 
                value={wasteType} 
                onChange={(e) => setWasteType(e.target.value)}
                className="form-select"
              >
                {wasteTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.rate} coins/kg)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Estimated Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight in kg"
                className="form-input"
                required
              />
            </div>

            {estimatedReward > 0 && (
              <div className="reward-estimate">
                <span>Estimated Reward:</span>
                <strong>{estimatedReward} eco-coins</strong>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn-generate"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </form>
        ) : (
          <div className="qr-result">
            <div className="qr-code-display">
              <img src={qrCode.qrCodeImage} alt="QR Code" />
            </div>

            <div className="qr-details">
              <div className="qr-detail-item">
                <span>Type:</span>
                <strong>{qrCode.wasteType}</strong>
              </div>
              <div className="qr-detail-item">
                <span>Weight:</span>
                <strong>{qrCode.estimatedWeight} kg</strong>
              </div>
              <div className="qr-detail-item">
                <span>Reward:</span>
                <strong>{qrCode.estimatedReward} coins</strong>
              </div>
              <div className="qr-detail-item">
                <span>Status:</span>
                <strong className="status-pending">{qrCode.status}</strong>
              </div>
            </div>

            <div className="qr-actions">
              <button onClick={downloadQR} className="btn-download">
                <Download size={20} />
                Download QR
              </button>
              <button onClick={onClose} className="btn-done">
                Done
              </button>
            </div>

            <p className="qr-instruction">
              Show this QR code at any Eco Himalayas collection station to receive your reward!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;
