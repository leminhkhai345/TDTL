// src/pages/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="p-6 bg-blue-100 rounded-lg shadow hover:bg-blue-200 transition"
        >
          <h2 className="text-xl font-semibold text-blue-800">Manage Users</h2>
          <p className="text-gray-600 mt-2">View, lock, or unlock user accounts</p>
        </Link>
        <Link
          to="/admin/books"
          className="p-6 bg-blue-100 rounded-lg shadow hover:bg-blue-200 transition"
        >
          <h2 className="text-xl font-semibold text-blue-800">Manage Books</h2>
          <p className="text-gray-600 mt-2">Approve, reject, or delete books</p>
        </Link>
        <Link
          to="/admin/orders"
          className="p-6 bg-blue-100 rounded-lg shadow hover:bg-blue-200 transition"
        >
          <h2 className="text-xl font-semibold text-blue-800">Manage Orders</h2>
          <p className="text-gray-600 mt-2">View and update order statuses</p>
        </Link>
        <Link
          to="/admin/reviews"
          className="p-6 bg-blue-100 rounded-lg shadow hover:bg-blue-200 transition"
        >
          <h2 className="text-xl font-semibold text-blue-800">Manage Reviews</h2>
          <p className="text-gray-600 mt-2">View and delete user reviews</p>
        </Link>
        <Link
          to="/admin/statistics"
          className="p-6 bg-blue-100 rounded-lg shadow hover:bg-blue-200 transition"
        >
          <h2 className="text-xl font-semibold text-blue-800">System Statistics</h2>
          <p className="text-gray-600 mt-2">View overall system metrics</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;