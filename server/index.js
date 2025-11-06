import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './database/init.js';
import authRoutes from './routes/auth.js';
import qrRoutes from './routes/qr.js';
import rewardRoutes from './routes/rewards.js';
import deviceRoutes from './routes/devices.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling for malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.message);
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next();
});

// Connect to Database
connectDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Eco Himalayas API is running' });
});

app.listen(PORT, () => {
  console.log(`🌲 Eco Himalayas Server running on port ${PORT}`);
});
