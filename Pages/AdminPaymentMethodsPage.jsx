import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faPlus, faEdit, faTrash, faSpinner, faSearch,faMoneyBillWave , faFilter, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { getPublicPaymentMethods } from '../src/API/api'; // Add this import
import { motion } from 'framer-motion';

const AdminPaymentMethodsPage = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [formData, setFormData] = useState({ Name: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  // Kiểm tra quyền admin và chuyển hướng nếu không có quyền
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để truy cập trang này');
      navigate('/login');
    } else if (!isAdmin()) {
      toast.error('Truy cập bị từ chối: Yêu cầu vai trò Admin');
      navigate('/');
    }
  }, [isLoggedIn, isAdmin, navigate]);

  // Lấy danh sách phương thức thanh toán
  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getPublicPaymentMethods();
      
      // Transform data to match expected format
      const validMethods = Array.isArray(response) ? response.map(method => ({
        PaymentMethodId: method.paymentMethodId,
        Name: method.name,
        IsEnabled: method.isEnabled
      })) : [];
      
      setPaymentMethods(validMethods);
    } catch (err) {
      toast.error(err.message || 'Không thể tải danh sách phương thức thanh toán');
      console.error('Error fetching payment methods:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Lọc danh sách phương thức thanh toán theo tìm kiếm
  const filteredPaymentMethods = useMemo(() => {
    return paymentMethods.filter(method =>
      !search || method.Name?.toLowerCase()?.includes(search.toLowerCase())
    );
  }, [paymentMethods, search]);

  // Phân trang
  const paginatedPaymentMethods = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredPaymentMethods.slice(startIndex, startIndex + limit);
  }, [filteredPaymentMethods, page]);

  // Cập nhật trang khi cần
  useEffect(() => {
    const maxPage = Math.ceil(filteredPaymentMethods.length / limit);
    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    } else if (filteredPaymentMethods.length === 0) {
      setPage(1);
    }
  }, [filteredPaymentMethods, page]);

  // Lưu phương thức thanh toán (tạo mới hoặc cập nhật)
  const handleSavePaymentMethod = async () => {
    const trimmedName = formData.Name.trim();
    if (!trimmedName) {
      toast.error('Payment method name is required');
      return;
    }
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      toast.error('Name must be between 3 and 50 characters');
      return;
    }
    if (!/^[\w\s-]+$/.test(trimmedName)) {
      toast.error('Name can only contain letters, numbers, spaces and hyphens');
      return;
    }
    try {
      setIsLoading(true);
      if (selectedMethod) {
        // Không có API cập nhật, sử dụng toggle để thay đổi trạng thái
        await togglePaymentMethod(selectedMethod.PaymentMethodId, !selectedMethod.IsEnabled);
        toast.success('Payment method status has been updated');
      } else {
        await createPaymentMethod({ Name: trimmedName, IsEnabled: true });
        toast.success('Payment method has been created');
      }
      await fetchPaymentMethods();
      closeModal();
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        toast.error('Vui lòng đăng nhập với vai trò admin để thực hiện hành động này');
        navigate('/login');
      } else if (err.message.includes('Payment method name already exists')) {
        toast.error('Tên phương thức thanh toán đã tồn tại');
      } else {
        toast.error(err.message || 'Không thể lưu phương thức thanh toán');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý xóa phương thức thanh toán
  const handleDelete = (methodId) => {
    setMethodToDelete(methodId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    // Hiện tại không có API xóa, giả lập thông báo lỗi
    try {
      setIsLoading(true);
      toast.error('API xóa phương thức thanh toán chưa được triển khai');
      // Nếu có API xóa, sử dụng:
      // await deletePaymentMethod(methodToDelete);
      // toast.success('Phương thức thanh toán đã được xóa');
      // await fetchPaymentMethods();
    } catch (err) {
      if (err.message.includes('Unauthorized')) {
        toast.error('Vui lòng đăng nhập với vai trò admin để thực hiện hành động này');
        navigate('/login');
      } else {
        toast.error(err.message || 'Không thể xóa phương thức thanh toán');
      }
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setMethodToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setMethodToDelete(null);
  };

  // Mở modal thêm/sửa
  const openModal = (method = null) => {
    if (!isAdmin()) {
      toast.error('Vui lòng đăng nhập với vai trò admin để thực hiện hành động này');
      navigate('/login');
      return;
    }
    setSelectedMethod(method);
    setFormData(method ? { Name: method.Name } : { Name: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMethod(null);
  };

  // Làm mới danh sách
  const handleRefresh = async () => {
    setPage(1);
    setSearch('');
    await fetchPaymentMethods();
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
            <p className="text-gray-500 text-center mt-2">Payment Method Management System</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Header with Title and Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-blue-800 mb-4 sm:mb-0"
                  >
                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-3" />
                    Payment Method Management
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
                      Add Payment Method
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
                        placeholder="Search by payment method name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FontAwesomeIcon icon={faFilter} />
                      <span>Total Methods: <strong>{paymentMethods.length}</strong> (Filtered: <strong>{filteredPaymentMethods.length}</strong>)</span>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Methods Table */}
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
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedPaymentMethods.map((method) => (
                          <tr key={method.PaymentMethodId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              #{method.PaymentMethodId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {method.Name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                method.IsEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {method.IsEnabled ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => openModal(method)}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                              >
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Toggle Status
                              </button>
                              <button
                                onClick={() => handleDelete(method.PaymentMethodId)}
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
                    <span className="font-medium">{Math.ceil(filteredPaymentMethods.length / limit) || 1}</span>
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={paginatedPaymentMethods.length < limit || page * limit >= filteredPaymentMethods.length}
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
              <div className="fixed inset-0 backdrop-blur-[6px] bg-black/30 z-40"></div>
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-2xl">
                  <h2 className="text-2xl font-bold mb-6 text-blue-800">
                    {selectedMethod ? 'Update Payment Method' : 'Add Payment Method'}
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Method Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.Name}
                        onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-shadow"
                        placeholder="Enter method name (3-50 characters)"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Only letters, numbers, spaces and hyphens allowed.
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
                      onClick={handleSavePaymentMethod}
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
            <>
              <div className="fixed inset-0 backdrop-blur-[6px] bg-black/30 z-40"></div>
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
                  <h2 className="text-xl font-bold mb-4 text-blue-700">Confirm Delete</h2>
                  <p className="mb-4 text-gray-700">Are you sure you want to delete this payment method?</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentMethodsPage;