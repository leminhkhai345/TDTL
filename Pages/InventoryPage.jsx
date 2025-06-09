import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { getMyInventory, deleteDocument, updateDocument, createListing, getCategories, getListingTypes,getPublicPaymentMethods } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faTrash, faEdit, faPlus, faBook } from '@fortawesome/free-solid-svg-icons';

const getValidImageUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return 'https://via.placeholder.com/150';
  }
  return url;
};

const InventoryPage = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [listingTypes, setListingTypes] = useState([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToList, setItemToList] = useState(null);
  const [listFormData, setListFormData] = useState({
    Price: '',
    Description: '',
    ListingType: '',
    DesiredDocumentId: '',
    PaymentMethodIds: [],
  });
  const [editFormData, setEditFormData] = useState({
    Title: '',
    CategoryId: '',
    Author: '',
    Condition: 'Good',
    Price: '',
    Description: '',
    ImageUrl: '',
    Isbn: '',
    Edition: '',
    PublicationYear: '',
  });
  const pageSize = 10;

  // Check login status
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please log in to access your inventory');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch categories, listing types, and payment methods
  const fetchMetadata = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, listingTypesResponse, paymentMethodsResponse] = await Promise.all([
        getCategories().catch((err) => {
          console.error('Failed to fetch categories:', {
            message: err.message,
            stack: err.stack,
            endpoint: `${EXCHANGE_API_URL}/api/Categories`,
          });
          toast.error('Failed to load categories');
          return [];
        }),
        getListingTypes().catch((err) => {
          console.error('Failed to fetch listing types:', {
            message: err.message,
            stack: err.stack,
            endpoint: `${EXCHANGE_API_URL}/api/metadata/listing-types`,
          });
          toast.error('Failed to load listing types');
          return [];
        }),
        getPublicPaymentMethods().catch((err) => {
          console.error('Failed to fetch payment methods:', {
            message: err.message,
            stack: err.stack,
            endpoint: `${EXCHANGE_API_URL}/api/PaymentMethods`,
          });
          toast.error('Failed to load payment methods');
          return [];
        }),
      ]);

      // Chuẩn hóa dữ liệu
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : [];
      const listingTypesData = Array.isArray(listingTypesResponse) && listingTypesResponse.length > 0
        ? listingTypesResponse
        : [{ value: '0', name: 'Sell' }, { value: '1', name: 'Exchange' }];
      const paymentMethodsData = Array.isArray(paymentMethodsResponse)
        ? paymentMethodsResponse.filter((method) => method && typeof method === 'object' && method.isEnabled)
        : [];

      // Log dữ liệu để debug
      console.log('Fetched metadata:', {
        categories: categoriesData,
        listingTypes: listingTypesData,
        paymentMethods: paymentMethodsData,
        timestamp: new Date().toISOString(),
      });

      setCategories(categoriesData);
      setListingTypes(listingTypesData);
      setAvailablePaymentMethods(paymentMethodsData);

      if (!categoriesData.length && !listingTypesData.length && !paymentMethodsData.length) {
        toast.warn('No metadata loaded. Please check API or network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (e) => {
    const { value, checked } = e.target;
    const paymentMethodId = parseInt(value);
    setListFormData((prev) => {
      const newPaymentMethodIds = checked
        ? [...prev.PaymentMethodIds, paymentMethodId]
        : prev.PaymentMethodIds.filter((id) => id !== paymentMethodId);
      console.log('Updated PaymentMethodIds:', newPaymentMethodIds);
      return { ...prev, PaymentMethodIds: newPaymentMethodIds };
    });
  };
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch inventory
 const fetchInventory = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await getMyInventory(page, pageSize);
    console.log('Raw response from getMyInventory:', data); // <--- Thêm dòng này để kiểm tra dữ liệu thực tế
    setInventory(data.items || []);
    setTotalPages(data.totalPages || 1);
  } catch (err) {
    setError(err.message || 'Failed to load inventory');
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
      fetchInventory();
    }
  }, [page, isLoggedIn]);

  // Get unique statuses from inventory
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(inventory.map((item) => item.statusName))];
    return uniqueStatuses.sort();
  }, [inventory]);

  // Filter inventory by search and status
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) =>
      (search ? item.title.toLowerCase().includes(search.toLowerCase()) : true) &&
      (statusFilter ? item.statusName === statusFilter : true)
    );
  }, [inventory, search, statusFilter]);

  // Handle delete
  const handleDelete = useCallback((itemId) => {
    setItemToDelete(itemId);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await deleteDocument(itemToDelete);
      toast.success('Book deleted from inventory successfully');
      fetchInventory();
    } catch (err) {
      toast.error(err.message || 'Failed to delete book');
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete]);

  const cancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  }, []);

  // Handle edit
  const handleEdit = useCallback((item) => {
    setItemToEdit(item);
    setEditFormData({
      Title: item.title || '',
      CategoryId: item.categoryId || '',
      Author: item.author || '',
      Condition: item.condition || 'Good',
      Price: item.price || '',
      Description: item.description || '',
      ImageUrl: item.imageUrl || '',
      Isbn: item.isbn || '',
      Edition: item.edition || '',
      PublicationYear: item.publicationYear || '',
    });
    setIsEditModalOpen(true);
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.Title || !editFormData.CategoryId || !editFormData.Condition) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const updateData = {
        Title: editFormData.Title,
        CategoryId: parseInt(editFormData.CategoryId),
        Author: editFormData.Author || null,
        Condition: editFormData.Condition,
        Price: editFormData.Price ? parseFloat(editFormData.Price) : null,
        Description: editFormData.Description || null,
        ImageUrl: editFormData.ImageUrl || null,
        Isbn: editFormData.Isbn || null,
        Edition: editFormData.Edition || null,
        PublicationYear: editFormData.PublicationYear ? parseInt(editFormData.PublicationYear) : null,
      };
      await updateDocument(itemToEdit.documentId, updateData);
      toast.success('Book updated successfully!');
      setIsEditModalOpen(false);
      setItemToEdit(null);
      fetchInventory();
    } catch (err) {
      toast.error(err.message || 'Failed to update book');
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    }
  };

  const cancelEdit = () => {
    setIsEditModalOpen(false);
    setItemToEdit(null);
  };

  // Handle list for sale
