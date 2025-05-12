import React, { useState, useEffect, useMemo, useContext } from 'react';
import { DataContext } from '../src/contexts/DataContext';
import { createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const AdminCategoriesPage = () => {
  const { categories, loading, refreshData } = useContext(DataContext);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  const isAdmin = JSON.parse(localStorage.getItem('user'))?.role === 'admin';

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
    const trimmedName = formData.name.trim();
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
        await updateAdminCategory(selectedCategory.categoryId, { name: trimmedName });
        toast.success('Category updated successfully');
      } else {
        await createAdminCategory({ name: trimmedName });
        toast.success('Category created successfully');
      }
      refreshData();
      closeModal();
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        toast.error('Please log in as an admin to perform this action');
      } else if (err.message.includes('Tên danh mục đã tồn tại')) {
        toast.error('Category name already exists');
      } else if (err.message.includes('Danh mục không tồn tại')) {
        toast.error('Category not found');
      } else if (err.message.includes('ID trong URL không khớp')) {
        toast.error('Invalid category ID');
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
      refreshData();
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        toast.error('Please log in as an admin to perform this action');
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
    if (!isAdmin) {
      toast.error('Please log in as an admin to perform this action');
      return;
    }
    setSelectedCategory(category);
    setFormData(category ? { name: category.categoryName } : { name: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleRefresh = () => {
    setPage(1);
    setSearch('');
    refreshData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 animate-fade-in">Manage Categories</h1>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              disabled={loading || isLoading}
            >
              <FontAwesomeIcon icon={faSyncAlt} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => openModal()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isAdmin
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }`}
              disabled={!isAdmin || loading || isLoading}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Category
            </button>
          </div>
        </div>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by category name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading || isLoading}
          />
        </div>
        {loading ? (
          <div className="text-center text-gray-600 py-6">Loading...</div>
        ) : paginatedCategories.length === 0 ? (
          <p className="text-center text-gray-600">
            {search ? 'No categories match your search.' : 'No categories found.'}
          </p>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
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
                        onClick={() => openModal(category)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2 transition-colors"
                        disabled={loading || isLoading || !isAdmin}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.categoryId)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        disabled={loading || isLoading || !isAdmin}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-600">Page {page}</span>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={paginatedCategories.length < limit || page * limit >= filteredCategories.length || loading || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-blue-800">
                {selectedCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category name"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4 text-blue-700">Confirm Deletion</h2>
              <p className="mb-4 text-gray-700">Are you sure you want to delete this category?</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={isLoading}
                >
                  Confirm
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