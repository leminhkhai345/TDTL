import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBook,
  faShoppingCart,
  faCreditCard,
  faChartBar,
  faListAlt,
} from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 text-blue-800 text-center text-shadow-md">
          Admin Dashboard
        </h1>
        <div className="grid grid-cols-3 gap-8">
          {/* Manage Users Card */}
          <Link
            to="/admin/users"
            className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-4xl" />
              <div>
                <h2 className="text-2xl font-semibold text-blue-800">Manage Users</h2>
                <p className="text-gray-600 mt-2">View, lock, or unlock user accounts</p>
              </div>
            </div>
          </Link>

          {/* Manage Books Card */}
          <Link
            to="/admin/books"
            className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faBook} className="text-blue-600 text-4xl" />
              <div>
                <h2 className="text-2xl font-semibold text-blue-800">Manage Books</h2>
                <p className="text-gray-600 mt-2">Approve, reject, or delete books</p>
              </div>
            </div>
          </Link>

          {/* Manage Orders Card */}
          <Link
            to="/admin/orders"
            className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faShoppingCart} className="text-blue-600 text-4xl" />
              <div>
                <h2 className="text-2xl font-semibold text-blue-800">Manage Orders</h2>
                <p className="text-gray-600 mt-2">View and update order statuses</p>
              </div>
            </div>
          </Link>

          {/* Manage Payment Methods Card */}
          <Link
            to="/admin/payment-methods"
            className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 text-4xl" />
              <div>
                <h2 className="text-2xl font-semibold text-blue-800">Manage Payment Methods</h2>
                <p className="text-gray-600 mt-2">Add, enable, or disable payment methods</p>
              </div>
            </div>
          </Link>

          {/* Manage Categories Card */}
          <Link
            to="/admin/categories"
            className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faListAlt} className="text-blue-600 text-4xl" />
              <div>
                <h2 className="text-2xl font-semibold text-blue-800">Manage Categories</h2>
                <p className="text-gray-600 mt-2">Add, edit, or delete book categories</p>
              </div>
            </div>
          </Link>

          {/* System Statistics Card */}
          <Link
            to="/admin/statistics"
            className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            <div className="flex items-center space-x-4">
              <FontAwesomeIcon icon={faChartBar} className="text-blue-600 text-4xl" />
              <div>
                <h2 className="text-2xl font-semibold text-blue-800">System Statistics</h2>
                <p className="text-gray-600 mt-2">View overall system metrics</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;