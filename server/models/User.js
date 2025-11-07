import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'ngo'],
    default: 'user',
  },
  ecoBalance: {
    type: Number,
    default: 0,
  },
  totalEarned: {
    type: Number,
    default: 0,
  },
  totalRedeemed: {
    type: Number,
    default: 0,
  },
  country: {
    type: String,
    default: 'India',
  },
  state: {
    type: String,
    default: 'Himachal Pradesh',
  },
  district: {
    type: String,
    default: 'Hamirpur',
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  walletAddress: {
    type: String,
    lowercase: true,
  },
  blockchainEnabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
