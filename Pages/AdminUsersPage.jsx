import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { DataContext } from "../src/contexts/DataContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSyncAlt, 
  faSearch, 
  faFilter,
  faUserCog,
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import UserDetailsModal from "./UserDetailsModal";
import { motion } from "framer-motion";

const AdminUsersPage = () => {
  const { users: allUsers, refreshData, loading, error } = useContext(DataContext);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const limit = 10;

  // Log thông tin API
  const logApiInfo = (method, endpoint, status, responseData = null, err = null) => {
    console.log(`API Call: ${method} ${endpoint}`, {
      status,
      responseData: responseData || "No data",
      error: err ? err.message : null,
      timestamp: new Date().toLocaleString(),
    });
  };

  // Cập nhật tổng số người dùng và log dữ liệu API
  useEffect(() => {
    console.log("DataContext users:", allUsers);
    if (!Array.isArray(allUsers)) {
      logApiInfo("GET", "/api/Users", "Failed", null, new Error("allUsers is not an array"));
      setTotal(0);
      setFilteredTotal(0);
    } else {
      logApiInfo("GET", "/api/Users", "Success", allUsers);
      setTotal(allUsers.length);
      setFilteredTotal(allUsers.length);
    }
  }, [allUsers]);

  // Lọc người dùng theo tìm kiếm
  const filteredUsers = useMemo(() => {
    const usersArray = Array.isArray(allUsers) ? allUsers : [];
    if (!search) return usersArray;
    const filtered = usersArray.filter(
      (user) =>
        ((user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase())))
    );
    return filtered;
  }, [allUsers, search]);

  // Phân trang
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginated = filteredUsers.slice(startIndex, endIndex);
    logApiInfo("PAGINATION", `Page ${page}`, "Success", paginated, null);
    return paginated;
  }, [filteredUsers, page]);

  // Cập nhật trang khi lọc thay đổi
  useEffect(() => {
    setFilteredTotal(filteredUsers.length);
    const maxPage = Math.ceil(filteredUsers.length / limit) || 1;
    if (page > maxPage) {
      setPage(maxPage);
    } else if (filteredUsers.length === 0) {
      setPage(1);
    }
  }, [filteredUsers, page]);

  // Mở modal chi tiết
  const handleViewDetails = useCallback((userId) => {
    console.log('Opening details for userId:', userId);
    setSelectedUserId(userId);
  }, []);

  // Làm mới dữ liệu
  const handleRefresh = useCallback(() => {
    setPage(1);
    setSearch("");
    refreshData();
  }, [refreshData]);

  // Update the UserStatusBadge component
  const UserStatusBadge = ({ isLocked, isDeleted }) => {
    if (isDeleted) {
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          Deleted
        </span>
      );
    }
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isLocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
      }`}>
        {isLocked ? "Locked" : "Active"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8">
          <div className="relative mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-center mt-2">User Management System</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                Error: {error}
              </motion.div>
            ) : (
              <>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-blue-800 mb-4 sm:mb-0"
                  >
                    <FontAwesomeIcon icon={faUserCog} className="mr-3" />
                    User Management
                  </motion.h1>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSyncAlt} className={loading ? "animate-spin" : ""} />
                    Refresh Data
                  </motion.button>
                </div>

                {/* Search and Filter Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md p-6 mb-8"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                      <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FontAwesomeIcon icon={faFilter} />
                      <span>Total Users: <strong>{total}</strong> (Filtered: <strong>{filteredTotal}</strong>)</span>
                    </div>
                  </div>
                </motion.div>

                {/* Users Table */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedUsers.map((user) => (
                          <tr 
                            key={user.userId} 
                            className={`hover:bg-gray-50 transition-colors ${
                              user.isDeleted ? 'bg-gray-50' : ''
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{user.userId}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                  {user.fullName?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.fullName || "N/A"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <UserStatusBadge isLocked={user.isLocked} isDeleted={user.isDeleted} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleViewDetails(user.userId)}
                                className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${
                                  user.isDeleted ? 'opacity-50' : ''
                                }`}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Pagination */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex justify-between items-center"
                >
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page <span className="font-medium">{page}</span> of{" "}
                    <span className="font-medium">{Math.ceil(filteredTotal / limit) || 1}</span>
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={paginatedUsers.length < limit || page * limit >= filteredTotal}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </motion.div>
              </>
            )}
          </div>

          {/* User Details Modal */}
          {selectedUserId && (
            <UserDetailsModal
              userId={selectedUserId}
              onClose={() => setSelectedUserId(null)}
              refreshUsers={refreshData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;