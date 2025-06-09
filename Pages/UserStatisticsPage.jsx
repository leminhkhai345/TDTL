import React, { useEffect, useState } from "react";
import {
  getUserOverviewStats,  
  getUserTopRevenueTransactions,
  getUserTopSellingTitles,
} from "../src/API/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faList,
  faShoppingCart,
  faMoneyBillWave,
  faArrowUp,
  faArrowDown,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666"];

const UserStatisticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [topRevenue, setTopRevenue] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const [overviewData, revenueData, sellingData] = await Promise.all([
          getUserOverviewStats(),
          getUserTopRevenueTransactions(3),
          getUserTopSellingTitles(3),
        ]);
        setOverview(overviewData);
        setTopRevenue(revenueData);
        setTopSelling(sellingData);
      } catch (err) {
        setError(err.message || "Không thể tải thống kê.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">
          Personal Statistics
        </h1>

        {/* Tổng quan */}
        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FontAwesomeIcon icon={faBook} className="text-3xl text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{overview.booksInStock}</div>
                <div className="text-gray-600">Books in Stock</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FontAwesomeIcon icon={faList} className="text-3xl text-green-500" />
              <div>
                <div className="text-2xl font-bold">{overview.activeListings}</div>
                <div className="text-gray-600">Active Listings</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FontAwesomeIcon icon={faShoppingCart} className="text-3xl text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{overview.soldOrdersLast30Days}</div>
                <div className="text-gray-600">Sales Orders (30 days)</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-3xl text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  ${overview.salesRevenueLast30Days?.toFixed(2)}
                </div>
                <div className="text-gray-600">Sales Revenue (30 days)</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FontAwesomeIcon icon={faArrowUp} className="text-3xl text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{overview.purchasedOrdersLast30Days}</div>
                <div className="text-gray-600">Purchase Orders (30 days)</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FontAwesomeIcon icon={faArrowDown} className="text-3xl text-red-500" />
              <div>
                <div className="text-2xl font-bold">
                  ${overview.purchaseSpendingLast30Days?.toFixed(2)}
                </div>
                <div className="text-gray-600">Purchase Spending (30 days)</div>
              </div>
            </div>
          </div>
        )}

        {/* Biểu đồ doanh thu */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Revenue Overview (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={[
                {
                  name: 'Last 30 Days',
                  revenue: overview?.salesRevenueLast30Days || 0,
                  spending: overview?.purchaseSpendingLast30Days || 0
                }
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                name="Sales Revenue" 
                fill="#4CAF50" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="spending" 
                name="Purchase Spending" 
                fill="#F44336" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top giao dịch doanh thu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-blue-500" />
              Top Revenue Transactions
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topRevenue}>
                <XAxis dataKey="documentTitle" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="salePrice" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top sách bán chạy */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
              Top Selling Books
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topSelling}
                  dataKey="quantitySold"
                  nameKey="bookTitle"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {topSelling.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bảng chi tiết */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bảng doanh thu */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Revenue Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left">Book</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {topRevenue.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2">{item.documentTitle}</td>
                      <td className="px-4 py-2">
                        {item.salePrice?.toLocaleString("en-US", { 
                          style: "currency", 
                          currency: "USD" 
                        })}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(item.orderDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bảng sách bán chạy */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Sales Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left">Book</th>
                    <th className="px-4 py-2 text-left">Quantity Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {topSelling.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2">{item.bookTitle}</td>
                      <td className="px-4 py-2">{item.quantitySold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatisticsPage;