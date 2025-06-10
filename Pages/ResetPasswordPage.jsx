import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../src/API/api";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!token.trim()) {
      setError("Reset token is required");
      toast.error("Reset token is required");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(newPassword)) {
      setError("Password must include uppercase, lowercase, digit, and special character");
      toast.error("Password must include uppercase, lowercase, digit, and special character");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(token.trim(), newPassword, confirmPassword);
      setSuccess(true);
      toast.success(response.message || "Password has been reset successfully.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Hiệu ứng animation cho form
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-5xl mx-auto shadow-2xl rounded-xl overflow-hidden">
        {/* Phần minh họa bên trái */}
        <div className="hidden lg:block w-1/2 bg-gradient-to-r from-blue-600 to-blue-800 p-10 text-white">
          <h1 className="text-4xl font-bold mb-4">Reset Your Password</h1>
          <p className="text-lg mb-6">
            Enter the token from your email and set a new password to regain access to your BookStore account.
          </p>
          <div className="flex justify-center">
            <img
              src="https://via.placeholder.com/300x200.png?text=Book+Illustration"
              alt="Book Illustration"
              className="w-3/4 h-auto opacity-90"
            />
          </div>
        </div>

        {/* Phần form bên phải */}
        <motion.div
          className="w-full lg:w-1/2 p-8 bg-white flex flex-col justify-center"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Reset Your Password</h2>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center"
            >
              <p>{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-green-500 text-center mb-4"
            >
              <p>Password has been reset successfully. You will be redirected to login shortly.</p>
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={inputVariants} className="relative">
              <label className="block font-medium mb-1 text-gray-700">Reset Token</label>
              <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faKey} className="ml-3 text-gray-500" />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setError("");
                  }}
                  className="w-full p-3 pl-4 border-0 focus:outline-none rounded-lg"
                  placeholder="Enter the token from your email"
                  required
                />
              </div>
            </motion.div>
            <motion.div variants={inputVariants} className="relative">
              <label className="block font-medium mb-1 text-gray-700">New Password</label>
              <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faLock} className="ml-3 text-gray-500" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full p-3 pl-4 border-0 focus:outline-none rounded-lg"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="mr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </motion.div>
            <motion.div variants={inputVariants} className="relative">
              <label className="block font-medium mb-1 text-gray-700">Confirm Password</label>
              <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faLock} className="ml-3 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full p-3 pl-4 border-0 focus:outline-none rounded-lg"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="mr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </motion.div>
            <motion.div variants={inputVariants}>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </motion.div>
          </form>
          <div className="text-center mt-6">
            <p>
              Remember your password?{" "}
              <Link to="/login" className="text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;