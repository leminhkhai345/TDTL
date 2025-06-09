import React, { useState } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const SignUpPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address (e.g., user@example.com).");
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const result = await register(fullName, trimmedEmail, "", password, confirmPassword);
      if (result.success) {
        toast.success("Registered successfully! Please verify your email.");
        navigate("/otp", { state: { email: trimmedEmail } });
      } else {
        setError(result.message || "Failed to register. Please try again.");
        toast.error(result.message || "Failed to register. Please try again.");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to register. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setError("");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
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

  // Signup validation messages
  const validateForm = () => {
    const errors = {};
    if (!fullName) errors.name = "Please enter your full name";
    if (!email) {
      errors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Please enter a password";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-5xl mx-auto shadow-2xl rounded-xl overflow-hidden">
        {/* Phần minh họa bên trái */}
        <div className="hidden lg:block w-1/2 bg-gradient-to-r from-blue-600 to-blue-800 p-10 text-white">
          <h1 className="text-4xl font-bold mb-4">Join BookStore Today</h1>
          <p className="text-lg mb-6">
            Sign up to discover a world of books, exchange your favorites, and build your personal library.
          </p>
          <div className="flex justify-center">
            <img
              src="https://via.placeholder.com/300x200.png?text=Book+Illustration"
              alt="Book Illustration"
              className="w-3/4 h-auto opacity-90"
            />
          </div>
        </div>

        {/* Phần form đăng ký bên phải */}
        <motion.div
          className="w-full lg:w-1/2 p-8 bg-white flex flex-col justify-center"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Create Your Account</h2>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center"
            >
              <p>{error}</p>
              <button
                onClick={handleTryAgain}
                className="mt-2 text-blue-600 hover:underline focus:outline-none"
              >
                Try Again
              </button>
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={inputVariants} className="relative">
              <label className="block font-medium mb-1 text-gray-700">Full Name</label>
              <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faUser} className="ml-3 text-gray-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 pl-4 border-0 focus:outline-none rounded-lg"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </motion.div>
            <motion.div variants={inputVariants} className="relative">
              <label className="block font-medium mb-1 text-gray-700">Email</label>
              <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faEnvelope} className="ml-3 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 pl-4 border-0 focus:outline-none rounded-lg"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>
            <motion.div variants={inputVariants} className="relative">
              <label className="block font-medium mb-1 text-gray-700">Password</label>
              <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <FontAwesomeIcon icon={faLock} className="ml-3 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-4 border-0 focus:outline-none rounded-lg"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="mr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 pl-4 border-0 focus:outline-none rounded-lg"
                  placeholder="Confirm your password"
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
                {loading ? "Registering..." : "Sign Up"}
              </button>
            </motion.div>
          </form>
          <div className="text-center mt-6">
            <p>
              Already have an account?{" "}
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

export default SignUpPage;