import React, { useState, useEffect, useMemo } from "react";
import { getMyListings, getCategories } from "../src/API/api";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faEdit, faTrash, faTimes,  // Add this
  faSave   } from "@fortawesome/free-solid-svg-icons";

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]); // Add new state for categories
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    price: '',
    description: '',
    categoryId: '',
  });
  const [rejectReason, setRejectReason] = useState('');
  const pageSize = 10;
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy userId từ query string
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");

  const fetchListings = async () => {
    setLoading(true);
    try {
      console.log('Calling getMyListings:', { page, pageSize, userId });
      const data = await getMyListings(page, pageSize, userId ? { userId } : {});
      console.log('getMyListings response:', data);
      setListings(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching listings:', err);
      toast.error(err.message || 'Failed to fetch my listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, userId]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Search/filter FE (nếu muốn)
  const filteredListings = useMemo(() => {
    if (!search) return listings;
    return listings.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(search.toLowerCase())) ||
        (item.author && item.author.toLowerCase().includes(search.toLowerCase()))
    );
  }, [listings, search]);

  // Phân trang FE
  const paginatedListings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize));

  // Add handlers for edit/delete
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateListing(selectedListing.listingId, editForm);
      toast.success('Listing updated successfully');
      setEditMode(false);
      fetchListings(); // Refresh listings
    } catch (err) {
      toast.error(err.message || 'Failed to update listing');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      await deleteListing(selectedListing.listingId);
      toast.success('Listing deleted successfully');
      setSelectedListing(null);
      fetchListings(); // Refresh listings
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing');
    }
  };

  // Modify table columns to remove Actions
  const tableContent = (
    <table className="w-full table-fixed">
      <thead className="bg-gray-50">
        <tr>
          <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
          <th className="w-[30%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
          <th className="w-[20%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Author</th>
          <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
          <th className="w-[15%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
          <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {paginatedListings.map((listing) => (
          <tr
            key={listing.listingId}
            className={`hover:bg-gray-50 transition-colors cursor-pointer ${
              selectedListing?.listingId === listing.listingId ? 'bg-blue-50' : ''
            }`}
            onClick={() => {
              setSelectedListing(listing);
              setEditMode(false);
              setEditForm({
                title: listing.documentTitle,
                author: listing.author,
                price: listing.price,
                description: listing.description,
                categoryId: listing.categoryId,
              });
            }}
          >
            <td className="px-6 py-4 text-sm text-gray-900">
              <img
                src={listing.imageUrl || "https://via.placeholder.com/150"}
                alt={listing.documentTitle}
                className="w-10 h-10 object-cover rounded"
                onClick={e => { e.stopPropagation(); navigate(`/books/${listing.listingId}`); }}
                style={{ cursor: "pointer" }}
              />
            </td>
            <td className="px-6 py-4">{listing.documentTitle}</td>
            <td className="px-6 py-4 text-sm text-gray-500">{listing.author}</td>
            <td className="px-6 py-4 text-sm text-gray-500">
              {listing.price ? `$${listing.price}` : "Not set"}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{listing.categoryName}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                listing.statusName === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : listing.statusName === 'Pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {listing.statusName}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Add listing details section
  const listingDetails = selectedListing && (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Listing Details</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {editMode ? 'Cancel Edit' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {editMode ? (
        <form onSubmit={handleEdit} className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="relative">
              <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                required
              />
            </div>

            <div className="relative">
              <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.author}
                onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                required
              />
            </div>

            <div className="relative">
              <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="relative">
              <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Category
              </label>
              <select
                value={editForm.categoryId}
                onChange={(e) => setEditForm({...editForm, categoryId: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTimes} />
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSave} />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <img
              src={selectedListing.imageUrl || "https://via.placeholder.com/300"}
              alt={selectedListing.documentTitle}
              className="w-full h-[300px] object-cover rounded-lg"
            />
          </div>
          <div className="space-y-4">
            <p><span className="font-semibold">Title:</span> {selectedListing.documentTitle}</p>
            <p><span className="font-semibold">Author:</span> {selectedListing.author}</p>
            <p><span className="font-semibold">Price:</span> ${selectedListing.price}</p>
            <p><span className="font-semibold">Category:</span> {selectedListing.categoryName}</p>
            <p><span className="font-semibold">Status:</span> 
              <span className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                selectedListing.statusName === 'Active' ? 'bg-green-100 text-green-800' :
                selectedListing.statusName === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedListing.statusName}
              </span>
            </p>
            <p><span className="font-semibold">Description:</span> {selectedListing.description}</p>
          </div>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    // Check location state for listing details
    if (location.state?.showDetails) {
      const listing = listings.find(l => l.listingId === location.state.listingId);
      if (listing) {
        setSelectedListing(listing);
        if (location.state.rejectReason) {
          setRejectReason(location.state.rejectReason);
        }
      }
    }
  }, [location, listings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8">
          <div className="relative mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center">
              My Listings
            </h1>
            <p className="text-gray-500 text-center mt-2">Manage your listed books</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
              <div className="relative flex-1">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
              <button
                onClick={fetchListings}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSyncAlt} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : paginatedListings.length === 0 ? (
              <p className="text-center text-gray-600">No books found.</p>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md"
              >
                {tableContent}
              </motion.div>
            )}
            {/* Pagination */}
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
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
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
          </div>
          {listingDetails}
        </div>
      </div>

      {/* Listing Details Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 backdrop-blur-[6px] bg-white/30" />
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Listing Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="font-medium">Title:</label>
                  <p>{selectedListing.title}</p>
                </div>

                <div>
                  <label className="font-medium">Status:</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedListing.status === 'Active' ? 'bg-green-100 text-green-800' :
                    selectedListing.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedListing.status}
                  </div>
                </div>

                {rejectReason && (
                  <div>
                    <label className="font-medium text-red-600">Rejection Reason:</label>
                    <p className="text-red-600">{rejectReason}</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedListing(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;