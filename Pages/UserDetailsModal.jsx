import React, { useState, useEffect, useCallback, useContext } from "react";
import { getUserById, updateUser, deleteUser } from "../src/API/api";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

// Fallback for AuthContext import
let AuthContext;
try {
  AuthContext = require("../src/contexts/AuthContext").AuthContext;
  console.log("AuthContext imported successfully:", !!AuthContext);
} catch (err) {
  console.warn("Failed to import AuthContext:", err.message);
  AuthContext = null;
}

const UserDetailsModal = ({ userId, onClose, refreshUsers }) => {
  // Use AuthContext if available
  const { user } = AuthContext ? useContext(AuthContext) : { user: null };
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    roleId: 1,
    isLocked: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Log API info
  const logApiInfo = (method, endpoint, status, responseData = null, error = null) => {
    console.log(`API Call: ${method} ${endpoint}`, {
      status,
      responseData: responseData || "No data",
      error: error ? `${error.message}` : null,
      timestamp: new Date().toLocaleString(),
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!editForm.fullName) errors.fullName = "Họ tên là bắt buộc";
    if (editForm.fullName.length > 255) errors.fullName = "Họ tên phải dưới 255 ký tự";
    if (editForm.phone && !/^\d{10,20}$/.test(editForm.phone)) {
      errors.phone = "Số điện thoại phải từ 10-20 chữ số";
    }
    if (!editForm.email) errors.email = "Email là bắt buộc";
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!editForm.roleId || ![1, 2].includes(Number(editForm.roleId))) {
      errors.roleId = "Vai trò không hợp lệ";
    }
    return errors;
  };

  // Fetch user details
  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching user details for userId:', userId);
      const userData = await getUserById(userId);
      console.log('User details fetched:', userData);
      setUserData(userData);
      setEditForm({
        fullName: userData.fullName || "",
        phone: userData.phone || "",
        email: userData.email || "",
        roleId: userData.roleId || 1,
        isLocked: userData.isLocked || false,
      });
      logApiInfo('GET', `/api/Users/${userId}`, 'Success', userData);
    } catch (err) {
      console.error('Error fetching user details:', err);
      toast.error(`Không thể tải chi tiết người dùng: ${err.message}`);
      logApiInfo('GET', `/api/Users/${userId}`, 'Failed', null, err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Enable edit mode
  const handleEdit = useCallback(() => {
    console.log('Switching to edit mode');
    setIsEditing(true);
  }, []);

  // Update user
  const handleUpdate = useCallback(async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
      setFormErrors(errors);
      return;
    }
    setLoading(true);
    try {
      console.log('Updating user:', userId, editForm);
      const response = await updateUser(userId, {
        fullName: editForm.fullName,
        phone: editForm.phone || null,
        email: editForm.email,
        roleId: Number(editForm.roleId),
        isLocked: editForm.isLocked,
      });
      toast.success("Cập nhật người dùng thành công!");
      refreshUsers();
      setIsEditing(false);
      setFormErrors({});
      fetchUserDetails();
      logApiInfo('PUT', `/api/Users/${userId}`, 'Success', response);
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err.message.includes("Cannot update yourself")
        ? "Bạn không thể chỉnh sửa thông tin của chính mình trong chế độ này."
        : `Cập nhật người dùng thất bại: ${err.message}`;
      toast.error(errorMessage);
      logApiInfo('PUT', `/api/Users/${userId}`, 'Failed', null, err);
    } finally {
      setLoading(false);
    }
  }, [userId, editForm, refreshUsers, fetchUserDetails]);

  // Delete user
  const handleDelete = useCallback(async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    setLoading(true);
    try {
      console.log('Deleting user:', userId);
      const response = await deleteUser(userId);
      toast.success("Xóa người dùng thành công!");
      refreshUsers();
      onClose();
      logApiInfo('DELETE', `/api/Users/${userId}`, 'Success', response);
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(`Xóa người dùng thất bại: ${err.message}`);
      logApiInfo('DELETE', `/api/Users/${userId}`, 'Failed', null, err);
    } finally {
      setLoading(false);
    }
  }, [userId, refreshUsers, onClose]);

  // Check if the user is trying to edit themselves (fallback if AuthContext is unavailable)
  const isSelf = user && (user.id === userId || user.userId === userId);

  if (!userData || loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
          <p className="text-center text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">
            {isEditing ? "Chỉnh sửa người dùng" : "Chi tiết người dùng"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Đóng modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        {isEditing ? (
          <div className="space-y-4">
            {isSelf && (
              <p className="text-red-600 text-sm">
                Bạn không thể chỉnh sửa thông tin của chính mình trong chế độ này. Vui lòng sử dụng trang Hồ sơ.
              </p>
            )}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Họ tên</label>
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                disabled={loading || isSelf}
              />
              {formErrors.fullName && <p className="text-red-600 text-sm">{formErrors.fullName}</p>}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                disabled={loading || isSelf}
              />
              {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                disabled={loading || isSelf}
              />
              {formErrors.phone && <p className="text-red-600 text-sm">{formErrors.phone}</p>}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Vai trò</label>
              <select
                value={editForm.roleId}
                onChange={(e) => setEditForm({ ...editForm, roleId: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                disabled={loading || isSelf}
              >
                <option value={1}>Người dùng</option>
                <option value={2}>Admin</option>
              </select>
              {formErrors.roleId && <p className="text-red-600 text-sm">{formErrors.roleId}</p>}
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.isLocked}
                  onChange={(e) => setEditForm({ ...editForm, isLocked: e.target.checked })}
                  className="mr-2"
                  disabled={loading || isSelf}
                />
                <span className="text-gray-700">Khóa tài khoản</span>
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                disabled={loading || isSelf}
              >
                <FontAwesomeIcon icon={faSave} />
                Lưu
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <p><strong>ID:</strong> {userData.id || userData.userId}</p>
              <p><strong>Họ tên:</strong> {userData.fullName || "N/A"}</p>
              <p><strong>Email:</strong> {userData.email || "N/A"}</p>
              <p><strong>Số điện thoại:</strong> {userData.phone || "Chưa có"}</p>
              <p><strong>Vai trò:</strong> {userData.roleId === 1 ? "Người dùng" : userData.roleId === 2 ? "Admin" : userData.role || "N/A"}</p>
              <p><strong>Trạng thái:</strong> {userData.isLocked ? "Đã khóa" : "Hoạt động"}</p>
              <p><strong>Ngày tạo:</strong> {userData.createdAt ? new Date(userData.createdAt).toLocaleString() : "N/A"}</p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faEdit} />
                Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTrash} />
                Xóa
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors"
                disabled={loading}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsModal;