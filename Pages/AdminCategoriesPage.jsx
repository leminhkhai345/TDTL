import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faPlus, faEdit, faTrash, faSpinner, faSearch, faFilter, faListAlt, faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8">
          {/* Header Section */}
          <div className="relative mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-center mt-2">Category Management System</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Header with Title and Refresh Button */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-blue-800 mb-4 sm:mb-0"
                  >
                    <FontAwesomeIcon icon={faListAlt} className="mr-3" />
                    Category Management
                  </motion.h1>
                  <div className="flex gap-3">
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={handleRefresh}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faSyncAlt} className={isLoading ? "animate-spin" : ""} />
                      Refresh Data
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => openModal()}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Add Category
                    </motion.button>
                  </div>
                </div>

                {/* Search Bar */}
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
                        placeholder="Search by category name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FontAwesomeIcon icon={faFilter} />
                      <span>Total Categories: <strong>{categories.length}</strong> (Filtered: <strong>{filteredCategories.length}</strong>)</span>
                    </div>
                  </div>
                </motion.div>

                {/* Categories Table */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedCategories.map((category) => (
                          <tr key={category.categoryId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{category.categoryId}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{category.categoryName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => openModal(category)}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                              >
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(category.categoryId)}
                                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                              >
                                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Pagination */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex justify-between items-center"
                >
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page <span className="font-medium">{page}</span> of{" "}
                    <span className="font-medium">{Math.ceil(filteredCategories.length / limit) || 1}</span>
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={paginatedCategories.length < limit || page * limit >= filteredCategories.length}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </motion.div>
              </>
            )}
          </div>

          {/* Add/Edit Modal */}
          {isModalOpen && (
            <>
              {/* Blurred backdrop */}
              <div className="fixed inset-0 backdrop-blur-[6px] bg-white/30 z-40"></div>
              
              {/* Modal content */}
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-blue-800">
                      {selectedCategory ? 'Update Category' : 'Add New Category'}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                  </div>

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
                        Only letters, numbers, spaces and hyphens allowed
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
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
            </>
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
    </div>
  );
};

export default AdminCategoriesPage;