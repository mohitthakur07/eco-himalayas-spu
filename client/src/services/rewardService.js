import { API_ENDPOINTS, getAuthHeader } from '../config/api';

export const rewardService = {
  async getHistory() {
    const response = await fetch(API_ENDPOINTS.REWARD_HISTORY, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch reward history');
    }

    return await response.json();
  },

  async redeemReward(amount, item) {
    const response = await fetch(API_ENDPOINTS.REDEEM_REWARD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ amount, item }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to redeem reward');
    }

    return await response.json();
  },
};
