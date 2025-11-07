import mongoose from 'mongoose';

const arenaSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  qrCodeId: {
    type: String,
    required: true,
    unique: true,
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true,
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'exited'],
    default: 'active',
  },
  totalRewards: {
    type: Number,
    default: 0,
  },
  depositCount: {
    type: Number,
    default: 0,
  },
  deposits: [{
    timestamp: Date,
    reward: Number,
    esp32DeviceId: String,
  }],
  location: {
    latitude: Number,
    longitude: Number,
  },
  deviceId: {
    type: String, // Raspberry Pi device ID
  },
}, {
  timestamps: true,
});

// Auto-expire sessions after 10 minutes
arenaSessionSchema.index({ endTime: 1 }, { expireAfterSeconds: 600 });

// Find active session for user
arenaSessionSchema.statics.findActiveSession = async function(userId) {
  return await this.findOne({
    userId: userId,
    status: 'active',
    endTime: { $gt: new Date() }
  });
};

// Check if session can accept more rewards
arenaSessionSchema.methods.canAcceptReward = function() {
  return this.status === 'active' && 
         this.totalRewards < 100 && 
         this.endTime > new Date();
};

const ArenaSession = mongoose.model('ArenaSession', arenaSessionSchema);

export default ArenaSession;



