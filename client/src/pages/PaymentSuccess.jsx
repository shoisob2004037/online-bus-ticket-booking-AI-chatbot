import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import paymentService from '../services/paymentService';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const bookingId = searchParams.get('booking_id');
  const gatewayStatus = searchParams.get('status');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        if (gatewayStatus === 'failed') {
          setStatus('failed');
          setError('গেটওয়েতে পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
          return;
        }

        if (gatewayStatus === 'cancelled') {
          setStatus('failed');
          setError('পেমেন্ট বাতিল হয়েছে।');
          return;
        }

        if (!bookingId) {
          setError('বুকিং আইডি পাওয়া যায়নি');
          setStatus('error');
          return;
        }

        const response = await paymentService.checkPaymentStatus(bookingId);
        setBooking(response);

        if (response.paymentStatus === 'completed') {
          setStatus('success');
        } else if (response.paymentStatus === 'pending') {
          setStatus('pending');
        } else {
          setStatus('failed');
          setError('পেমেন্ট সফল হয়নি');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setStatus('error');
        setError(err.message || 'পেমেন্ট স্ট্যাটাস যাচাই করা যায়নি');
      }
    };

    checkPaymentStatus();
  }, [bookingId, gatewayStatus]);

  const handleViewTicket = () => {
    navigate(`/ticket/${bookingId}`);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">পেমেন্ট সফল!</h1>
            <p className="text-gray-600 mb-6">
              আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে
            </p>

            {booking && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">টিকিট নম্বর:</span>
                  <span className="font-bold text-gray-800">{booking.ticketNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">পরিশোধিত টাকা:</span>
                  <span className="font-bold text-secondary">৳{booking.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">স্ট্যাটাস:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {booking.bookingStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleViewTicket}
              className="btn-primary w-full mb-3"
            >
              টিকিট দেখুন
            </button>

            <button
              onClick={() => navigate('/')}
              className="btn-secondary w-full"
            >
              হোমে যান
            </button>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>কনফার্মেশন ইমেইল:</strong> আপনার টিকিটের বিস্তারিতসহ একটি ইমেইল পাঠানো হয়েছে।
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-blue-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">পেমেন্ট প্রক্রিয়াধীন</h1>
            <p className="text-gray-600 mb-6">
              আপনার পেমেন্ট প্রক্রিয়াকরণ হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...
            </p>

            <button
              onClick={handleViewTicket}
              className="btn-primary w-full"
            >
              স্ট্যাটাস দেখুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✕</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {error ? 'ত্রুটি' : 'পেমেন্ট ব্যর্থ'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'আপনার পেমেন্ট সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।'}
          </p>

          <button
            onClick={() => navigate(`/payment/${bookingId}`)}
            className="btn-primary w-full mb-3"
          >
            আবার পেমেন্ট করুন
          </button>

          <button
            onClick={() => navigate('/')}
            className="btn-secondary w-full"
          >
            হোমে যান
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
