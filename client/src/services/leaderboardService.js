import { API_ENDPOINTS, getAuthHeader } from '../config/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const leaderboardService = {
  // Get global leaderboard (all users)
  async getGlobalLeaderboard() {
    const response = await fetch(`${API_BASE}/api/leaderboard/global`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch global leaderboard');
    }
    
    return await response.json();
  },

  // Get state-wise leaderboard
  async getStateLeaderboard(state = 'Himachal Pradesh') {
    const response = await fetch(`${API_BASE}/api/leaderboard/state/${encodeURIComponent(state)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch state leaderboard');
    }
    
    return await response.json();
  },

  // Get district-wise leaderboard
  async getDistrictLeaderboard(district) {
    const response = await fetch(`${API_BASE}/api/leaderboard/district/${encodeURIComponent(district)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch district leaderboard');
    }
    
    return await response.json();
  },

  // Get all districts list
  async getDistricts() {
    const response = await fetch(`${API_BASE}/api/leaderboard/districts`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch districts');
    }
    
    return await response.json();
  },

  // Get leaderboard stats
  async getStats() {
    const response = await fetch(`${API_BASE}/api/leaderboard/stats`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch stats');
    }
    
    return await response.json();
  },
};
