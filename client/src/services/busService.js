import api from './api';

export const busService = {
  // Search buses by route
  searchBuses: async (from, to, date, time) => {
    const params = new URLSearchParams({ from, to });
    if (date) params.append('date', date);
    if (time) params.append('time', time);
    const response = await api.get(`/buses/search?${params}`);
    return response.data;
  },

  // Get all buses
  getAllBuses: async () => {
    const response = await api.get('/buses');
    return response.data;
  },

  // Get bus by ID
  getBusById: async (id) => {
    const response = await api.get(`/buses/${id}`);
    return response.data;
  },

  // Get booked seats for a bus
  getBookedSeats: async (busId, date, time) => {
    const response = await api.get(`/buses/${busId}/seats?date=${date}&time=${time}`);
    return response.data;
  },

  // Get all locations
  getLocations: async () => {
    const response = await api.get('/buses/locations/all');
    return response.data;
  }
};

export default busService;
