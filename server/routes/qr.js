import express from 'express';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import QRCodeModel from '../models/QRCode.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Device from '../models/Device.js';
import { authenticateToken, authenticateDevice } from '../middleware/auth.js';
import { simpleBlockchain } from '../services/simpleBlockchain.js';

const router = express.Router();

const REWARD_RATES = {
  plastic: 10,
  paper: 5,
  glass: 8,
  metal: 12,
  organic: 3
};

// Generate QR Code
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { wasteType, estimatedWeight } = req.body;
    const userId = req.user.userId;

    if (!wasteType || !estimatedWeight) {
      return res.status(400).json({ error: 'Waste type and weight are required' });
    }

    if (!REWARD_RATES[wasteType]) {
      return res.status(400).json({ error: 'Invalid waste type' });
    }

    const qrId = uuidv4();
    const qrData = `ECO-${qrId}`;

    const qrCodeDoc = new QRCodeModel({
      userId,
      qrData,
      wasteType,
      estimatedWeight: parseFloat(estimatedWeight),
    });

    await qrCodeDoc.save();

    const qrCodeImage = await QRCode.toDataURL(qrData);

    res.status(201).json({
      message: 'QR code generated successfully',
      qrCode: {
        id: qrCodeDoc._id,
        qrData,
        qrCodeImage,
        wasteType,
        estimatedWeight,
        status: 'pending',
        estimatedReward: Math.round(estimatedWeight * REWARD_RATES[wasteType])
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get QR Code details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
});

// Get user's QR codes
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const qrCodes = await QRCodeModel.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({ qrCodes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch QR codes' });
  }
});

// Validate QR Code (Raspberry Pi endpoint)
router.post('/validate', authenticateDevice, async (req, res) => {
  try {
    const { qrData, deviceId } = req.body;

    if (!qrData || !deviceId) {
      return res.status(400).json({ error: 'QR data and device ID are required' });
    }

    const qrCode = await QRCodeModel.findOne({ qrData });

    if (!qrCode) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    if (qrCode.status === 'validated') {
      return res.status(400).json({ error: 'QR code already validated' });
    }

    // Check expiration (24 hours)
    const hoursDiff = (new Date() - qrCode.createdAt) / (1000 * 60 * 60);

    if (hoursDiff > parseInt(process.env.QR_EXPIRATION_HOURS)) {
      qrCode.status = 'expired';
      await qrCode.save();
      return res.status(400).json({ error: 'QR code has expired' });
    }

    // Calculate reward
    const reward = Math.round(qrCode.estimatedWeight * REWARD_RATES[qrCode.wasteType]);

    // Update QR code status
    qrCode.status = 'validated';
    qrCode.validatedAt = new Date();
    qrCode.validatedBy = deviceId;
    await qrCode.save();

    // Update user balance and get user data
    const user = await User.findByIdAndUpdate(
      qrCode.userId,
      { $inc: { ecoBalance: reward } },
      { new: true } // Return updated user
    );

    // Create transaction record
    const transaction = new Transaction({
      userId: qrCode.userId,
      qrCodeId: qrCode._id,
      amount: reward,
      type: 'reward'
    });
    await transaction.save();

    // Create blockchain proof
    if (process.env.BLOCKCHAIN_ENABLED === 'true' && simpleBlockchain.instance) {
      const proofData = {
        qrCode: qrData,
        userId: qrCode.userId.toString(),
        reward: reward,
        wasteType: qrCode.wasteType,
        weight: qrCode.estimatedWeight,
        timestamp: new Date().toISOString(),
        deviceId: deviceId
      };
      
      // Create hash
      const proofHash = simpleBlockchain.createProofHash(proofData);
      
      if (proofHash) {
        // Store on blockchain (async, don't wait)
        simpleBlockchain.storeProof(proofHash, proofData)
          .then(result => {
            if (result.success) {
              console.log('✅ Blockchain proof:', result.transactionHash);
              console.log('   Explorer:', result.explorerUrl);
              
              // Update transaction with blockchain proof
              Transaction.findByIdAndUpdate(transaction._id, {
                blockchainTxHash: result.transactionHash,
                blockchainProofHash: proofHash,
                blockchainVerified: true
              }).catch(err => console.error('Failed to update transaction:', err));
            } else {
              console.log('ℹ️  Blockchain proof not stored:', result.error);
            }
          })
          .catch(err => console.error('Blockchain error:', err));
      }
      
      // Send blockchain tokens to user if wallet is linked
      if (user.walletAddress && user.blockchainEnabled) {
        console.log(`\n🎁 User has wallet linked: ${user.walletAddress}`);
        
        simpleBlockchain.sendRewardToUser(user.walletAddress, reward)
          .then(rewardResult => {
            if (rewardResult.success) {
              console.log('✅ Blockchain tokens sent to user!');
              console.log('   Amount:', rewardResult.amount, 'POL');
              console.log('   TX:', rewardResult.transactionHash);
              console.log('   Explorer:', rewardResult.explorerUrl);
              
              // Optionally save reward tx hash to transaction
              Transaction.findByIdAndUpdate(transaction._id, {
                blockchainRewardTxHash: rewardResult.transactionHash
              }).catch(err => console.error('Failed to update reward tx:', err));
            } else {
              console.log('ℹ️  Blockchain tokens not sent:', rewardResult.error);
            }
          })
          .catch(err => console.error('Blockchain reward error:', err));
      } else {
        console.log('ℹ️  User has no wallet linked, skipping blockchain token transfer');
      }
    }

    // Update device last seen
    await Device.findByIdAndUpdate(deviceId, {
      lastSeen: new Date()
    });

    res.json({
      message: 'QR code validated successfully',
      reward,
      qrCode: {
        id: qrCode._id,
        wasteType: qrCode.wasteType,
        weight: qrCode.estimatedWeight
      }
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

export default router;
