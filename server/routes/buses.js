const express = require('express');
const buses = require('../data/buses.json');
const SeatBooking = require('../models/SeatBooking');

const router = express.Router();

// Get all buses
router.get('/', (req, res) => {
  res.json(buses);
});

// IMPORTANT: static sub-paths must come before /:id to avoid route conflicts
// Get unique locations for dropdown
router.get('/locations/all', (req, res) => {
  const startPoints = [...new Set(buses.map(bus => bus.startPoint))];
  const destinations = [...new Set(buses.map(bus => bus.destination))];
  const allLocations = [...new Set([...startPoints, ...destinations])].sort();
  res.json({ locations: allLocations });
});

// Search buses by route
router.get('/search', (req, res) => {
  const { from, to, date, time } = req.query;

  let filteredBuses = buses.filter(bus => {
    const matchFrom = bus.startPoint.toLowerCase() === from?.toLowerCase();
    const matchTo = bus.destination.toLowerCase() === to?.toLowerCase();
    return matchFrom && matchTo;
  });

  if (time) {
    filteredBuses = filteredBuses.map(bus => {
      const availableTimes = bus.departureTimes.filter(t => t >= time);
      return {
        ...bus,
        availableDepartureTimes: availableTimes.length > 0 ? availableTimes : bus.departureTimes
      };
    });
  } else {
    filteredBuses = filteredBuses.map(bus => ({
      ...bus,
      availableDepartureTimes: bus.departureTimes
    }));
  }

  res.json({ buses: filteredBuses, searchParams: { from, to, date, time } });
});

// Get single bus by ID
router.get('/:id', (req, res) => {
  const bus = buses.find(b => b.id === req.params.id);
  if (!bus) {
    return res.status(404).json({ message: 'Bus not found' });
  }
  res.json(bus);
});

// Get booked seats for a specific bus, date, and time
router.get('/:id/seats', async (req, res) => {
  try {
    const { date, time } = req.query;
    const busId = req.params.id;

    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    const bookedSeats = await SeatBooking.find({
      busId,
      journeyDate: new Date(date),
      departureTime: time,
      isBooked: true
    }).select('seatNumber');

    const bookedSeatNumbers = bookedSeats.map(s => s.seatNumber);
    res.json({ bookedSeats: bookedSeatNumbers });
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;