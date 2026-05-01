import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Bus, MapPin, Calendar, Clock } from 'lucide-react';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [bookingData, setBookingData] = useState(null);
  const [passengerInfo, setPassengerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [directPaying, setDirectPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get booking data from sessionStorage
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    if (!pendingBooking) {
      navigate('/');
      return;
    }

    setBookingData(JSON.parse(pendingBooking));

    // Pre-fill passenger info from user data
    if (user) {
      setPassengerInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (e) => {
    setPassengerInfo({
      ...passengerInfo,
      [e.target.name]: e.target.value
    });
  };

  const createBooking = async () => {
    const bookingPayload = {
      ...bookingData,
      passengerName: passengerInfo.name,
      passengerPhone: passengerInfo.phone,
      passengerEmail: passengerInfo.email
    };

    const result = await bookingService.createBooking(bookingPayload);
    const bookingId = result.bookingId || result.booking?._id;

    if (!bookingId) {
      throw new Error('Booking was created, but no booking ID was returned.');
    }

    sessionStorage.removeItem('pendingBooking');
    return bookingId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const bookingId = await createBooking();
      navigate(`/payment/${bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'বুকিং তৈরি করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPayment = async () => {
    setError('');
    setDirectPaying(true);

    try {
      const bookingId = await createBooking();
      const result = await paymentService.startSslCommerzPayment(bookingId);

      if (!result.gatewayUrl) {
        throw new Error('Payment gateway URL was not returned.');
      }

      window.location.href = result.gatewayUrl;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Direct payment could not be started. Please try again.');
    } finally {
      setDirectPaying(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-8">চেকআউট</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Passenger Information Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-bold text-primary mb-6">যাত্রীর তথ্য</h2>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    পূর্ণ নাম *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={passengerInfo.name}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="যাত্রীর নাম লিখুন"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ইমেইল ঠিকানা *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={passengerInfo.email}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="ইমেইল লিখুন"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ফোন নম্বর *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={passengerInfo.phone}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="+880 1XXX-XXXXXX"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || directPaying}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'পেমেন্টে যান'}
                </button>

                <button
                  type="button"
                  onClick={handleDirectPayment}
                  disabled={loading || directPaying}
                  className="w-full py-3 rounded-lg font-semibold border-2 border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {directPaying ? 'Starting Gateway...' : 'Payment Directly'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Payment Directly uses SSLCommerz sandbox. Your wallet payment option is unchanged.
                </p>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-bold text-primary mb-4">অর্ডার সারসংক্ষেপ</h3>

              {/* Bus Info */}
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">{bookingData.busName}</h4>
                    <p className="text-sm text-gray-500">{bookingData.busNumber}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <span>{bookingData.startPoint} → {bookingData.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span>{new Date(bookingData.journeyDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span>ছাড়ার সময়: {bookingData.departureTime}</span>
                  </div>
                </div>
              </div>

              {/* Seat Details */}
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">সিট</span>
                  <span className="font-semibold text-primary">{bookingData.seats.join(', ')}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">সিট সংখ্যা</span>
                  <span className="text-gray-800">{bookingData.seats.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">প্রতি সিট ভাড়া</span>
                  <span className="text-gray-800">৳{bookingData.ticketPrice}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-primary">মোট ভাড়া</span>
                <span className="text-2xl font-bold text-secondary">৳{bookingData.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
