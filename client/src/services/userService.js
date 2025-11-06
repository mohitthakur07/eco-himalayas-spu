import { API_ENDPOINTS, getAuthHeader } from '../config/api';

export const userService = {
  async getProfile() {
    const response = await fetch(API_ENDPOINTS.PROFILE, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }

    return await response.json();
  },

  async getBalance() {
    const response = await fetch(API_ENDPOINTS.BALANCE, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch balance');
    }

    return await response.json();
  },
};
