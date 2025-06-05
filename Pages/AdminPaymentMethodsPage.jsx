import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faPlus, faEdit, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getAdminPaymentMethods, createPaymentMethod, togglePaymentMethod } from '../src/API/api';

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
      const response = await getAdminPaymentMethods();
      // Đảm bảo response là mảng và mỗi phần tử có Name
      const validMethods = Array.isArray(response)
        ? response.filter(method => method && typeof method.Name === 'string')
        : [];
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
      toast.error('Tên phương thức thanh toán là bắt buộc');
      return;
    }
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      toast.error('Tên phương thức phải có từ 3 đến 50 ký tự');
      return;
    }
    if (!/^[\w\s-]+$/.test(trimmedName)) {
      toast.error('Tên phương thức chỉ được chứa chữ cái, số, khoảng trắng và dấu gạch ngang');
      return;
    }
    try {
      setIsLoading(true);
      if (selectedMethod) {
        // Không có API cập nhật, sử dụng toggle để thay đổi trạng thái
        await togglePaymentMethod(selectedMethod.PaymentMethodId, !selectedMethod.IsEnabled);
        toast.success('Trạng thái phương thức thanh toán đã được cập nhật');
      } else {
        await createPaymentMethod({ Name: trimmedName, IsEnabled: true });
        toast.success('Phương thức thanh toán đã được tạo');
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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 animate-fade-in mb-4 sm:mb-0">
            Quản lý phương thức thanh toán
          </h1>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
              disabled={isLoading}
              title="Làm mới danh sách phương thức"
            >
              <FontAwesomeIcon icon={faSyncAlt} className={isLoading ? 'animate-spin' : ''} />
              Làm mới
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
              title={isAdmin() ? 'Thêm phương thức mới' : 'Yêu cầu quyền admin'}
            >
              <FontAwesomeIcon icon={faPlus} />
              Thêm phương thức mới
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên phương thức..."
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
            Đang tải phương thức thanh toán...
          </div>
        ) : paginatedPaymentMethods.length === 0 ? (
          <p className="text-center text-gray-600 py-6">
            {search ? 'Không tìm thấy phương thức nào.' : 'Chưa có phương thức thanh toán.'}
          </p>
        ) : (
          <>
            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tên</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Kích hoạt</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPaymentMethods.map((method) => (
                    <tr key={method.PaymentMethodId} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{method.PaymentMethodId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{method.Name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{method.IsEnabled ? 'Có' : 'Không'}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          type="button"
                          onClick={() => openModal(method)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2 transition-colors shadow-sm"
                          disabled={isLoading || !isAdmin()}
                          title="Cập nhật trạng thái phương thức"
                        >
                          <FontAwesomeIcon icon={faEdit} /> {method.IsEnabled ? 'Tắt' : 'Bật'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(method.PaymentMethodId)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                          disabled={isLoading || !isAdmin()}
                          title="Xóa phương thức này"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
              {paginatedPaymentMethods.map((method) => (
                <div
                  key={method.PaymentMethodId}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        ID: {method.PaymentMethodId}
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {method.Name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Kích hoạt: {method.IsEnabled ? 'Có' : 'Không'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openModal(method)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                        disabled={isLoading || !isAdmin()}
                        title="Cập nhật trạng thái phương thức"
                      >
                        <FontAwesomeIcon icon={faEdit} /> {method.IsEnabled ? 'Tắt' : 'Bật'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(method.PaymentMethodId)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        disabled={isLoading || !isAdmin()}
                        title="Xóa phương thức này"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Xóa
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
            Trước
          </button>
          <span className="text-gray-600">
            Trang {page} / {Math.ceil(filteredPaymentMethods.length / limit)}
          </span>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={paginatedPaymentMethods.length < limit || page * limit >= filteredPaymentMethods.length || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            Sau
          </button>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-blue-800">
                {selectedMethod ? 'Cập nhật phương thức thanh toán' : 'Thêm phương thức thanh toán'}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên phương thức <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-shadow"
                    placeholder="Nhập tên phương thức (3-50 ký tự)"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Chỉ cho phép chữ cái, số, khoảng trắng và dấu gạch ngang.
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
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSavePaymentMethod}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                  {isLoading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-blue-700">Xác nhận xóa</h2>
              <p className="mb-4 text-gray-700">Bạn có chắc muốn xóa phương thức thanh toán này?</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 shadow-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm disabled:opacity-50 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                  {isLoading ? 'Đang xóa...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentMethodsPage;