const mongoose = require('mongoose');

const seatBookingSchema = new mongoose.Schema({
  busId: {
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
  seatNumber: {
    type: String,
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  isBooked: {
    type: Boolean,
    default: true
  }
});

// Compound index to ensure unique seat per bus, date, and time
seatBookingSchema.index(
  { busId: 1, journeyDate: 1, departureTime: 1, seatNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model('SeatBooking', seatBookingSchema);