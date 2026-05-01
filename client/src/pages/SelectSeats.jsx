import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, MapPin, Clock, Calendar, ArrowLeft } from 'lucide-react';
import SeatSelection from '../components/SeatSelection';
import busService from '../services/busService';

const SelectSeats = () => {
  const { busId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const busData = await busService.getBusById(busId);
        setBus(busData);
      } catch (err) {
        setError('বাসের তথ্য লোড করা যায়নি');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBus();
  }, [busId]);

  const handleSeatsChange = (seats) => {
    setSelectedSeats(seats);
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: window.location.pathname + window.location.search } } });
      return;
    }

    if (selectedSeats.length === 0) {
      alert('কমপক্ষে একটি সিট নির্বাচন করুন');
      return;
    }

    // Store booking data in sessionStorage for checkout
    const bookingData = {
      busId: bus.id,
      busName: bus.busName,
      busNumber: bus.busNumber,
      startPoint: bus.startPoint,
      destination: bus.destination,
      journeyDate: date,
      departureTime: time,
      seats: selectedSeats,
      ticketPrice: bus.ticketPrice,
      totalAmount: selectedSeats.length * bus.ticketPrice
    };

    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'বাস পাওয়া যায়নি'}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = selectedSeats.length * bus.ticketPrice;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          সার্চ ফলাফলে ফিরে যান
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold text-primary mb-6">আপনার সিট নির্বাচন করুন</h2>
              <SeatSelection
                busId={busId}
                date={date}
                time={time}
                onSeatsChange={handleSeatsChange}
              />
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-bold text-primary mb-4">বুকিং সারসংক্ষেপ</h3>

              {/* Bus Info */}
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">{bus.busName}</h4>
                    <p className="text-sm text-gray-500">{bus.busNumber} | {bus.busType}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <span>{bus.startPoint} → {bus.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span>{new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span>ছাড়ার সময়: {time}</span>
                  </div>
                </div>
              </div>

              {/* Selected Seats */}
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">নির্বাচিত সিট</span>
                  <span className="font-semibold text-primary">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'নেই'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">প্রতি সিট ভাড়া</span>
                  <span className="text-gray-800">৳{bus.ticketPrice}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-primary">মোট ভাড়া</span>
                <span className="text-2xl font-bold text-secondary">৳{totalAmount}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                disabled={selectedSeats.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedSeats.length === 0
                  ? 'চালিয়ে যেতে সিট নির্বাচন করুন'
                  : `চেকআউটে যান (${selectedSeats.length} সিট)`}
              </button>

              {!isAuthenticated && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  বুকিং সম্পন্ন করতে আপনাকে লগইন করতে হবে
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectSeats;
