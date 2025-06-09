import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBook,
  faCreditCard,
  faChartBar,
  faListAlt,
} from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 text-blue-800 text-center">
          Admin Dashboard
        </h1>

        {/* Grid layout với 3 card ở trên, 2 card ở dưới */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Manage Users Card */}
          <Link
            to="/admin/users"
            className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-3xl text-indigo-600"
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-indigo-800">
                  Manage Users
                </h2>
                <p className="text-gray-600 mt-2">View and manage user accounts</p>
              </div>
            </div>
          </Link>

          {/* Manage Books Card */}
          <Link
            to="/admin/books"
            className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <FontAwesomeIcon icon={faBook} className="text-3xl text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-800">
                  Manage Books
                </h2>
                <p className="text-gray-600 mt-2">Review and manage listings</p>
              </div>
            </div>
          </Link>

          {/* Manage Categories Card */}
          <Link
            to="/admin/categories"
            className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                <FontAwesomeIcon icon={faListAlt} className="text-3xl text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-cyan-800">
                  Categories
                </h2>
                <p className="text-gray-600 mt-2">Manage book categories</p>
              </div>
            </div>
          </Link>

          {/* Payments & Statistics row - centered */}
          <div className="md:col-span-3 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
            {/* Payment Methods Card */}
            <Link
              to="/admin/payment-methods"
              className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors">
                  <FontAwesomeIcon icon={faCreditCard} className="text-3xl text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-teal-800">
                    Payments
                  </h2>
                  <p className="text-gray-600 mt-2">Manage payment methods</p>
                </div>
              </div>
            </Link>

            {/* Statistics Card */}
            <Link
              to="/admin/statistics"
              className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <FontAwesomeIcon icon={faChartBar} className="text-3xl text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-green-800">
                    Statistics
                  </h2>
                  <p className="text-gray-600 mt-2">View system analytics</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;