import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import QRCodeModel from '../models/QRCode.js';
import Transaction from '../models/Transaction.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create event (NGO only)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (user.role !== 'ngo') {
      return res.status(403).json({ error: 'Only NGOs can create events' });
    }

    const {
      title,
      description,
      location,
      district,
      startTime,
      endTime,
      maxParticipants,
      rewardPerParticipant,
    } = req.body;

    const event = new Event({
      title,
      description,
      ngoId: user._id,
      ngoName: user.username,
      location,
      district,
      startTime,
      endTime,
      maxParticipants: maxParticipants || 100,
      rewardPerParticipant: rewardPerParticipant || 50,
    });

    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Get all events
router.get('/all', async (req, res) => {
  try {
    const { status, district } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (district) filter.district = district;

    const events = await Event.find(filter)
      .sort({ startTime: -1 })
      .limit(50);

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get active events
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    
    const events = await Event.find({
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).sort({ startTime: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Get active events error:', error);
    res.status(500).json({ error: 'Failed to fetch active events' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Join event (user checks in with location)
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'active') {
      return res.status(400).json({ error: 'Event is not active' });
    }

    // Check if user already joined
    const alreadyJoined = event.participants.some(
      p => p.userId.toString() === req.user.userId
    );

    if (alreadyJoined) {
      return res.status(400).json({ error: 'Already joined this event' });
    }

    // Check max participants
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Verify location (within 100 meters of event location)
    const distance = calculateDistance(
      latitude,
      longitude,
      event.location.latitude,
      event.location.longitude
    );

    if (distance > 0.1) { // 0.1 km = 100 meters
      return res.status(400).json({ 
        error: 'You must be at the event location to join',
        distance: Math.round(distance * 1000) + ' meters away'
      });
    }

    const user = await User.findById(req.user.userId);

    // Add participant
    event.participants.push({
      userId: user._id,
      username: user.username,
      joinedAt: new Date(),
    });

    // Update user location
    user.location = { latitude, longitude };
    await user.save();
    await event.save();

    res.json({
      message: 'Successfully joined event',
      event,
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ error: 'Failed to join event' });
  }
});

// Validate QR at event (called by Raspberry Pi)
router.post('/:id/validate-qr', authenticateToken, async (req, res) => {
  try {
    const { qrData } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'active') {
      return res.status(400).json({ error: 'Event is not active' });
    }

    // Find QR code
    const qrCode = await QRCodeModel.findOne({ qrData });

    if (!qrCode) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    if (qrCode.status === 'validated') {
      return res.status(400).json({ error: 'QR code already used' });
    }

    // Check if user is a participant
    const participant = event.participants.find(
      p => p.userId.toString() === qrCode.userId.toString()
    );

    if (!participant) {
      return res.status(400).json({ error: 'User not registered for this event' });
    }

    // Mark QR as validated
    qrCode.status = 'validated';
    qrCode.validatedAt = new Date();
    await qrCode.save();

    // Award coins
    const reward = event.rewardPerParticipant;
    await User.findByIdAndUpdate(qrCode.userId, {
      $inc: { ecoBalance: reward }
    });

    // Update participant coins
    participant.coinsEarned += reward;
    event.totalCoinsDistributed += reward;
    await event.save();

    // Create transaction
    const transaction = new Transaction({
      userId: qrCode.userId,
      qrCodeId: qrCode._id,
      amount: reward,
      type: 'reward',
    });
    await transaction.save();

    res.json({
      message: 'QR code validated successfully',
      reward,
      participant: {
        username: participant.username,
        totalEarned: participant.coinsEarned,
      },
    });
  } catch (error) {
    console.error('Validate QR error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// Update event status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the event creator
    if (event.ngoId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    event.status = status;
    await event.save();

    res.json({
      message: 'Event status updated',
      event,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Get NGO's events
router.get('/ngo/my-events', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({ ngoId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({ events });
  } catch (error) {
    console.error('Get NGO events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

export default router;
