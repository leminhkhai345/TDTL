import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getMySales, confirmOrder, rejectOrder } from '../src/API/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faFileExport } from '@fortawesome/free-solid-svg-icons';

const MySalesPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [rejectModalOrderId, setRejectModalOrderId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = { page, pageSize };
      const response = await getMySales(queryParams);
      setOrders(response.items.map(item => ({
        ...item,
        orderStatus: item.orderStatus?.trim()
      })) || []);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
      toast.error(err.message || 'Failed to load orders');
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId, rowVersion) => {
    try {
      const response = await confirmOrder(orderId, { rowVersion });
      setOrders(orders.map(order => order.orderId === orderId ? {
        ...response,
        orderStatus: response.orderStatus?.trim()
      } : order));
      toast.success(`Order #${orderId} confirmed successfully!`);
    } catch (error) {
      toast.error(error.message || 'Failed to confirm order');
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    if (rejectReason.length > 500) {
      toast.error('Rejection reason cannot exceed 500 characters');
      return;
    }
    try {
      const order = orders.find(o => o.orderId === rejectModalOrderId);
      const response = await rejectOrder(rejectModalOrderId, { rowVersion: order.rowVersion, reason: rejectReason });
      setOrders(orders.map(o => o.orderId === rejectModalOrderId ? {
        ...response,
        orderStatus: response.orderStatus?.trim()
      } : o));
      setRejectModalOrderId(null);
      setRejectReason('');
      toast.success(`Order #${rejectModalOrderId} rejected successfully!`);
    } catch (error) {
      toast.error(error.message || 'Failed to reject order');
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setStatusFilter('');
    fetchSales();
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
  };

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Please log in to view orders');
      navigate('/login');
      return;
    }
    fetchSales();
  }, [page, isLoggedIn, navigate]);

  // Get unique statuses
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(orders.map(item => item.orderStatus))];
    return uniqueStatuses.sort();
  }, [orders]);

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => statusFilter ? order.orderStatus === statusFilter : true);
  }, [orders, statusFilter]);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-semibold text-blue-800">My Sales</h1>
          <div className="flex gap-4 items-center">
            <div className="relative w-64">
              <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all duration-200 text-lg"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              title="Export Orders"
            >
              <FontAwesomeIcon icon={faFileExport} />
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              title="Refresh Orders"
            >
              <FontAwesomeIcon icon={faSyncAlt} />
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center py-6">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
        {error && (
          <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg mb-6">
            {error}
            <button
              onClick={() => navigate('/browse')}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
            >
              Back to Browse
            </button>
          </div>
        )}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="text-center py-6 text-gray-600 text-lg">No orders found.</div>
        )}

        {/* Orders Table */}
        {!loading && filteredOrders.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full table-auto">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Buyer Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const isSeller = user?.id && order?.sellerId ? String(user.id).trim() === String(order.sellerId).trim() : false;
                    return (
                      <tr key={order.orderId} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-lg text-gray-900">
                          <button
                            onClick={() => navigate(`/orders/${order.orderId}`)}
                            className="text-blue-600 hover:underline"
                          >
                            #{order.orderId}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-lg text-gray-900">{order.buyerName || 'Unknown'}</td>
                        <td className="px-6 py-4 text-lg text-gray-900">
                          {new Date(order.orderDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-lg text-gray-900">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-lg text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.orderStatus === 'PendingSellerConfirmation' ? 'bg-yellow-100 text-yellow-800' :
                            order.orderStatus === 'AwaitingOfflinePayment' ? 'bg-blue-100 text-blue-800' :
                            order.orderStatus === 'PendingShipment' ? 'bg-orange-100 text-orange-800' :
                            order.orderStatus === 'Shipped' ? 'bg-green-100 text-green-800' :
                            order.orderStatus === 'Delivered' || order.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.orderStatus.includes('Cancelled') ? 'bg-red-100 text-red-800' :
                            order.orderStatus.includes('Rejected') ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-lg flex gap-3">
                          <button
                            onClick={() => navigate(`/orders/${order.orderId}`)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
                          >
                            View Details
                          </button>
                          {isSeller && order.orderStatus === 'PendingSellerConfirmation' && (
                            <>
                              <button
                                onClick={() => handleConfirmOrder(order.orderId, order.rowVersion)}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setRejectModalOrderId(order.orderId)}
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:scale-100 disabled:shadow-none"
              >
                Previous
              </button>
              <span className="text-gray-600 text-lg">Page {page} of {Math.ceil(totalCount / pageSize)}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= totalCount}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:scale-100 disabled:shadow-none"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Reject Order Modal */}
        {rejectModalOrderId && (
          <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-semibold mb-6 text-blue-800">Reject Order #{rejectModalOrderId}</h2>
              <div className="relative mb-6">
                <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200 text-lg"
                  rows="4"
                  placeholder="Enter rejection reason..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{rejectReason.length}/500 characters</p>
              </div>
            <div className="flex justify-end gap-4">
                <button
                  onClick={() => setRejectModalOrderId(null)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectOrder}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySalesPage;