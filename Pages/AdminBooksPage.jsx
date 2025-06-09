import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminListings, approveListing, rejectListing, getCategories } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faCheck, faTimes, faSearch, faFilter, faChevronLeft, faChevronRight, faUserCog } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const AdminBooksPage = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [rawListings, setRawListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectListingId, setRejectListingId] = useState(null);
  const [rejectRowVersion, setRejectRowVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Check admin privileges
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please log in to access this page');
      navigate('/login');
    } else if (!isAdmin()) {
      toast.error('Access denied: Admin role required');
      navigate('/');
    }
  }, [isLoggedIn, isAdmin, navigate]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Failed to load categories');
        toast.error(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch listings
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        pageNumber: page,
        pageSize: pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined, 
        categoryFilter: categoryFilter !== 'all' ? categoryFilter : undefined,
      };
      const data = await getAdminListings(params);
      setRawListings(data.items || []);
      setTotalItems(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
      toast.error(err.message || 'Failed to load listings');
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter listings based on search, statusFilter, and categoryFilter
  const filteredListings = useMemo(() => {
    let result = rawListings;

    // Filter by search (title or ownerName)
    if (search.trim()) {
      const searchLower = search.trim().toLowerCase();
      result = result.filter(
        (listing) =>
          (listing.title && listing.title.toLowerCase().includes(searchLower)) ||
          (listing.ownerName && listing.ownerName.toLowerCase().includes(searchLower))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((listing) => listing.statusName === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter(
        (listing) => listing.categoryName && listing.categoryName.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    return result;
  }, [rawListings, search, statusFilter, categoryFilter]);

  // Reset page to 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  // Fetch listings when page/filters change
  useEffect(() => {
    if (isLoggedIn && isAdmin()) {
      fetchListings();
    }
  }, [page, statusFilter, categoryFilter, isLoggedIn, isAdmin]);

  // Handle approve listing
  const handleApprove = useCallback(
    async (listingId, rowVersion) => {
      try {
        setLoading(true);
        await approveListing(listingId, rowVersion);
        toast.success('Listing approved successfully');
        fetchListings();
      } catch (err) {
        toast.error(err.message || 'Failed to approve listing');
        if (err.message.includes('Unauthorized')) {
          navigate('/login');
        } else if (err.message.includes('ConcurrencyConflict')) {
          toast.error('Listing was modified by another user. Please refresh and try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // Handle reject listing
  const handleReject = useCallback(
    async (listingId, reason, rowVersion) => {
      try {
        setLoading(true);
        await rejectListing(listingId, reason, rowVersion);
        toast.success('Listing rejected successfully');
        fetchListings();
      } catch (err) {
        toast.error(err.message || 'Failed to reject listing');
        if (err.message.includes('Unauthorized')) {
          navigate('/login');
        } else if (err.message.includes('ConcurrencyConflict')) {
          toast.error('Listing was modified by another user. Please refresh and try again.');
        }
      } finally {
        setLoading(false);
        setIsRejectModalOpen(false);
        setRejectReason('');
        setRejectListingId(null);
        setRejectRowVersion(null);
      }
    },
    [navigate]
  );

  // Open reject modal
  const openRejectModal = useCallback((listingId, rowVersion) => {
    setRejectListingId(listingId);
    setRejectRowVersion(rowVersion);
    setIsRejectModalOpen(true);
  }, []);

  // View listing details
  const handleViewDetails = useCallback((listing) => {
    setSelectedListing(listing);
    setIsDetailsModalOpen(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedListing(null);
  }, []);

  const closeRejectModal = useCallback(() => {
    setIsRejectModalOpen(false);
    setRejectReason('');
    setRejectListingId(null);
    setRejectRowVersion(null);
  }, []);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setPage(1);
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setError(null);
    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12">
      <div className="max-w-[90vw] mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8">
          <div className="relative mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-center mt-2">Book Listings Management</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                Error: {error}
              </motion.div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-blue-800 mb-4 sm:mb-0"
                  >
                    <FontAwesomeIcon icon={faUserCog} className="mr-3" />
                    Manage Listing Requests
                  </motion.h1>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSyncAlt} className={loading ? 'animate-spin' : ''} />
                    Refresh
                  </motion.button>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md p-6 mb-8"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                      <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by title or owner..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FontAwesomeIcon icon={faFilter} />
                      <span>
                        Total listings: <strong>{filteredListings.length}</strong>
                      </span>
                    </div>
                    <div className="relative flex-1">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        disabled={loading}
                      >
                        <option value="all">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        disabled={loading || categories.length === 0}
                      >
                        <option value="all">All categories</option>
                        {categories.map((category) => (
                          <option key={category.categoryId} value={category.categoryName.toLowerCase()}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md"
                >
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                        <th className="w-[20%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                        <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                        <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                        <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                        <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
                        <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rawListings.map((listing) => (
                        <tr key={listing.listingId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {listing.imageUrl ? (
                              <img
                                src={listing.imageUrl}
                                alt={listing.title}
                                className="w-10 h-10 object-cover rounded"
                                onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                              />
                            ) : (
                              <span className="text-gray-500">No image</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewDetails(listing)}
                              className="text-blue-600 hover:underline"
                            >
                              {listing.title}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{listing.author || 'No information'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {listing.price ? `$${Number(listing.price).toFixed(2)}` : 'Not available'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{listing.categoryName || 'No information'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{listing.ownerName}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                listing.statusName === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : listing.statusName === 'Active'
                                  ? 'bg-green-100 text-green-800'
                                  : listing.statusName === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {listing.statusName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {listing.statusName === 'Pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApprove(listing.listingId, listing.rowVersion)}
                                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                  disabled={loading}
                                  title="Approve listing"
                                >
                                  <FontAwesomeIcon icon={faCheck} />
                                </button>
                                <button
                                  onClick={() => openRejectModal(listing.listingId, listing.rowVersion)}
                                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                  disabled={loading}
                                  title="Reject listing"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex justify-between items-center"
                >
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page <= 1 || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page <span className="font-medium">{page}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                    {' '}({totalItems} items)
                  </span>
                  <button
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </motion.div>

                {isDetailsModalOpen && selectedListing && (
                  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="space-y-6 p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg w-full max-w-4xl">
                      <div className="flex justify-end">
                        <button
                          onClick={closeDetailsModal}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          aria-label="Close modal"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xl" />
                        </button>
                      </div>

                      {/* Header */}
                      <div className="flex flex-col items-center border-b pb-6 mb-6">
                        <h2 className="text-3xl font-bold text-blue-800">Listing Details</h2>
                        <p className="text-gray-600">View listing information</p>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-2 gap-8">
                        {/* Left Column - Image */}
                        <div className="space-y-6">
                          {selectedListing.imageUrl ? (
                            <img
                              src={selectedListing.imageUrl}
                              alt={selectedListing.title}
                              className="w-full h-[400px] object-cover rounded-lg shadow-md"
                              onError={(e) => (e.target.src = 'https://via.placeholder.com/400')}
                            />
                          ) : (
                            <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-gray-500">No image available</span>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Details */}
                        <div className="space-y-6">
                          <div className="relative">
                            <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                              Title
                            </label>
                            <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                              {selectedListing.title}
                            </div>
                          </div>

                          <div className="relative">
                            <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                              Author
                            </label>
                            <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                              {selectedListing.author || "No information"}
                            </div>
                          </div>

                          <div className="relative">
                            <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                              Price
                            </label>
                            <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                              {selectedListing.price ? `$${Number(selectedListing.price).toFixed(2)}` : "Not available"}
                            </div>
                          </div>

                          <div className="relative">
                            <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                              Category
                            </label>
                            <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                              {selectedListing.categoryName || "No information"}
                            </div>
                          </div>

                          <div className="relative">
                            <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                              Status
                            </label>
                            <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 flex justify-center">
                              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                selectedListing.statusName === 'Active' 
                                  ? 'bg-green-100 text-green-800'
                                  : selectedListing.statusName === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {selectedListing.statusName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isRejectModalOpen && rejectListingId && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
                    >
                      <h2 className="text-xl font-bold mb-4 text-blue-800">Reject Listing</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block font-medium mb-1">Reason for Rejection *</label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            rows={4}
                            placeholder="Enter reason for rejection (max 500 characters)"
                            maxLength={500}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={closeRejectModal}
                            className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(rejectListingId, rejectReason, rejectRowVersion)}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            disabled={loading || !rejectReason.trim()}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBooksPage;