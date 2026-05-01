import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';   // ← Add this

const AdminDashboard = () => {
  const { user } = useAuth();                       // ← Add this line
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.users || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      
      {/* Dynamic Admin Profile + Stats */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-10">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">👤</span>
          </div>
          
          <h1 className="text-3xl font-bold text-primary">{user?.name || 'Admin'}</h1>
          <p className="text-gray-500 mt-1">{user?.email}</p>
          <p className="text-sm text-green-600 font-medium mt-2">Administrator</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-gray-50 rounded-2xl p-6">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-4xl font-bold text-primary mt-2">{users.length}</p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6">
            <p className="text-sm text-gray-500">Total Admins</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </div>
      </div>

      {/* All Users Table */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b bg-gray-50">
          <h2 className="text-2xl font-semibold">All Users ({users.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-5 px-8 font-medium text-gray-600">Name</th>
                <th className="text-left py-5 px-8 font-medium text-gray-600">Email</th>
                <th className="text-left py-5 px-8 font-medium text-gray-600">Phone</th>
                <th className="text-left py-5 px-8 font-medium text-gray-600">Role</th>
                <th className="text-left py-5 px-8 font-medium text-gray-600">Balance</th>
                <th className="text-left py-5 px-8 font-medium text-gray-600">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((userItem) => (
                <tr key={userItem._id} className="hover:bg-gray-50">
                  <td className="py-5 px-8 font-medium">{userItem.name}</td>
                  <td className="py-5 px-8 text-gray-600">{userItem.email}</td>
                  <td className="py-5 px-8 text-gray-600">{userItem.phone || '-'}</td>
                  <td className="py-5 px-8">
                    <span className={`inline-flex px-4 py-1 text-xs font-semibold rounded-full ${
                      userItem.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {userItem.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-5 px-8 font-bold text-green-600">৳{userItem.balance || 0}</td>
                  <td className="py-5 px-8 text-sm text-gray-500">
                    {new Date(userItem.createdAt).toLocaleDateString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;