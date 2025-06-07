import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { createDocument, getCategories } from '../src/API/api';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const SellPage = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Title: '',
    CategoryId: '',
    Author: '',
    Condition: 'Good',
    Price: '',
    Description: '',
    ImageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Lấy danh mục từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        toast.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Kiểm tra các trường bắt buộc
    if (!formData.Title || !formData.Author || !formData.CategoryId || !formData.Condition) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    // Chuẩn bị dữ liệu gửi đi
    const documentData = {
      Title: formData.Title,
      CategoryId: parseInt(formData.CategoryId),
      Author: formData.Author,
      Condition: formData.Condition,
      Price: formData.Price ? parseFloat(formData.Price) : null,
      Description: formData.Description || null,
      ImageUrl: formData.ImageUrl || null,
    };

    try {
      await createDocument(documentData);
      toast.success('Book added to inventory successfully! You can list it for sale from your inventory.');
      setFormData({
        Title: '',
        CategoryId: '',
        Author: '',
        Condition: 'Good',
        Price: '',
        Description: '',
        ImageUrl: '',
      });
      navigate('/inventory');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <Navbar /> */}
      <div>
        {/* Container chính cho nội dung SellPage */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8 text-blue-800">Add Book to Inventory</h1>

          {/* Form nhập thông tin (full width) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white rounded-xl shadow-lg p-8 min-h-[500px]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-blue-800">Book Information</h2>
              <Link to="/inventory" className="text-blue-600 hover:underline font-semibold">
                View Inventory
              </Link>
            </div>
            {categoriesLoading ? (
              <div className="flex justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <p className="text-red-600 text-center bg-red-100 p-3 rounded-lg">{error}</p>
                )}
                <div className="grid grid-cols-2 gap-6">
                  {/* Cột trái: Title, Author, CategoryId, Condition */}
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Book Title *
                      </label>
                      <input
                        type="text"
                        name="Title"
                        value={formData.Title}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                        required
                        maxLength={255}
                        placeholder="Enter the book title"
                      />
                    </div>
                    <div className="relative">
                      <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Author *
                      </label>
                      <input
                        type="text"
                        name="Author"
                        value={formData.Author}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                        required
                        maxLength={100}
                        placeholder="Enter the author's name"
                      />
                    </div>
                    <div className="relative">
                      <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Category *
                      </label>
                      <select
                        name="CategoryId"
                        value={formData.CategoryId}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Condition *
                      </label>
                      <select
                        name="Condition"
                        value={formData.Condition}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                        required
                      >
                        <option value="New">New</option>
                        <option value="Like New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                  </div>

                  {/* Cột phải: Price, Description, ImageUrl */}
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="Price"
                        value={formData.Price}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                        min="0"
                        step="0.01"
                        placeholder="Enter the price (optional)"
                      />
                    </div>
                    <div className="relative">
                      <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Description
                      </label>
                      <textarea
                        name="Description"
                        value={formData.Description}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                        rows={4}
                        placeholder="Describe your book (optional)"
                      />
                    </div>
                    <div className="relative">
                      <label className="absolute top-[-10px] left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Image URL
                      </label>
                      <input
                        type="url"
                        name="ImageUrl"
                        value={formData.ImageUrl}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                        placeholder="Enter image URL (optional)"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <Link
                    to="/inventory"
                    className="px-6 py-4 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:scale-100 disabled:shadow-none"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Add to Inventory'
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-4">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default SellPage;