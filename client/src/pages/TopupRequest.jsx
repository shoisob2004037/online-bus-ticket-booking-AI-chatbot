import { useState } from 'react';
import walletService from '../services/walletService';
import { useAuth } from '../context/AuthContext';

const TopupRequest = () => {
  const { refreshUser, user } = useAuth();
  const [formData, setFormData] = useState({
    paymentMethod: '',
    amount: '',
    transactionId: '',
    accountName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await walletService.createTopupRequest({
        ...formData,
        amount: Number(formData.amount)
      });
      await refreshUser();
      setMessage('টপ-আপ রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে। অ্যাডমিন অনুমোদন দিলে ব্যালেন্স যোগ হবে।');
      setFormData({
        paymentMethod: '',
        amount: '',
        transactionId: '',
        accountName: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'রিকোয়েস্ট পাঠানো যায়নি');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-4">্টাকা ঢুকান (টপ-আপ রিকোয়েস্ট)</h1>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-orange-800">
            বর্তমান ব্যালেন্স: <strong>৳{user?.balance || 0}</strong>
          </p>
        </div>

        <div className="card">
          {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4">{message}</div>}
          {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <input
                type="text"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="input-field"
                placeholder="যেমন: bkash / nagad / bank"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">টাকার পরিমাণ (৳)</label>
              <input
                type="number"
                min="1"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'পাঠানো হচ্ছে...' : 'রিকোয়েস্ট পাঠান'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TopupRequest;
