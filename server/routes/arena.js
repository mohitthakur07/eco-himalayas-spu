import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import ArenaSession from '../models/ArenaSession.js';
import User from '../models/User.js';
import QRCodeModel from '../models/QRCode.js';
import { authenticateToken, authenticateDevice } from '../middleware/auth.js';
import { simpleBlockchain } from '../services/simpleBlockchain.js';

const router = express.Router();

// ===== RASPBERRY PI: Scan QR and Start Arena Session =====
router.post('/scan-qr', authenticateDevice, async (req, res) => {
  try {
    const { qrData, location } = req.body;
    const deviceId = req.device.deviceId;
    const io = req.app.get('io');

    if (!qrData) {
      return res.status(400).json({ error: 'QR data is required' });
    }

    // Parse QR data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }

    const { qrId, token } = parsedData;

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT verified:', decoded);
    } catch (error) {
      console.error('❌ JWT verification failed:', error.message);
      console.error('   Token:', token.substring(0, 50) + '...');
      console.error('   JWT_SECRET exists:', !!process.env.JWT_SECRET);
      return res.status(401).json({ error: 'Invalid or expired QR code' });
    }

    // Validate token type and match
    if (decoded.type !== 'arena-entry' || decoded.qrId !== qrId) {
      return res.status(401).json({ error: 'Invalid QR code' });
    }

    const userId = decoded.userId;

    // Check if QR code exists and is unused
    const qrCode = await QRCodeModel.findOne({ qrData: qrId });
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    if (qrCode.status !== 'pending') {
      return res.status(400).json({ error: 'QR code already used' });
    }

    // Check if user already has an active session
    const existingSession = await ArenaSession.findActiveSession(userId);
    if (existingSession) {
      return res.status(400).json({ 
        error: 'User already has an active arena session',
        sessionId: existingSession._id
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create arena session (10 minutes)
    const sessionToken = uuidv4();
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 10 * 60 * 1000); // 10 minutes

    const arenaSession = new ArenaSession({
      userId: userId,
      qrCodeId: qrId,
      sessionToken: sessionToken,
      startTime: startTime,
      endTime: endTime,
      status: 'active',
      location: location,
      deviceId: deviceId,
    });

    await arenaSession.save();

    // Mark QR code as used
    qrCode.status = 'validated';
    qrCode.validatedAt = new Date();
    await qrCode.save();

    console.log(`\n🎮 Arena session started!`);
    console.log(`   User: ${user.username} (${user.email})`);
    console.log(`   Session ID: ${arenaSession._id}`);
    console.log(`   Duration: 10 minutes`);
    console.log(`   Expires at: ${endTime.toISOString()}`);

    // Emit WebSocket event to user
    const roomName = `arena-${userId}`;
    io.to(roomName).emit('arena-started', {
      sessionId: arenaSession._id,
      sessionToken: sessionToken,
      startTime: startTime,
      endTime: endTime,
      duration: 600,
    });

    res.json({
      message: 'Arena session started successfully',
      session: {
        sessionId: arenaSession._id,
        sessionToken: sessionToken,
        userId: userId,
        username: user.username,
        startTime: startTime,
        endTime: endTime,
        duration: 600, // seconds
      }
    });

  } catch (error) {
    console.error('Arena scan error:', error);
    res.status(500).json({ error: 'Failed to start arena session' });
  }
});

// ===== ESP32: Submit Garbage Deposit =====
router.post('/deposit', authenticateDevice, async (req, res) => {
  try {
    const { sessionToken, esp32DeviceId } = req.body;
    const io = req.app.get('io');

    if (!sessionToken) {
      return res.status(400).json({ error: 'Session token is required' });
    }

    // Find active session by token
    const session = await ArenaSession.findOne({
      sessionToken: sessionToken,
      status: 'active',
    });

    if (!session) {
      return res.status(404).json({ error: 'No active arena session found' });
    }

    // Check if session is still valid
    if (!session.canAcceptReward()) {
      session.status = 'expired';
      await session.save();
      return res.status(400).json({ error: 'Arena session expired or reward limit reached' });
    }

    // Generate random reward (5-20 coins per deposit, max 100 per session)
    const remainingReward = 100 - session.totalRewards;
    const maxRewardThisDeposit = Math.min(20, remainingReward);
    const reward = Math.floor(Math.random() * (maxRewardThisDeposit - 5 + 1)) + 5;

    // Add deposit to session
    session.deposits.push({
      timestamp: new Date(),
      reward: reward,
      esp32DeviceId: esp32DeviceId || 'unknown',
    });
    session.depositCount += 1;
    session.totalRewards += reward;

    await session.save();

    // Update user balance and total earned
    const user = await User.findById(session.userId);
    if (user) {
      user.ecoBalance += reward;
      user.totalEarned += reward;  // Track lifetime earnings
      await user.save();

      // Create transaction record
      const transaction = new Transaction({
        userId: session.userId,
        qrCodeId: session.qrCodeId,
        amount: reward,
        type: 'arena_deposit',
        metadata: {
          arenaSessionId: session._id,
          depositNumber: session.depositCount,
          esp32DeviceId: esp32DeviceId
        }
      });
      await transaction.save();

      // All eco-coins stored in app - user can transfer to wallet later
      if (user.walletAddress && user.blockchainEnabled) {
        console.log(`💚 Eco-coins stored in app - User can transfer to wallet anytime`);
      } else {
        console.log(`💚 Eco-coins stored in app - Connect wallet to enable crypto transfer`);
      }
    }

    console.log(`\n🗑️  Garbage deposit recorded!`);
    console.log(`   Session: ${session._id}`);
    console.log(`   Deposit #${session.depositCount}`);
    console.log(`   Reward: +${reward} coins`);
    console.log(`   Total: ${session.totalRewards}/100 coins`);
    console.log(`   Remaining time: ${Math.ceil((session.endTime - new Date()) / 1000)}s`);

    // Emit WebSocket event to user in real-time
    const roomName = `arena-${session.userId}`;
    io.to(roomName).emit('deposit-recorded', {
      depositNumber: session.depositCount,
      reward: reward,
      totalRewards: session.totalRewards,
      remainingRewards: 100 - session.totalRewards,
      remainingTime: Math.ceil((session.endTime - new Date()) / 1000),
      timestamp: new Date(),
    });

    res.json({
      message: 'Deposit recorded successfully',
      deposit: {
        depositNumber: session.depositCount,
        reward: reward,
        totalRewards: session.totalRewards,
        remainingRewards: 100 - session.totalRewards,
        remainingTime: Math.ceil((session.endTime - new Date()) / 1000),
      }
    });

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Failed to record deposit' });
  }
});

// ===== FRONTEND: Get Active Session Status =====
router.get('/session', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const session = await ArenaSession.findActiveSession(userId);

    if (!session) {
      return res.json({ 
        hasActiveSession: false,
        session: null 
      });
    }

    // Check if session expired
    if (session.endTime < new Date()) {
      session.status = 'expired';
      await session.save();
      return res.json({ 
        hasActiveSession: false,
        session: null 
      });
    }

    res.json({
      hasActiveSession: true,
      session: {
        sessionId: session._id,
        sessionToken: session.sessionToken,
        startTime: session.startTime,
        endTime: session.endTime,
        remainingTime: Math.ceil((session.endTime - new Date()) / 1000),
        totalRewards: session.totalRewards,
        depositCount: session.depositCount,
        status: session.status,
        deposits: session.deposits,
      }
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// ===== FRONTEND: Exit Arena Session =====
router.post('/exit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const session = await ArenaSession.findActiveSession(userId);

    if (!session) {
      return res.status(404).json({ error: 'No active session found' });
    }

    session.status = 'exited';
    await session.save();

    console.log(`\n🚪 User exited arena session`);
    console.log(`   Session: ${session._id}`);
    console.log(`   Total rewards: ${session.totalRewards} coins`);
    console.log(`   Deposits: ${session.depositCount}`);

    res.json({
      message: 'Arena session ended',
      summary: {
        totalRewards: session.totalRewards,
        depositCount: session.depositCount,
        duration: Math.ceil((new Date() - session.startTime) / 1000),
      }
    });

  } catch (error) {
    console.error('Exit session error:', error);
    res.status(500).json({ error: 'Failed to exit session' });
  }
});

// ===== USER: Transfer Eco-Coins to Crypto Wallet =====
router.post('/transfer-to-wallet', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body; // Optional: specify amount, default = all

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if wallet is connected
    if (!user.walletAddress) {
      return res.status(400).json({ 
        error: 'No wallet connected',
        message: 'Please connect your MetaMask wallet first'
      });
    }

    if (!user.blockchainEnabled) {
      return res.status(400).json({ 
        error: 'Blockchain not enabled',
        message: 'Please enable blockchain in your settings'
      });
    }

    // Check if blockchain is enabled in system
    if (process.env.BLOCKCHAIN_ENABLED !== 'true') {
      return res.status(503).json({ 
        error: 'Blockchain service unavailable',
        message: 'Please try again later'
      });
    }

    // Determine transfer amount
    const transferAmount = amount && amount > 0 ? Math.min(amount, user.ecoBalance) : user.ecoBalance;

    if (transferAmount <= 0) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        message: 'You need eco-coins to transfer to your wallet',
        currentBalance: user.ecoBalance
      });
    }

    console.log(`\n💎 TRANSFER TO WALLET REQUEST`);
    console.log(`   User: ${user.username}`);
    console.log(`   Wallet: ${user.walletAddress}`);
    console.log(`   Amount: ${transferAmount} eco-coins`);
    console.log(`   Current Balance: ${user.ecoBalance} eco-coins`);

    // Send blockchain transaction
    const result = await simpleBlockchain.sendRewardToUser(user.walletAddress, transferAmount);

    if (!result.success) {
      console.log('❌ Transfer failed:', result.error);
      return res.status(500).json({ 
        error: 'Transfer failed',
        message: result.error
      });
    }

    // Success! Deduct from user balance
    user.ecoBalance -= transferAmount;
    user.totalRedeemed += transferAmount; // Track as redemption
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: userId,
      amount: transferAmount,
      type: 'wallet_transfer',
      blockchainRewardTxHash: result.transactionHash,
      blockchainVerified: true,
      metadata: {
        walletAddress: user.walletAddress,
        polAmount: result.amount,
        explorerUrl: result.explorerUrl
      }
    });
    await transaction.save();

    console.log('✅ TRANSFER COMPLETE!');
    console.log(`   TX Hash: ${result.transactionHash}`);
    console.log(`   POL Sent: ${result.amount}`);
    console.log(`   New Balance: ${user.ecoBalance} eco-coins`);
    console.log(`   Explorer: ${result.explorerUrl}`);

    res.json({
      success: true,
      message: 'Eco-coins transferred to your wallet!',
      transaction: {
        amount: transferAmount,
        polAmount: result.amount,
        transactionHash: result.transactionHash,
        explorerUrl: result.explorerUrl,
        newBalance: user.ecoBalance
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ 
      error: 'Transfer failed',
      message: error.message
    });
  }
});

export default router;

