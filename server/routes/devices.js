import express from 'express';
import Device from '../models/Device.js';
import { authenticateDevice } from '../middleware/auth.js';

const router = express.Router();

// Register device
router.post('/register', authenticateDevice, async (req, res) => {
  try {
    const { deviceName, location } = req.body;

    if (!deviceName) {
      return res.status(400).json({ error: 'Device name is required' });
    }

    const device = new Device({
      deviceName,
      location: location || 'Unknown',
    });

    await device.save();

    res.status(201).json({
      message: 'Device registered successfully',
      device: {
        id: device._id,
        deviceName: device.deviceName,
        location: device.location
      }
    });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ error: 'Device registration failed' });
  }
});

// Device heartbeat
router.post('/heartbeat', authenticateDevice, async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    await Device.findByIdAndUpdate(deviceId, {
      lastSeen: new Date()
    });

    res.json({ message: 'Heartbeat received' });
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: 'Heartbeat failed' });
  }
});

// List devices
router.get('/list', authenticateDevice, async (req, res) => {
  try {
    const devices = await Device.find().sort({ lastSeen: -1 });
    res.json({ devices });
  } catch (error) {
    console.error('List devices error:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

export default router;