const handleListForSale = useCallback((item) => {
    setItemToList(item);
    setListFormData({
      Price: item.price || '',
      Description: item.description || '',
      ListingType: '0', // Mặc định là Sell (từ Bước 2)
      DesiredDocumentId: '',
      PaymentMethodIds: [], // Từ Bước 3
    });
    console.log('Opening List Book Modal with listFormData:', {
      Price: item.price || '',
      Description: item.description || '',
      ListingType: '0',
      DesiredDocumentId: '',
      PaymentMethodIds: [],
    });
    setIsListModalOpen(true);
  }, []);

  const handleListChange = (e) => {
    const { name, value } = e.target;
    setListFormData((prev) => ({ ...prev, [name]: value }));
  };

 const handleListSubmit = async (e) => {
  e.preventDefault();
  if (!listFormData.ListingType) {
    toast.error('Please select a listing type.');
    return;
  }
  if (listFormData.ListingType === '1' && !listFormData.DesiredDocumentId) {
    toast.error('Please enter the desired book ID for exchange listing.');
    return;
  }
  if (listFormData.ListingType === '0' && !listFormData.Price) {
    toast.error('Please enter a price for sell listing.');
    return;
  }
  if (listFormData.ListingType === '0' && listFormData.PaymentMethodIds.length > 0) {
    const validPaymentMethodIds = availablePaymentMethods.map((method) => method.paymentMethodId);
    const invalidIds = listFormData.PaymentMethodIds.filter((id) => !validPaymentMethodIds.includes(id));
    if (invalidIds.length > 0) {
      console.log('Invalid PaymentMethodIds detected:', {
        invalidIds,
        PaymentMethodIds: listFormData.PaymentMethodIds,
        validPaymentMethodIds,
      });
      toast.error('Invalid payment methods selected. Please choose valid methods.');
      return;
    }
  }
  try {
    const listingData = {
      DocumentId: itemToList.documentId,
      Price: listFormData.Price ? parseFloat(listFormData.Price) : null,
      Description: listFormData.Description || null,
      ListingType: parseInt(listFormData.ListingType),
      DesiredDocumentId: listFormData.ListingType === '1' ? parseInt(listFormData.DesiredDocumentId) : null,
      // Chỉ gửi PaymentMethodIds khi có chọn phương thức thanh toán
      PaymentMethodIds: listFormData.ListingType === '0' && listFormData.PaymentMethodIds.length > 0 
        ? listFormData.PaymentMethodIds 
        : null // Khi không chọn thì gửi null để backend hiểu là chấp nhận tất cả
    };
    console.log('Sending createListing data:', listingData);
    await createListing(listingData);
    toast.success('Book listed successfully!');
    setIsListModalOpen(false);
    setItemToList(null);
    fetchInventory();
  } catch (err) {
    console.error('Listing failed:', err);
    toast.error(err.message || 'Failed to list book');
    if (err.message.includes('Unauthorized')) {
      navigate('/login');
    }
  }
};

  const cancelList = () => {
    setIsListModalOpen(false);
    setItemToList(null);
  };

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setPage(1);
    setSearch('');
    setStatusFilter('');
    fetchInventory();
  }, []);

  // Add logging to check data
  console.log('Inventory items:', inventory);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-semibold text-blue-800">My Inventory</h1>
          <div className="flex gap-3">
  <button
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
    onClick={handleRefresh}
    disabled={loading}
  >
    <FontAwesomeIcon icon={faSyncAlt} />
    Refresh
  </button>
  <button
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors shadow-md"
    onClick={() => navigate('/sell')}
  >
    <FontAwesomeIcon icon={faBook} />
    Add Document
  </button>
