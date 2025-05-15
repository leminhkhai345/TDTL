import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import {deleteDocument } from '../src/API/api';

const SellHistoryPage = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Lấy danh sách listings
  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserListings(currentPage, pageSize);
      setListings(data.items);
      setTotal(data.total);
      setCurrentPage(data.page);
      setPageSize(data.pageSize);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchListings();
    }
  }, [currentPage, isLoggedIn]);

  // Mở modal xác nhận xóa
  const openDeleteModal = (listing) => {
    setSelectedListing(listing);
    setDeleteModalOpen(true);
  };

  // Xử lý xóa listing
  const handleDelete = async () => {
    try {
      await deleteDocument(selectedListing.documentId); // Xóa tài liệu liên quan
      setListings((prev) => prev.filter((item) => item.listingId !== selectedListing.listingId));
      setTotal((prev) => prev - 1);
      toast.success('Listing deleted successfully!');
      setDeleteModalOpen(false);
      setSelectedListing(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing');
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
      setDeleteModalOpen(false);
      setSelectedListing(null);
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-6">{error}</div>;
  }

  return (
    <div className="relative">
      <div className={`max-w-7xl mx-auto px-4 py-6 transition-all duration-300 ${deleteModalOpen ? 'blur-sm' : ''}`}>
        <h1 className="text-2xl font-bold mb-6">Sell History</h1>
        {listings.length === 0 ? (
          <p className="text-center text-gray-600">No sell listings found.</p>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-1/3">Book Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-1/6">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-1/6">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-1/6">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-1/4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((item) => (
                    <tr
                      key={item.listingId}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal break-words" title={item.title}>
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.price !== null ? `$${item.price.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.categoryName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.statusName === 'Listed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.statusName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex space-x-2">
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Phân trang */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {listings.length} of {total} items
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal xác nhận xóa */}
      {deleteModalOpen && (
        <>
          <div className="fixed inset-0 z-40 backdrop-filter backdrop-blur-[4px]"></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-red-800">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete <strong>{selectedListing.title}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SellHistoryPage;