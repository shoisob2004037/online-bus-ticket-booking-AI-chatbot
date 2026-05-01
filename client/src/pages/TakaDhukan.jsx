import React, { useState } from 'react';
import paymentService from '../services/paymentService';

const TakaDhukan = () => {
  const [form, setForm] = useState({
    paymentMethod: 'bKash',
    amount: '',
    transactionId: '',
    accountName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await paymentService.submitTopupRequest(form);
      setMessage('✅ Your top-up request has been submitted successfully! Admin will review and approve it soon.');
      setForm({ paymentMethod: 'bKash', amount: '', transactionId: '', accountName: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-600">টাকা ঢুকান</h1>
        <p className="text-gray-600 mt-2">সেন্ড মানি করুন এবং টাকা আপনার ওয়ালেট এ এড করুন</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount (৳)</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Minimum 50 Taka"
            min="50"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Transaction ID</label>
          <input
            type="text"
            name="transactionId"
            value={form.transactionId}
            onChange={handleChange}
            placeholder="Enter your transaction ID"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Account Name</label>
          <input
            type="text"
            name="accountName"
            value={form.accountName}
            onChange={handleChange}
            placeholder="Name on the account"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Submitting Request...' : 'Submit Top-up Request'}
        </button>
      </form>

      {message && (
        <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-xl text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-xl text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default TakaDhukan;