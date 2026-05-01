import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get('booking_id');
  const gatewayStatus = searchParams.get('status');

  const message =
    gatewayStatus === 'cancelled'
      ? 'পেমেন্ট বাতিল হয়েছে। চাইলে আবার চেষ্টা করতে পারেন।'
      : 'আপনার পেমেন্ট সফল হয়নি। আবার চেষ্টা করুন।';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">X</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">পেমেন্ট ব্যর্থ</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          {bookingId && (
            <button
              onClick={() => navigate(`/payment/${bookingId}`)}
              className="btn-primary w-full mb-3"
            >
              আবার পেমেন্ট করুন
            </button>
          )}

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

export default PaymentFailed;