</div>
        </div>

        {/* Search and Status Filter */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 via-white to-blue-100 rounded-2xl shadow-md px-4 py-3">
            <div className="grid grid-cols-4 gap-4 items-end">
              {/* Search chiếm 3 phần */}
              <div className="relative col-span-3">
                <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide pointer-events-none z-10">
                  Search by Title
                </label>
                <input
                  type="text"
                  placeholder="Enter book title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all duration-200 text-base bg-white"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                  </svg>
                </span>
              </div>
              {/* Filter chiếm 1 phần */}
              <div className="relative col-span-1">
                <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide pointer-events-none z-10">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all duration-200 text-base bg-white"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
        {error && <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg mb-6">{error}</div>}
        {!loading && !error && filteredInventory.length === 0 && (
          <div className="text-center py-6 text-gray-600 text-lg">No books in inventory.</div>
        )}

        {/* Inventory Table */}
        {!loading && filteredInventory.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full table-auto">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-2 text-left text-sm font-semibold text-gray-700">Image</th>
                    <th className="px-6 py-2 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-6 py-2 text-left text-sm font-semibold text-gray-700">Author</th>
                    <th className="px-6 py-2 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.documentId} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-2">
                        <img
                          src={getValidImageUrl(item.imageUrl)}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                        />
                      </td>
                      <td className="px-6 py-2 text-base text-gray-900">{item.title}</td>
                      <td className="px-6 py-2 text-base text-gray-900">{item.author}</td>
                      <td className="px-6 py-2 text-base text-gray-900">
                        {item.price !== null ? `$${parseFloat(item.price).toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-2 text-base text-gray-900">{item.categoryName}</td>
                      <td className="px-6 py-2 text-base text-gray-900">{item.statusName}</td>
                      <td className="px-6 py-2 flex space-x-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
                          title="Edit book"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.documentId)}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
                          title="Delete book"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                        {item.statusName !== 'Listed' && (
                          <button
                            onClick={() => handleListForSale(item)}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
                            title="List for sale"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:scale-100 disabled:shadow-none"
              >
                Previous
              </button>
              <span className="text-gray-600 text-lg">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:scale-100 disabled:shadow-none"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-semibold mb-6 text-blue-800">Confirm Deletion</h2>
              <p className="mb-6 text-gray-700 text-lg">Are you sure you want to delete this book from your inventory?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Book Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-[6px] bg-white/30"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 animate-fade-in">
              <button
                type="button"
                onClick={cancelEdit}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-3xl font-bold mb-8 text-blue-800 text-center">Edit Book</h2>
              <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column */}
                <div className="space-y-6">
                  <div className="relative">
                    <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Book Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Title"
                      value={editFormData.Title}
                      onChange={handleEditChange}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                      required
                      maxLength={255}
                    />
                  </div>
                  <div className="relative">
                    <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Author
                    </label>
                    <input
                      type="text"
                      name="Author"
                      value={editFormData.Author}
                      onChange={handleEditChange}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                      maxLength={100}
                    />
                  </div>
                  <div className="relative">
                    <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="CategoryId"
                      value={editFormData.CategoryId}
                      onChange={handleEditChange}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="Condition"
                      value={editFormData.Condition}
                      onChange={handleEditChange}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                      required
                    >
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
                {/* Right column */}
                <div className="space-y-6">
                  <div className="relative">
                    <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      name="Price"
                      value={editFormData.Price}
                      onChange={handleEditChange}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="relative">
                    <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Description
                    </label>
                    <textarea
                      name="Description"
                      value={editFormData.Description}
                      onChange={handleEditChange}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                      rows={4}
                    />
                  </div>
                  <div className="relative">
                    <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="ImageUrl"
                      value={editFormData.ImageUrl}
                      onChange={handleEditChange}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                    />
                  </div>
                </div>
                {/* Action buttons */}
                <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List Book Modal */}
       {isListModalOpen && itemToList && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
    <div className="absolute inset-0 backdrop-blur-[6px] bg-white/30"></div>
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fade-in">
      <button
        type="button"
        onClick={cancelList}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
        aria-label="Close"
      >
        &times;
      </button>
      <h2 className="text-3xl font-bold mb-6 text-blue-800 text-center">List Book for Sale</h2>
      <form onSubmit={handleListSubmit} className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Book Title</label>
          <input
            type="text"
            value={itemToList.title}
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 text-lg cursor-not-allowed"
            disabled
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
          <input
            type="number"
            name="Price"
            value={listFormData.Price}
            onChange={handleListChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition"
            min="0"
            step="0.01"
            placeholder="Enter price (required for sell)"
            required={listFormData.ListingType === '0'}
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            name="Description"
            value={listFormData.Description}
            onChange={handleListChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition"
            rows={3}
            placeholder="Describe the book (optional)"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Listing Type *</label>
          <select
            name="ListingType"
            value={listFormData.ListingType}
            onChange={handleListChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition"
            required
          >
            <option value="">Select listing type</option>
            {listingTypes.map((type) => (
              <option key={type.value} value={String(type.value)}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        {listFormData.ListingType === '0' && (
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Methods</label>
            {availablePaymentMethods.length === 0 ? (
              <p className="text-red-600 text-sm">No payment methods available.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {availablePaymentMethods.map((method) => (
                  <label key={method.paymentMethodId} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={method.paymentMethodId}
                      checked={listFormData.PaymentMethodIds.includes(method.paymentMethodId)}
                      onChange={handlePaymentMethodChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{method.name}</span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Leave unchecked to default to COD.</p>
          </div>
        )}
        {listFormData.ListingType === '1' && (
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Desired Book ID *</label>
            <input
              type="number"
              name="DesiredDocumentId"
              value={listFormData.DesiredDocumentId}
              onChange={handleListChange}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition"
              min="1"
              placeholder="Enter ID of desired book for exchange"
              required
            />
          </div>
        )}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={cancelList}
            className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all text-lg font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all text-lg font-semibold"
            disabled={listingTypes.length === 0}
          >
            List
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default InventoryPage;