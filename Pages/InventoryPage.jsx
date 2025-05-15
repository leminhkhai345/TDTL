import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { getMyInventory, deleteDocument, updateDocument, createListing, getCategories, getListingTypes } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';

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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
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

  // Fetch categories and listing types
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const [categoriesData, listingTypesData] = await Promise.all([
          getCategories(),
          getListingTypes(),
        ]);
        setCategories(categoriesData);
        setListingTypes(listingTypesData);
      } catch (err) {
        toast.error('Failed to load categories or listing types');
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch inventory
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyInventory(page, pageSize);
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

  // Filter inventory by search
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) =>
      search
        ? item.title.toLowerCase().includes(search.toLowerCase())
        : true
    );
  }, [inventory, search]);

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
      ListingType: '',
      DesiredDocumentId: '',
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

    try {
      const listingData = {
        DocumentId: itemToList.documentId,
        Price: listFormData.Price ? parseFloat(listFormData.Price) : null,
        Description: listFormData.Description || null,
        ListingType: parseInt(listFormData.ListingType),
        DesiredDocumentId: listFormData.ListingType === '1' ? parseInt(listFormData.DesiredDocumentId) : null,
      };
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
    fetchInventory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">My Inventory</h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
            Refresh
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
          />
        </div>

        {loading && <div className="text-center py-6 text-gray-600">Loading...</div>}
        {error && <div className="text-center text-red-600 py-6">{error}</div>}
        {!loading && !error && filteredInventory.length === 0 && (
          <div className="text-center py-6 text-gray-600">No books in inventory.</div>
        )}

        {!loading && filteredInventory.length > 0 && (
          <>
            {/* Desktop view - Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-0">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Author</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.documentId} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <img
                          src={getValidImageUrl(item.imageUrl)}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.author}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.price !== null ? `$${parseFloat(item.price).toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.categoryName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.statusName}</td>
                      <td className="px-6 py-4 text-sm flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Edit book"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.documentId)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete book"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                        {item.statusName !== 'Listed' && (
                          <button
                            onClick={() => handleListForSale(item)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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

            {/* Mobile view - Cards */}
            <div className="md:hidden space-y-4">
              {filteredInventory.map((item) => (
                <div
                  key={item.documentId}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-2">
                    <img
                      src={getValidImageUrl(item.imageUrl)}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded mr-4"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                    />
                    <div>
                      <p className="text-lg font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">Author: {item.author}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Price: {item.price !== null ? `$${parseFloat(item.price).toFixed(2)}` : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">Category: {item.categoryName}</p>
                  <p className="text-sm text-gray-600">Status: {item.statusName}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.documentId)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                    {item.statusName !== 'Listed' && (
                      <button
                        onClick={() => handleListForSale(item)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <FontAwesomeIcon icon={faPlus} /> List
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-blue-700">Confirm Deletion</h2>
              <p className="mb-4 text-gray-700">Are you sure you want to delete this book from your inventory?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Book Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-blue-800">Edit Book</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Book Title *</label>
                  <input
                    type="text"
                    name="Title"
                    value={editFormData.Title}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Category *</label>
                  <select
                    name="CategoryId"
                    value={editFormData.CategoryId}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div>
                  <label className="block font-medium mb-1">Author</label>
                  <input
                    type="text"
                    name="Author"
                    value={editFormData.Author}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Condition *</label>
                  <select
                    name="Condition"
                    value={editFormData.Condition}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    name="Price"
                    value={editFormData.Price}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    name="Description"
                    value={editFormData.Description}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Image URL</label>
                  <input
                    type="url"
                    name="ImageUrl"
                    value={editFormData.ImageUrl}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">ISBN</label>
                  <input
                    type="text"
                    name="Isbn"
                    value={editFormData.Isbn}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Edition</label>
                  <input
                    type="text"
                    name="Edition"
                    value={editFormData.Edition}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Publication Year</label>
                  <input
                    type="number"
                    name="PublicationYear"
                    value={editFormData.PublicationYear}
                    onChange={handleEditChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1800"
                    max="2026"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-blue-800">List Book for Sale</h2>
              <form onSubmit={handleListSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Book Title</label>
                  <input
                    type="text"
                    value={itemToList.title}
                    className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    name="Price"
                    value={listFormData.Price}
                    onChange={handleListChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="Enter price (required for sell)"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    name="Description"
                    value={listFormData.Description}
                    onChange={handleListChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Describe the book (optional)"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Listing Type *</label>
                  <select
                    name="ListingType"
                    value={listFormData.ListingType}
                    onChange={handleListChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select listing type</option>
                    {listingTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                {listFormData.ListingType === '1' && (
                  <div>
                    <label className="block font-medium mb-1">Desired Book ID *</label>
                    <input
                      type="number"
                      name="DesiredDocumentId"
                      value={listFormData.DesiredDocumentId}
                      onChange={handleListChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      placeholder="Enter ID of desired book for exchange"
                      required
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelList}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
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