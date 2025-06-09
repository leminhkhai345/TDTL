import React, { useState } from "react";
import { changePassword } from "../src/API/api";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEye, faEyeSlash, faExclamationCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Password changed successfully!", { position: "top-right" });
      onClose();
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errorMessage = err.message || "An error occurred while changing password.";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Blurred background */}
      <div className="absolute inset-0 backdrop-blur-[6px] bg-white/10 transition-all duration-300"></div>
      {/* Modal content */}
      <div className="relative z-10 bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-xl"
          aria-label="Close modal"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 rounded-full p-3 mb-2">
            <FontAwesomeIcon icon={faLock} className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-blue-800">Change Password</h2>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleChangePassword} className="space-y-5">
          <div>
            <label className="block font-medium mb-1 text-gray-700">Old Password</label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all duration-200 placeholder-gray-400 text-black bg-white/80"
                placeholder="Enter old password"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">New Password</label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all duration-200 placeholder-gray-400 text-black bg-white/80"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">Confirm New Password</label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-all duration-200 placeholder-gray-400 text-black bg-white/80"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-lg hover:scale-105 transition-all duration-200 shadow hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:scale-105 transition-all duration-200 shadow hover:shadow-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;