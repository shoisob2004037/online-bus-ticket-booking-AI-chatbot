import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const chatService = {
  // Send a message to the chatbot
  sendMessage: async (message, conversationHistory = []) => {
    try {
      const response = await api.post('/chat/message', {
        message,
        conversationHistory,
      });
      return response.data;
    } catch (error) {
      console.error('Chat service error:', error);
      
      // If error is 401 (Unauthorized), throw a specific error
      if (error.response?.status === 401) {
        throw new Error('Please login to continue chatting');
      }
      
      throw error;
    }
  },

  // Get available routes
  getAvailableRoutes: async () => {
    try {
      const response = await api.get('/chat/routes');
      return response.data.routes;
    } catch (error) {
      console.error('Routes error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to view routes');
      }
      
      throw error;
    }
  },

  // Search for buses on a specific route
  searchRoute: async (startPoint, destination) => {
    try {
      const routes = await chatService.getAvailableRoutes();
      const routeKey = `${startPoint}-${destination}`;
      return routes[routeKey] || [];
    } catch (error) {
      console.error('Search error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Please login to search buses');
      }
      
      throw error;
    }
  },
};

export default chatService;