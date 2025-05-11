// src/pages/AdminStatisticsPage.jsx
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../src/contexts/DataContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const AdminStatisticsPage = () => {
  const { users, googleBooks, orders, reviews, loading } = useContext(DataContext);

  // Tính toán thống kê với useMemo để tối ưu hiệu suất
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalBooks = googleBooks.length;
    const totalOrders = orders.length;
    const totalReviews = reviews.length;

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.totalAmount || 0);
    }, 0);

    const lockedUsers = users.filter((user) => user.isLocked).length;

    // Phân bố sách theo thể loại (dành cho biểu đồ cột)
    const booksByGenreData = Object.entries(
      googleBooks.reduce((acc, book) => {
        const genre = book.genre || 'Unknown Genre';
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    // Phân bố giao dịch theo trạng thái (dành cho biểu đồ tròn)
    const ordersByStatusData = Object.entries(
      orders.reduce((acc, order) => {
        const status = order.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    // Top 5 sách có nhiều đánh giá nhất
    const topBooksByReviews = googleBooks
      .map((book) => {
        const bookReviews = reviews.filter((review) => review.bookId === book.bookId);
        return {
          title: book.title,
          reviewCount: bookReviews.length,
          averageRating:
            bookReviews.length > 0
              ? (bookReviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
                  bookReviews.length).toFixed(1)
              : 0,
        };
      })
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 5);

    // Xu hướng doanh thu (giả lập theo ngày nếu không có dữ liệu thời gian cụ thể)
    const revenueTrend = orders.reduce((acc, order) => {
      const date = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : 'Unknown Date';
      acc[date] = (acc[date] || 0) + (order.totalAmount || 0);
      return acc;
    }, {});
    const revenueTrendData = Object.entries(revenueTrend).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1)
        : 0;

    return {
      totalUsers,
      totalBooks,
      totalOrders,
      totalReviews,
      totalRevenue,
      lockedUsers,
      booksByGenreData,
      ordersByStatusData,
      topBooksByReviews,
      revenueTrendData,
      averageRating,
    };
  }, [users, googleBooks, orders, reviews]);

  // Màu sắc cho biểu đồ tròn
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <div className="text-center py-6 text-gray-600">Loading statistics...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề chính với hiệu ứng fade-in */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-10 text-blue-800 text-center"
        >
          Admin Statistics Dashboard
        </motion.h1>

        {/* Thẻ thống kê chính với hiệu ứng xuất hiện */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            <p className="text-sm mt-1">Locked: {stats.lockedUsers}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold">Total Books</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalBooks}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold">Total Orders</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
            <p className="text-sm mt-1">Revenue: ${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold">Total Reviews</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalReviews}</p>
            <p className="text-sm mt-1">Avg Rating: {stats.averageRating}</p>
          </div>
        </motion.div>

        {/* Thống kê chi tiết */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Biểu đồ cột: Số lượng sách theo thể loại */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Books by Genre</h2>
            {stats.booksByGenreData.length > 0 ? (
              <BarChart width={500} height={300} data={stats.booksByGenreData}>
                <XAxis dataKey="name" tick={{ fill: '#4B5EAA', fontSize: 12 }} />
                <YAxis tick={{ fill: '#4B5EAA', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            ) : (
              <p className="text-gray-600">No books data available.</p>
            )}
          </motion.div>

          {/* Biểu đồ tròn: Số lượng giao dịch theo trạng thái */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Orders by Status</h2>
            {stats.ordersByStatusData.length > 0 ? (
              <PieChart width={500} height={300}>
                <Pie
                  data={stats.ordersByStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {stats.ordersByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <p className="text-gray-600">No orders data available.</p>
            )}
          </motion.div>

          {/* Top 5 sách có nhiều đánh giá nhất */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white p-6 rounded-xl shadow-md lg:col-span-2"
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Top 5 Books by Reviews</h2>
            {stats.topBooksByReviews.length > 0 ? (
              <div className="space-y-4">
                {stats.topBooksByReviews.map((book, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">{book.title}</h3>
                      <p className="text-sm text-gray-600">Reviews: {book.reviewCount}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-2">★</span>
                      <span className="text-blue-600 font-semibold">{book.averageRating}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reviews data available.</p>
            )}
          </motion.div>

          {/* Xu hướng doanh thu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white p-6 rounded-xl shadow-md lg:col-span-2"
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Revenue Trend</h2>
            {stats.revenueTrendData.length > 0 ? (
              <BarChart width={800} height={300} data={stats.revenueTrendData}>
                <XAxis dataKey="date" tick={{ fill: '#4B5EAA', fontSize: 12 }} />
                <YAxis tick={{ fill: '#4B5EAA', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#00C49F" />
              </BarChart>
            ) : (
              <p className="text-gray-600">No revenue data available.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatisticsPage;