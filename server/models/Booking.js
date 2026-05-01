const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  busId: {
    type: String,
    required: true
  },
  busName: {
    type: String,
    required: true
  },
  busNumber: {
    type: String,
    required: true
  },
  startPoint: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  journeyDate: {
    type: Date,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  seats: [{
    type: String,
    required: true
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  passengerName: {
    type: String,
    required: true
  },
  passengerPhone: {
    type: String,
    required: true
  },
  passengerEmail: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  ticketNumber: {
    type: String,
    unique: true
  },
  // Wallet payment fields
  paymentMethod: {
    type: String,
    enum: ['wallet', 'sslcommerz', null],
    default: null
  },
  paymentValidationStatus: {
    type: String,
    enum: ['pending', 'valid', 'invalid'],
    default: 'pending'
  },
  sslTranId: {
    type: String,
    trim: true
  },
  sslSessionKey: {
    type: String,
    trim: true
  },
  sslBankTranId: {
    type: String,
    trim: true
  },
  paidAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate ticket number before saving
bookingSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    this.ticketNumber =
      'TKT' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
