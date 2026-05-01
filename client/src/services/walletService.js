import api from './api';

const walletService = {
  createTopupRequest: async (payload) => {
    const response = await api.post('/wallet/topup-request', payload);
    return response.data;
  },
  getMyTopupRequests: async () => {
    const response = await api.get('/wallet/my-topup-requests');
    return response.data;
  },
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },
  getAllTopupRequests: async () => {
    const response = await api.get('/wallet/admin/topup-requests');
    return response.data;
  },
  reviewTopupRequest: async (requestId, payload) => {
    const response = await api.put(`/wallet/admin/topup-requests/${requestId}`, payload);
    return response.data;
  }
};

export default walletService;
