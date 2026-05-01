const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/buses');
const bookingRoutes = require('./routes/bookings');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payment');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://pharmacy-management-system-78if.vercel.app'
  ],
  credentials: true
}));app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bus Booking API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('─── Environment check ───────────────────');
  console.log('JWT_SECRET       →', process.env.JWT_SECRET        ? '✅' : '❌ MISSING');
  console.log('ADMIN_SECRET_KEY →', process.env.ADMIN_SECRET_KEY  ? '✅' : '❌ MISSING');
  console.log('MONGODB_URI      →', process.env.MONGODB_URI       ? '✅' : '⚠️  using localhost default');
  console.log('GROQ_API_KEY     →', process.env.GROQ_API_KEY      ? '✅' : '⚠️  chat will not work');
  console.log('─────────────────────────────────────────');
});