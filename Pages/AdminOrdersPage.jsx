// src/pages/AdminOrdersPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { DataContext } from '../src/contexts/DataContext';
import { updateOrderStatus, deleteOrder } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const AdminOrdersPage = () => {
  const { orders: allOrders, users: allUsers, books: allBooks, refreshData } = useContext(DataContext);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const limit = 10;

  // Memoize dữ liệu đã lọc và sắp xếp
  const filteredOrders = useMemo(() => {
    let filtered = [...allOrders];

    filtered = filtered.filter((order) => {
      const matchesSearch =
        !search ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.userId.toLowerCase().includes(search.toLowerCase()) ||
        order.bookId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && order.status === 'pending') ||
        (statusFilter === 'completed' && order.status === 'completed') ||
        (statusFilter === 'cancelled' && order.status === 'cancelled');
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      const valueA = sortBy === 'totalAmount' ? Number(a.totalAmount) : a.id.toLowerCase();
      const valueB = sortBy === 'totalAmount' ? Number(b.totalAmount) : b.id.toLowerCase();
      return sortDirection === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });

    return filtered;
  }, [allOrders, search, statusFilter, sortBy, sortDirection]);

  // Memoize dữ liệu phân trang
  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, page]);

  // Cập nhật tổng số và điều chỉnh page khi cần
  useEffect(() => {
    const maxPage = Math.ceil(filteredOrders.length / limit);
    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    } else if (filteredOrders.length === 0) {
      setPage(1);
    }
  }, [filteredOrders, page]);

  // Memoize các hàm xử lý sự kiện
  const handleDelete = useCallback((orderId) => {
    setOrderToDelete(orderId);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await deleteOrder(orderToDelete);
      refreshData();
      toast.success('Order deleted successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  }, [orderToDelete, refreshData]);

  const cancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  }, []);

  const handleUpdateStatus = useCallback((orderId, status) => {
    setOrderToUpdate(orderId);
    setNewStatus(status);
    setIsStatusModalOpen(true);
  }, []);

  const confirmUpdateStatus = useCallback(async () => {
    try {
      await updateOrderStatus(orderToUpdate, newStatus);
      refreshData();
      if (selectedOrder?.id === orderToUpdate) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsStatusModalOpen(false);
      setOrderToUpdate(null);
      setNewStatus('');
    }
  }, [orderToUpdate, newStatus, selectedOrder, refreshData]);

  const cancelUpdateStatus = useCallback(() => {
    setIsStatusModalOpen(false);
    setOrderToUpdate(null);
    setNewStatus('');
  }, []);

  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setSearch('');
    setStatusFilter('all');
    setSortBy('id');
    setSortDirection('asc');
    refreshData();
  }, [refreshData]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Manage Orders</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faSyncAlt} />
          Refresh
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by ID, user ID, or book ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="id">Sort by ID</option>
          <option value="totalAmount">Sort by Total Amount</option>
        </select>
        <select
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <p className="mb-6 text-gray-600">Total Orders: {allOrders.length} (Filtered: {filteredOrders.length})</p>
      {paginatedOrders.length === 0 ? (
        <p className="text-center text-gray-600">
          {search || statusFilter !== 'all' ? 'No orders match your search.' : 'No orders found.'}
        </p>
      ) : (
        <div>
          {/* Mobile view */}
          <div className="md:hidden">
            {paginatedOrders.map((order) => (
              <div key={order.id} className="border-b p-4">
                <p>
                  <strong>ID:</strong>{' '}
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="text-blue-600 hover:underline"
                  >
                    {order.id}
                  </button>
                </p>
                <p><strong>User ID:</strong> {order.userId}</p>
                <p><strong>Book ID:</strong> {order.bookId}</p>
                <p><strong>Total Amount:</strong> ${order.totalAmount?.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <div className="mt-2 flex gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop view */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Book ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Total Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:underline"
                      >
                        {order.id}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.userId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.bookId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${order.totalAmount?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={paginatedOrders.length < limit || page * limit >= filteredOrders.length}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Order Details</h2>
            <p><strong>ID:</strong> {selectedOrder.id}</p>
            <p><strong>Total Amount:</strong> ${selectedOrder.totalAmount?.toFixed(2)}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">User Information</h3>
              {(() => {
                const user = allUsers.find((u) => u.id === selectedOrder.userId);
                return user ? (
                  <>
                    <p><strong>Name:</strong> {user.fullName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </>
                ) : (
                  <p className="text-gray-600">User not found</p>
                );
              })()}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">Book Information</h3>
              {(() => {
                const book = allBooks.find((b) => b.id === selectedOrder.bookId);
                return book ? (
                  <div className="flex items-center gap-2">
                    {book.coverImage && (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div>
                      <p><strong>Title:</strong> {book.title}</p>
                      <p><strong>Author:</strong> {book.author}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Book not found</p>
                );
              })()}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Confirm Status Update</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to update the status to "{newStatus}"?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelUpdateStatus}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateStatus}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Confirm Deletion</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete this order?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;