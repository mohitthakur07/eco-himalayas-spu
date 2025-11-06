const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  
  // User
  PROFILE: `${API_BASE_URL}/api/users/profile`,
  BALANCE: `${API_BASE_URL}/api/users/balance`,
  
  // QR Codes
  GENERATE_QR: `${API_BASE_URL}/api/qr/generate`,
  GET_QR: (id) => `${API_BASE_URL}/api/qr/${id}`,
  USER_QR_CODES: (userId) => `${API_BASE_URL}/api/qr/user/${userId}`,
  
  // Rewards
  REWARD_HISTORY: `${API_BASE_URL}/api/rewards/history`,
  REDEEM_REWARD: `${API_BASE_URL}/api/rewards/redeem`,
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default API_BASE_URL;
