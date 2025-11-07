import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const authenticateDevice = (req, res, next) => {
  const apiKey = req.headers['x-device-api-key'];

  if (!apiKey) {
    console.error('❌ Device auth failed: No x-device-api-key header');
    return res.status(401).json({ error: 'Device API key required' });
  }

  if (apiKey !== process.env.DEVICE_API_KEY) {
    console.error('❌ Device auth failed: Invalid API key');
    console.error('   Expected:', process.env.DEVICE_API_KEY);
    console.error('   Received:', apiKey);
    return res.status(401).json({ error: 'Invalid device API key' });
  }

  console.log('✅ Device authenticated');
  req.device = { deviceId: 'RPI-STATION-01' };
  next();
};
