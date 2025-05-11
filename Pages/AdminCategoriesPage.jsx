import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAdminCategories();
      setCategories(data.categories || data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      !search || category.name.toLowerCase().includes(search.toLowerCase())
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
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      setLoading(true);
      if (selectedCategory) {
        await updateAdminCategory(selectedCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await createAdminCategory(formData);
        toast.success('Category created successfully');
      }
      fetchCategories();
      closeModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      setLoading(true);
      await deleteAdminCategory(categoryId);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    setSelectedCategory(category);
    setFormData(category ? { ...category } : { name: '', description: '', status: 'active' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleRefresh = () => {
    setPage(1);
    setSearch('');
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 animate-fade-in">Manage Categories</h1>
          <div className="flex gap-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSyncAlt} />
              Refresh
            </button>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
              disabled={loading}
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
            disabled={loading}
          />
        </div>
        {loading ? (
          <div className="text-center text-gray-600 py-6">Loading...</div>
        ) : paginatedCategories.length === 0 ? (
          <p className="text-center text-gray-600">No categories found.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{category.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{category.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => openModal(category)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2 transition-colors"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={paginatedCategories.length < limit || page * limit >= filteredCategories.length || loading}
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
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Enter category description"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
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