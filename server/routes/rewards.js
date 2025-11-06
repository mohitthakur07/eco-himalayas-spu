import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get reward history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId })
      .populate('qrCodeId', 'wasteType estimatedWeight')
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch reward history' });
  }
});

// Redeem rewards
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { amount, item } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.ecoBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct balance
    user.ecoBalance -= amount;
    await user.save();

    // Create transaction
    const transaction = new Transaction({
      userId: user._id,
      amount: -amount,
      type: 'redemption'
    });
    await transaction.save();

    res.json({
      message: 'Reward redeemed successfully',
      item,
      amount,
      newBalance: user.ecoBalance
    });
  } catch (error) {
    console.error('Redemption error:', error);
    res.status(500).json({ error: 'Redemption failed' });
  }
});

export default router;
