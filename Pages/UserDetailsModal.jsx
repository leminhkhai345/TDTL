import React, { useState, useEffect, useCallback, useContext } from "react";
import { getUserById, updateUser, deleteUser } from "../src/API/api";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faSave, faTimes, faUserCog, faPhone, faLock } from "@fortawesome/free-solid-svg-icons";

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
    roleId: "",
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
  roleId: userData.roleId ? Number(userData.roleId) : 1, // Luôn là 1 hoặc 2
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
        isLocked: editForm.isLocked, // should be true if checked
      });
      console.log('User data after update:', userData);
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
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully!");
      // Update local state to show deleted status without removing the user
      setUserData(prev => ({...prev, isDeleted: true}));
      // Update parent component's data
      refreshUsers();
      setIsEditing(false); // Return to view mode
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(`Failed to delete user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId, refreshUsers]);

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

  // Status display component
  const UserStatusBadge = ({ isLocked, isDeleted }) => {
    if (isDeleted) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
          Deleted
        </span>
      );
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
        isLocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
      }`}>
        {isLocked ? "Locked" : "Active"}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {isEditing ? (
        <div className="space-y-4 bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>

          {/* Add User Avatar and Title */}
          <div className="flex flex-col items-center border-b pb-6 mb-6">
            <div className="h-32 w-32 rounded-full bg-blue-600 flex items-center justify-center mb-4">
              <span className="text-6xl text-white font-bold">
                {userData.fullName?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-blue-800">Edit User Information</h2>
            <p className="text-gray-600">Update user details</p>
          </div>

          <div className="space-y-6">
            {isSelf && (
              <p className="text-red-600 text-sm">
                You cannot edit your own information in this mode. Please use the Profile page.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    disabled={loading || isSelf}
                  />
                  {formErrors.fullName && <p className="text-red-600 text-sm mt-1">{formErrors.fullName}</p>}
                </div>

                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    disabled={loading || isSelf}
                  />
                  {formErrors.phone && <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>}
                </div>

                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Role
                  </label>
                  <select
                    value={Number(editForm.roleId)}
                    onChange={(e) => setEditForm({ ...editForm, roleId: Number(e.target.value) })}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    disabled={loading || isSelf}
                  >
                    <option value={2}>User</option>
                    <option value={1}>Administrator</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Account Status
                  </label>
                  <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <label className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editForm.isLocked}
                          onChange={(e) => setEditForm({ ...editForm, isLocked: e.target.checked })}
                          className="mr-2"
                          disabled={loading || isSelf}
                        />
                        <span className="text-gray-700">Lock Account</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        editForm.isLocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {editForm.isLocked ? "Locked" : "Active"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all"
                disabled={loading || isSelf}
              >
                <FontAwesomeIcon icon={faSave} />
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-all"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 p-8 bg-white rounded-xl shadow-lg w-full max-w-4xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>

          {/* Header with Avatar */}
          <div className="flex flex-col items-center border-b pb-6">
            <div className="h-32 w-32 rounded-full bg-blue-600 flex items-center justify-center mb-4">
              <span className="text-6xl text-white font-bold">
                {userData.fullName?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-blue-800">User Information</h2>
            <p className="text-gray-600">Personal Details</p>
          </div>

          {/* Grid layout with wider columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Increased gap from 6 to 8 */}
            {/* Left Column */}
            <div className="space-y-6 w-full"> {/* Added w-full */}
              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  User ID
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                  {userData.id || userData.userId}
                </div>
              </div>

              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                  {userData.fullName || "N/A"}
                </div>
              </div>

              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Email
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                  {userData.email || "N/A"}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 w-full"> {/* Added w-full */}
              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                  {userData.phone || "Not Set"}
                </div>
              </div>

              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Role
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                  {userData.roleId === 1 ? "Administrator" : userData.roleId === 2 ? "User" : userData.role || "N/A"}
                </div>
              </div>

              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Status
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center"> {/* Added flex and centering */}
                  <UserStatusBadge isLocked={userData.isLocked} isDeleted={userData.isDeleted} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all"
              disabled={loading || isSelf}
            >
              <FontAwesomeIcon icon={faEdit} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-all"
              disabled={loading || isSelf}
            >
              <FontAwesomeIcon icon={faTrash} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsModal;