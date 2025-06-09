import React, { useEffect, useState } from "react";
import {
  getAdminOverviewStats,
  getAdminTopCategories,
  getAdminTopSellers,
} from "../src/API/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faList, faClock, faMoneyBillWave, faCrown } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666"];

const AdminStatisticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [topCategories, setTopCategories] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [sortBy, setSortBy] = useState("Revenue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const [overviewData, categoriesData, sellersData] = await Promise.all([
          getAdminOverviewStats(),
          getAdminTopCategories(5),
          getAdminTopSellers(5, sortBy),
        ]);
        setOverview(overviewData);
        setTopCategories(categoriesData);
        setTopSellers(sellersData);
      } catch (err) {
        setError(err.message || "Không thể tải thống kê admin.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg my-8">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-10 text-blue-800 text-center"
        >
          Admin Statistics Dashboard
        </motion.h1>

        {/* Card tổng quan */}
        {overview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} /> Active Users
              </h3>
              <p className="text-3xl font-bold mt-2">{overview.totalActiveUsers}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faList} /> Active Listings
              </h3>
              <p className="text-3xl font-bold mt-2">{overview.totalActiveListings}</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} /> Pending Listings
              </h3>
              <p className="text-3xl font-bold mt-2">{overview.totalPendingListings}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faMoneyBillWave} /> Revenue 30d
              </h3>
              <p className="text-3xl font-bold mt-2">
                {overview.totalRevenueLast30Days?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
              </p>
              <p className="text-sm mt-1">Orders: {overview.completedOrdersLast30Days}</p>
            </div>
          </motion.div>
        )}

        {/* Biểu đồ cột: Top danh mục nhiều listing */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-md mb-10"
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Top Categories by Active Listings</h2>
          {topCategories.length === 0 ? (
            <div className="text-gray-500 italic">No data.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCategories}>
                <XAxis dataKey="categoryName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activeListingCount" fill="#4F8EF7" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Bảng: Top seller */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-md mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faCrown} className="text-yellow-400" />
              Top Sellers (30 days)
            </h2>
            <div>
              <label className="mr-2 font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="Revenue">Revenue</option>
                <option value="OrderCount">Order Count</option>
              </select>
            </div>
          </div>
          {topSellers.length === 0 ? (
            <div className="text-gray-500 italic">No data.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Seller</th>
                    <th className="px-4 py-2 text-left">Revenue</th>
                    <th className="px-4 py-2 text-left">Order Count</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellers.map((seller, idx) => (
                    <tr key={seller.sellerId} className="border-b">
                      <td className="px-4 py-2 font-bold">{idx + 1}</td>
                      <td className="px-4 py-2">{seller.sellerFullName}</td>
                      <td className="px-4 py-2">
                        {seller.totalRevenue?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                      </td>
                      <td className="px-4 py-2">{seller.completedOrderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminStatisticsPage;