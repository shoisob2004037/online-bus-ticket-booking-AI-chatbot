import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const paymentService = {
  // Create booking (seat reservation)
  createBooking: async (bookingData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/bookings`,
      bookingData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Pay with wallet
  payWithWallet: async (bookingId) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/bookings/pay/${bookingId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Start SSLCommerz gateway payment
  startSslCommerzPayment: async (bookingId) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/payment/ssl/init/${bookingId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Dummy direct gateway success for demo flow
  completeDummySslPayment: async (bookingId) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/payment/ssl/dummy-success/${bookingId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Get single booking details (for TicketPage and Payment page)
  getBooking: async (bookingId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/bookings/${bookingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Get current wallet balance
  getBalance: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/wallet/balance`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Get payment status
  checkPaymentStatus: async (bookingId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/payment/status/${bookingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Submit top-up request (Taka Dhukan)
  submitTopupRequest: async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/wallet/topup-request`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Get my top-up requests
  getMyTopupRequests: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/wallet/my-topup-requests`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Admin: Get all top-up requests
  getAdminTopupRequests: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/wallet/admin/topup-requests`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Admin: Review top-up request
  reviewTopupRequest: async (requestId, status) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/wallet/admin/topup-requests/${requestId}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};

export default paymentService;
