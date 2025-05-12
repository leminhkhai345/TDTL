import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getMyInventory, updateDocument, deleteDocument, getCategories } from '../src/API/api';

const SellHistoryPage = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editFormData, setEditFormData] = useState({
    Title: '',
    CategoryId: '',
    Author: '',
    Condition: 'Good',
    Price: '',
    Description: '',
    ImageUrl: '',
  });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Lấy danh mục từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        toast.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Lấy danh sách sách
  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyInventory(currentPage, pageSize);
      const mappedItems = data.items.map((item) => ({
        documentId: item.documentId,
        title: item.title || 'N/A',
        price: item.price !== undefined && item.price !== null ? item.price : null,
        categoryId: item.categoryId,
        categoryName: item.categoryName || 'Unknown',
        statusName: item.statusName || 'Unknown',
        author: item.author || 'Unknown',
        condition: item.condition || 'Good',
        description: item.description || '',
        imageUrl: item.imageUrl || '',
      }));

      setInventory(mappedItems);
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
    fetchInventory();
  }, [currentPage]);

  // Mở modal chỉnh sửa
  const openEditModal = (document) => {
    setSelectedDocument(document);
    setEditFormData({
      Title: document.title || '',
      CategoryId: document.categoryId || '',
      Author: document.author || '',
      Condition: document.condition || 'Good',
      Price: document.price || '',
      Description: document.description || '',
      ImageUrl: document.imageUrl || '',
    });
    setEditModalOpen(true);
  };

  // Xử lý thay đổi form chỉnh sửa
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý lưu chỉnh sửa
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
      };
      await updateDocument(selectedDocument.documentId, updateData);
      setInventory((prev) =>
        prev.map((item) =>
          item.documentId === selectedDocument.documentId
            ? {
                ...item,
                ...updateData,
                categoryName: categories.find((cat) => cat.categoryId === updateData.CategoryId)?.categoryName || item.categoryName,
              }
            : item
        )
      );
      toast.success('Book updated successfully!');
      setEditModalOpen(false);
      setSelectedDocument(null);
    } catch (err) {
      toast.error(err.message);
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    }
  };

  // Mở modal xác nhận xóa
  const openDeleteModal = (document) => {
    setSelectedDocument(document);
    setDeleteModalOpen(true);
  };

  // Xử lý xóa
  const handleDelete = async () => {
    try {
      await deleteDocument(selectedDocument.documentId);
      setInventory((prev) => prev.filter((item) => item.documentId !== selectedDocument.documentId));
      setTotal((prev) => prev - 1);
      toast.success('Book deleted successfully!');
      setDeleteModalOpen(false);
      setSelectedDocument(null);
    } catch (err) {
      if (err.message.includes('NotFound')) {
        toast.error(`Document with ID ${selectedDocument.documentId} not found.`);
      } else if (err.message.includes('Forbidden')) {
        toast.error('You do not have permission to delete this document.');
      } else if (err.message.includes('Conflict')) {
        toast.error('Cannot delete due to invalid status or ongoing transaction.');
      } else if (err.message.includes('ID không hợp lệ')) {
        toast.error('Invalid document ID.');
      } else {
        toast.error(err.message || 'Failed to delete book.');
      }
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
      setDeleteModalOpen(false);
      setSelectedDocument(null);
    }
  };

  // Xử lý hủy yêu cầu bán
  const cancelSell = async (documentId) => {
    try {
      const updateData = { StatusId: 3 }; // Giả định StatusId 3 là "Cancelled"
      await updateDocument(documentId, updateData);
      setInventory((prev) =>
        prev.map((item) =>
          item.documentId === documentId ? { ...item, statusName: 'Cancelled', documentStatusId: 3 } : item
        )
      );
      toast.success('Sell request cancelled successfully!');
    } catch (err) {
      toast.error(err.message);
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading || categoriesLoading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-6">{error}</div>;
  }

  return (
    <div className="relative">
      <div className={`max-w-7xl mx-auto px-4 py-6 transition-all duration-300 ${editModalOpen || deleteModalOpen ? 'blur-sm' : ''}`}>
        <h1 className="text-2xl font-bold mb-6">Sell History</h1>
        {inventory.length === 0 ? (
          <p className="text-center text-gray-600">No sell requests found.</p>
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
                  {inventory.map((item) => (
                    <tr
                      key={item.documentId}
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
                            item.statusName === 'InStock'
                              ? 'bg-blue-100 text-blue-800'
                              : item.statusName === 'Listed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.statusName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                        {item.statusName === 'Listed' && (
                          <button
                            onClick={() => cancelSell(item.documentId)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Phân trang */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {inventory.length} of {total} items
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

      {/* Modal chỉnh sửa */}
      {editModalOpen && (
        <>
          <div className="fixed inset-0 z-40 backdrop-filter backdrop-blur-[4px]"></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
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
                  <option value="">Select a category</option>
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
                  maxLength={255}
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
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Modal xác nhận xóa */}
      {deleteModalOpen && (
        <>
          <div className="fixed inset-0 z-40 backdrop-filter backdrop-blur-[4px]"></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-red-800">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete <strong>{selectedDocument.title}</strong>?
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