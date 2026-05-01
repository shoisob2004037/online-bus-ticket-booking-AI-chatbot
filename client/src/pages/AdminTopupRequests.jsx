import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';

const AdminTopupRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const data = await paymentService.getAdminTopupRequests();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (id, status) => {
    if (!window.confirm(`Mark this request as ${status}?`)) return;

    try {
      await paymentService.reviewTopupRequest(id, status);
      alert(`Request ${status} successfully!`);
      fetchRequests();
    } catch (err) {
      alert(err.message || 'Failed to update request');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading top-up requests...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">টপআপ রিকুয়েস্ট লিস্ট </h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Method</th>
              <th className="p-4 text-left">Transaction ID</th>
              <th className="p-4 text-left">Account Name</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id} className="border-t hover:bg-gray-50">
                <td className="p-4">{req.user?.name} ({req.user?.email})</td>
                <td className="p-4 font-bold">৳{req.amount}</td>
                <td className="p-4">{req.paymentMethod}</td>
                <td className="p-4 text-sm font-mono">{req.transactionId}</td>
                <td className="p-4">{req.accountName}</td>
                <td className="p-4">
                  <span className={`px-4 py-1 rounded-full text-xs font-medium ${
                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {req.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {req.status === 'pending' && (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleReview(req._id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-1.5 rounded text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(req._id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTopupRequests;