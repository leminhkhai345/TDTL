import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faPlus, faEdit, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';

const AdminCategoriesPage = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]); // State để lưu danh sách category
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ categoryName: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  // Kiểm tra quyền admin và chuyển hướng nếu không có quyền
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please log in to access this page');
      navigate('/login');
    } else if (!isAdmin()) {
      toast.error('Access denied: Admin role required');
      navigate('/');
    }
  }, [isLoggedIn, isAdmin, navigate]);

  // Lấy danh sách category khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      !search || category.categoryName.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredCategories.slice(startIndex, startIndex + limit);
  }, [filteredCategories, page]);

  useEffect(() => {
    const maxPage = Math.ceil(filteredCategories.length / limit);
    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    } else if (filteredCategories.length === 0) {
      setPage(1);
    }
  }, [filteredCategories, page]);

  const handleSaveCategory = async () => {
    const trimmedName = formData.categoryName.trim();
    if (!trimmedName) {
      toast.error('Category name is required');
      return;
    }
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      toast.error('Category name must be between 3 and 50 characters');
      return;
    }
    if (!/^[\w\s-]+$/.test(trimmedName)) {
      toast.error('Category name can only contain letters, numbers, spaces, and hyphens');
      return;
    }
    try {
      setIsLoading(true);
      if (selectedCategory) {
        await updateAdminCategory(selectedCategory.categoryId, { categoryName: trimmedName });
        toast.success('Category updated successfully');
      } else {
        await createAdminCategory({ categoryName: trimmedName });
        toast.success('Category created successfully');
      }
      // Làm mới danh sách category
      const data = await getCategories();
      setCategories(data);
      closeModal();
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        toast.error('Please log in as an admin to perform this action');
        navigate('/login');
      } else if (err.message.includes('Tên danh mục đã tồn tại')) {
        toast.error('Category name already exists');
      } else if (err.message.includes('Danh mục không tồn tại')) {
        toast.error('Category not found');
      } else if (err.message.includes('ID trong URL không khớp')) {
        toast.error('Invalid category ID');
      } else if (err.message.includes('Không thể xóa danh mục này vì đang có tài liệu tham chiếu')) {
        toast.error('Cannot delete category because it is referenced by documents');
      } else {
        toast.error(err.message || 'Failed to save category');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (categoryId) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      await deleteAdminCategory(categoryToDelete);
      toast.success('Category deleted successfully');
      // Làm mới danh sách category
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        toast.error('Please log in as an admin to perform this action');
        navigate('/login');
      } else if (err.message.includes('Danh mục không tồn tại')) {
        toast.error('Category not found');
      } else if (err.message.includes('Không thể xóa danh mục này vì đang có tài liệu tham chiếu')) {
        toast.error('Cannot delete category because it is referenced by documents');
      } else {
        toast.error(err.message || 'Failed to delete category');
      }
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const openModal = (category = null) => {
    if (!isAdmin()) {
      toast.error('Please log in as an admin to perform this action');
      navigate('/login');
      return;
    }
    setSelectedCategory(category);
    setFormData(category ? { categoryName: category.categoryName } : { categoryName: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleRefresh = async () => {
    setPage(1);
    setSearch('');
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      toast.error(err.message || 'Failed to refresh categories');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 animate-fade-in mb-4 sm:mb-0">
            Manage Categories
          </h1>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
              disabled={isLoading}
              title="Refresh the category list"
            >
              <FontAwesomeIcon icon={faSyncAlt} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => openModal()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md ${
                isAdmin()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }`}
              disabled={!isAdmin() || isLoading}
              title={isAdmin() ? 'Add a new category' : 'Admin access required'}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add New Category
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by category name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={isLoading}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-6 text-gray-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            Loading categories...
          </div>
        ) : paginatedCategories.length === 0 ? (
          <p className="text-center text-gray-600 py-6">
            {search ? 'No categories match your search.' : 'No categories found.'}
          </p>
        ) : (
          <>
            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category) => (
                    <tr key={category.categoryId} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{category.categoryId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{category.categoryName}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          type="button"
                          onClick={() => openModal(category)} // Nút Update
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2 transition-colors shadow-sm"
                          disabled={isLoading || !isAdmin()}
                          title="Update this category"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Update
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.categoryId)} // Nút Delete
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                          disabled={isLoading || !isAdmin()}
                          title="Delete this category"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
              {paginatedCategories.map((category) => (
                <div
                  key={category.categoryId}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        ID: {category.categoryId}
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {category.categoryName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openModal(category)} // Nút Update
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                        disabled={isLoading || !isAdmin()}
                        title="Update this category"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Update
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.categoryId)} // Nút Delete
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        disabled={isLoading || !isAdmin()}
                        title="Delete this category"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {Math.ceil(filteredCategories.length / limit)}
          </span>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={paginatedCategories.length < limit || page * limit >= filteredCategories.length || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            Next
          </button>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-blue-800">
                {selectedCategory ? 'Update Category' : 'Add Category'}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-shadow"
                    placeholder="Enter category name (3-50 characters)"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Only letters, numbers, spaces, and hyphens are allowed.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors shadow-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-blue-700">Confirm Deletion</h2>
              <p className="mb-4 text-gray-700">Are you sure you want to delete this category?</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 shadow-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm disabled:opacity-50 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                  {isLoading ? 'Deleting...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;