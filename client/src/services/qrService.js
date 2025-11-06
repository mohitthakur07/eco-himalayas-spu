import { API_ENDPOINTS, getAuthHeader } from '../config/api';

export const qrService = {
  async generateQR(wasteType, estimatedWeight) {
    const response = await fetch(API_ENDPOINTS.GENERATE_QR, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ wasteType, estimatedWeight }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate QR code');
    }

    return await response.json();
  },

  async getQRCode(id) {
    const response = await fetch(API_ENDPOINTS.GET_QR(id), {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch QR code');
    }

    return await response.json();
  },

  async getUserQRCodes(userId) {
    const response = await fetch(API_ENDPOINTS.USER_QR_CODES(userId), {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch QR codes');
    }

    return await response.json();
  },
};
