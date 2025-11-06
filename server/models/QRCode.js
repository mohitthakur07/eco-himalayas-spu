import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  qrData: {
    type: String,
    required: true,
    unique: true,
  },
  wasteType: {
    type: String,
    required: true,
    enum: ['plastic', 'paper', 'glass', 'metal', 'organic'],
  },
  estimatedWeight: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'validated', 'expired'],
    default: 'pending',
  },
  validatedAt: {
    type: Date,
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
  },
}, {
  timestamps: true,
});

export default mongoose.model('QRCode', qrCodeSchema);
