import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ArenaService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  // Connect to WebSocket
  connect() {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(API_BASE, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to arena server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from arena server');
      this.connected = false;
    });

    return this.socket;
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join arena session room
  joinArena(userId, sessionId) {
    if (!this.socket) {
      this.connect();
    }
    this.socket.emit('join-arena', { userId, sessionId });
  }

  // Leave arena session room
  leaveArena(userId) {
    if (this.socket) {
      this.socket.emit('leave-arena', { userId });
    }
  }

  // Listen for arena started event
  onArenaStarted(callback) {
    if (!this.socket) {
      this.connect();
    }
    this.socket.on('arena-started', callback);
  }

  // Listen for deposit recorded event
  onDepositRecorded(callback) {
    if (!this.socket) {
      this.connect();
    }
    this.socket.on('deposit-recorded', callback);
  }

  // Listen for arena joined confirmation
  onArenaJoined(callback) {
    if (!this.socket) {
      this.connect();
    }
    this.socket.on('arena-joined', callback);
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.off('arena-started');
      this.socket.off('deposit-recorded');
      this.socket.off('arena-joined');
    }
  }

  // Get active session from API
  async getActiveSession() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE}/api/arena/session`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get session');
    }

    return await response.json();
  }

  // Exit arena session
  async exitSession() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE}/api/arena/exit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to exit session');
    }

    return await response.json();
  }
}

export const arenaService = new ArenaService();



