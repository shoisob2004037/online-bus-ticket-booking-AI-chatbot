import { useState, useEffect } from 'react';
import busService from '../services/busService';

// Seat layout: 42 passenger seats + 1 driver + 1 supervisor + 1 helper
// Layout: 4 columns (2 + aisle + 2), 11 rows of seats
const generateSeatLayout = () => {
  const seats = [];
  const rows = 11;
  
  for (let row = 1; row <= rows; row++) {
    // Left side seats (A, B)
    seats.push({ id: `${row}A`, row, col: 'A', type: 'passenger' });
    seats.push({ id: `${row}B`, row, col: 'B', type: 'passenger' });
    // Right side seats (C, D)
    seats.push({ id: `${row}C`, row, col: 'C', type: 'passenger' });
    seats.push({ id: `${row}D`, row, col: 'D', type: 'passenger' });
  }
  
  // Remove the last 2 seats to make it 42
  return seats.slice(0, 42);
};

const SeatSelection = ({ busId, date, time, onSeatsChange }) => {
  const [seats] = useState(generateSeatLayout());
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const result = await busService.getBookedSeats(busId, date, time);
        setBookedSeats(result.bookedSeats || []);
      } catch (error) {
        console.error('Error fetching booked seats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSeats();
  }, [busId, date, time]);

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats((prev) => {
      const newSelection = prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId];
      
      onSeatsChange(newSelection);
      return newSelection;
    });
  };

  const getSeatStatus = (seatId) => {
    if (bookedSeats.includes(seatId)) return 'booked';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  const getSeatClass = (status) => {
    const baseClass = 'w-10 h-10 rounded-t-xl rounded-b-sm border-2 flex items-center justify-center text-xs font-medium transition-all cursor-pointer';
    
    switch (status) {
      case 'booked':
        return `${baseClass} bg-red-500 border-red-600 text-white cursor-not-allowed`;
      case 'selected':
        return `${baseClass} bg-secondary border-orange-600 text-white scale-105`;
      default:
        return `${baseClass} bg-green-500 border-green-600 text-white hover:bg-green-400`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Group seats by row
  const seatsByRow = [];
  for (let i = 0; i < seats.length; i += 4) {
    seatsByRow.push(seats.slice(i, i + 4));
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-green-500 border-2 border-green-600"></div>
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-red-500 border-2 border-red-600"></div>
          <span className="text-sm text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg rounded-b-sm bg-secondary border-2 border-orange-600"></div>
          <span className="text-sm text-gray-600">Selected</span>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="max-w-xs mx-auto">
        {/* Bus Front (Driver, Supervisor, Helper) */}
        <div className="bg-primary/10 rounded-t-3xl p-4 mb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gray-400 flex items-center justify-center text-xs text-white font-medium">
                DRV
              </div>
              <span className="text-xs text-gray-500">Driver</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 mx-auto mb-1"></div>
              <span className="text-xs text-gray-500">Steering</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Helper</span>
              <div className="w-10 h-10 rounded-lg bg-gray-400 flex items-center justify-center text-xs text-white font-medium">
                HLP
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gray-400 flex items-center justify-center text-xs text-white font-medium">
                SUP
              </div>
              <span className="text-xs text-gray-500">Supervisor</span>
            </div>
          </div>
        </div>

        {/* Entrance */}
        <div className="flex justify-end mb-2 pr-2">
          <div className="bg-primary text-white text-xs px-3 py-1 rounded">
            Entrance
          </div>
        </div>

        {/* Seat Grid */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
          <div className="space-y-3">
            {seatsByRow.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center gap-2">
                {/* Left seats (A, B) */}
                <div className="flex gap-1">
                  {row.slice(0, 2).map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={bookedSeats.includes(seat.id)}
                      className={getSeatClass(getSeatStatus(seat.id))}
                      title={`Seat ${seat.id}`}
                    >
                      {seat.id}
                    </button>
                  ))}
                </div>

                {/* Aisle */}
                <div className="w-8"></div>

                {/* Right seats (C, D) */}
                <div className="flex gap-1">
                  {row.slice(2, 4).map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={bookedSeats.includes(seat.id)}
                      className={getSeatClass(getSeatStatus(seat.id))}
                      title={`Seat ${seat.id}`}
                    >
                      {seat.id}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back of bus */}
        <div className="bg-gray-200 h-4 rounded-b-xl"></div>
      </div>

      {/* Selected Seats Info */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Selected Seats: <span className="font-semibold text-primary">{selectedSeats.join(', ')}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
