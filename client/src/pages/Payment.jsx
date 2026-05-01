import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import paymentService from '../services/paymentService';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [booking, setBooking] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get booking details
        const bookingData = await paymentService.getBooking(bookingId);
        setBooking(bookingData.booking || bookingData);

        // Get current wallet balance
        const balanceRes = await paymentService.getBalance();
        setCurrentBalance(balanceRes.balance || 0);
      } catch (err) {
        console.error(err);
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookingId]);

  const handlePayWithWallet = async () => {
    if (!booking) return;

    if (currentBalance < booking.totalAmount) {
      setError(`Insufficient balance. You have ৳${currentBalance}, but need ৳${booking.totalAmount}`);
      return;
    }

    setPaying(true);
    setError('');

    try {
      const result = await paymentService.payWithWallet(bookingId);

      if (result.success) {
        setCurrentBalance(result.newBalance ?? currentBalance);
        await refreshUser();
        // Redirect to ticket page after successful payment
        navigate(`/ticket/${bookingId}`);
      } else {
        setError(result.message || 'Payment failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Booking not found</p>
          <button 
            onClick={() => navigate('/profile')}
            className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Complete Payment</h1>

        <div className="space-y-6">
          {/* Booking Details */}
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bus</span>
                <span className="font-medium">{booking.busName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Route</span>
                <span>{booking.startPoint} → {booking.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time</span>
                <span>
                  {new Date(booking.journeyDate).toLocaleDateString()} | {booking.departureTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seats</span>
                <span className="font-medium">{booking.seats?.join(', ')}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-xl text-orange-600">৳{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="bg-blue-50 p-6 rounded-2xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Your Wallet Balance</p>
                <p className="text-3xl font-bold text-green-600">৳{currentBalance}</p>
              </div>
              {currentBalance < booking.totalAmount && (
                <p className="text-red-600 text-sm font-medium">Insufficient Balance</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-center">
              {error}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayWithWallet}
            disabled={paying || currentBalance < booking.totalAmount}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-2xl font-semibold text-lg transition-colors"
          >
            {paying ? 'Processing Payment...' : `Pay ৳${booking.totalAmount} from Wallet`}
          </button>

          {/* Top Up Option */}
          <button
            onClick={() => navigate('/taka-dhukan')}
            className="w-full py-3 text-orange-600 border border-orange-600 rounded-2xl font-medium hover:bg-orange-50"
          >
            Top Up Wallet (টাকা ঢুকান)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
