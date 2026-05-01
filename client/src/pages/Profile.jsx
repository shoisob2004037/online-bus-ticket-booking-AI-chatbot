import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar, Bus, MapPin, Clock, Eye, XCircle, Wallet } from 'lucide-react';
import bookingService from '../services/bookingService';
import walletService from '../services/walletService';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentBalance, setCurrentBalance] = useState(user?.balance || 0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // For Admin: Skip bookings completely
    if (user?.role === 'admin') {
      setLoading(false);
      return;
    }

    // For normal users: Fetch bookings and latest wallet balance
    const fetchBookings = async () => {
      try {
        const [result, balanceResult] = await Promise.all([
          bookingService.getMyBookings(),
          walletService.getBalance()
        ]);
        setBookings(result.bookings || []);
        setCurrentBalance(balanceResult.balance || 0);
      } catch (err) {
        setError('Failed to load profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, navigate, user?.role]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.cancelBooking(bookingId);
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b
      ));
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return new Date(booking.journeyDate) >= new Date() && booking.bookingStatus === 'confirmed';
    }
    if (activeTab === 'completed') {
      return new Date(booking.journeyDate) < new Date() && booking.bookingStatus === 'confirmed';
    }
    if (activeTab === 'cancelled') {
      return booking.bookingStatus === 'cancelled';
    }
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Info Card - Shown for Everyone */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-primary">{user?.name}</h2>
                <p className="text-gray-500">
                  {user?.role === 'admin' ? 'Administrator' : 'BusGo Member'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-secondary" />
                  <span>{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5 text-secondary" />
                    <span>{user?.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats - Only for Normal Users */}
              {user?.role !== 'admin' && (
                <div className="mt-6 pt-6 border-t">
                  <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current Balance</p>
                          <p className="text-2xl font-bold text-green-700">৳{currentBalance}</p>
                        </div>
                      </div>
                      <Link to="/taka-dhukan" className="text-sm font-medium text-secondary hover:underline">
                        Top Up
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{bookings.length}</p>
                      <p className="text-sm text-gray-500">Total Bookings</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary">
                        {bookings.filter(b => b.bookingStatus === 'confirmed').length}
                      </p>
                      <p className="text-sm text-gray-500">Confirmed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bookings Section - ONLY for Normal Users (Hidden for Admin) */}
          {user?.role !== 'admin' && (
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="text-lg font-bold text-primary mb-6">My Bookings</h3>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'upcoming', label: 'Upcoming' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'cancelled', label: 'Cancelled' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-secondary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Loading */}
                {loading && (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Empty State */}
                {!loading && filteredBookings.length === 0 && (
                  <div className="text-center py-12">
                    <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No bookings found</h4>
                    <p className="text-gray-500 mb-4">
                      {activeTab === 'all' 
                        ? "You haven't made any bookings yet." 
                        : `No ${activeTab} bookings.`}
                    </p>
                    <Link to="/search" className="btn-primary inline-block">
                      Book a Bus
                    </Link>
                  </div>
                )}

                {/* Bookings List */}
                {!loading && filteredBookings.length > 0 && (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className={`border rounded-xl p-4 ${
                          booking.bookingStatus === 'cancelled'
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Bus className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-primary">{booking.busName}</h4>
                                <p className="text-sm text-gray-500">{booking.ticketNumber}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-secondary" />
                                <span>{booking.startPoint} → {booking.destination}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-secondary" />
                                <span>{formatDate(booking.journeyDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4 text-secondary" />
                                <span>{booking.departureTime}</span>
                              </div>
                              <div className="text-gray-600">
                                Seats: <span className="font-medium">{booking.seats.join(', ')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <p className="text-xl font-bold text-secondary">৳{booking.totalAmount}</p>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                booking.bookingStatus === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {booking.bookingStatus.toUpperCase()}
                              </span>
                            </div>

                            {booking.bookingStatus === 'confirmed' && (
                              <div className="flex gap-2">
                                <Link
                                  to={`/ticket/${booking._id}`}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </Link>
                                {new Date(booking.journeyDate) > new Date() && (
                                  <button
                                    onClick={() => handleCancelBooking(booking._id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Cancel
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
