const express = require('express');
const Booking = require('../models/Booking');
const SeatBooking = require('../models/SeatBooking');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create booking (no payment yet)
router.post('/', auth, async (req, res) => {
  try {
    const {
      busId, busName, busNumber, startPoint, destination,
      journeyDate, departureTime, seats, totalAmount,
      passengerName, passengerPhone, passengerEmail
    } = req.body;

    // Check seat availability
    const existing = await SeatBooking.find({
      busId,
      journeyDate: new Date(journeyDate),
      departureTime,
      seatNumber: { $in: seats },
      isBooked: true
    });

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Some seats are already booked' });
    }

    // Generate ticket number
    const ticketNumber = `BG${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;

    const booking = new Booking({
      user: req.user._id,
      busId,
      busName,
      busNumber,
      startPoint,
      destination,
      journeyDate: new Date(journeyDate),
      departureTime,
      seats,
      totalAmount,
      passengerName,
      passengerPhone,
      passengerEmail,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      ticketNumber
    });

    await booking.save();

    // Reserve seats
    const seatDocs = seats.map(seat => ({
      busId,
      journeyDate: new Date(journeyDate),
      departureTime,
      seatNumber: seat,
      bookingId: booking._id,
      isBooked: true
    }));

    await SeatBooking.insertMany(seatDocs);

    res.status(201).json({
      success: true,
      bookingId: booking._id,
      booking,
      ticketNumber: booking.ticketNumber,
      message: 'Booking created successfully. Please complete payment.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pay with wallet balance
router.post('/pay/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Already paid' });
    }

    const user = await User.findById(req.user._id);
    if (!user || (user.balance || 0) < booking.totalAmount) {
      return res.status(400).json({
        message: `Insufficient balance. Required: ৳${booking.totalAmount}, Available: ৳${user?.balance || 0}`,
        required: booking.totalAmount,
        current: user?.balance || 0
      });
    }

    // Deduct balance
    user.balance -= booking.totalAmount;
    await user.save();

    // Update booking status
    booking.paymentStatus = 'completed';
    booking.bookingStatus = 'confirmed';
    booking.paymentMethod = 'wallet';
    booking.paidAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Payment successful from wallet!',
      newBalance: user.balance,
      ticketNumber: booking.ticketNumber,
      bookingId: booking._id,
      redirectTo: `/ticket/${booking._id}`   // Important for frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment failed' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single booking (for TicketPage)
router.get('/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
