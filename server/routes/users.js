import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        ecoBalance: user.ecoBalance,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('ecoBalance');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance: user.ecoBalance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Link wallet address to user
router.post('/link-wallet', authenticateToken, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }
    
    // Update user
    await User.findByIdAndUpdate(req.user.userId, {
      walletAddress: walletAddress.toLowerCase(),
      blockchainEnabled: true
    });
    
    res.json({
      message: 'Wallet linked successfully',
      walletAddress
    });
  } catch (error) {
    console.error('Link wallet error:', error);
    res.status(500).json({ error: 'Failed to link wallet' });
  }
});

export default router;
