import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './database/init.js';
import authRoutes from './routes/auth.js';
import qrRoutes from './routes/qr.js';
import rewardRoutes from './routes/rewards.js';
import deviceRoutes from './routes/devices.js';
import userRoutes from './routes/users.js';
import leaderboardRoutes from './routes/leaderboard.js';
import eventRoutes from './routes/events.js';
import arenaRoutes from './routes/arena.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Make io accessible to routes
app.set('io', io);

// Middleware - CORS configuration for mobile access
app.use(cors({
  origin: '*', // Allow all origins (for development)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-api-key']
}));
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
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/arena', arenaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Eco Himalayas API is running' });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Join arena session room
  socket.on('join-arena', (data) => {
    const { userId, sessionId } = data;
    const roomName = `arena-${userId}`;
    socket.join(roomName);
    console.log(`🎮 User ${userId} joined arena room: ${roomName}`);
    socket.emit('arena-joined', { sessionId, roomName });
  });

  // Leave arena session
  socket.on('leave-arena', (data) => {
    const { userId } = data;
    const roomName = `arena-${userId}`;
    socket.leave(roomName);
    console.log(`🚪 User ${userId} left arena room: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Export io for use in routes
export { io };

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🌲 Eco Himalayas Server running on port ${PORT}`);
  console.log(`📱 Network access: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Local access: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket ready for real-time arena sessions`);
});
