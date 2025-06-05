import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { DataContext } from "../src/contexts/DataContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import UserDetailsModal from "./UserDetailsModal";

const AdminUsersPage = () => {
  const { users: allUsers, refreshData, loading, error } = useContext(DataContext);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const limit = 10;

  // Log thông tin API
  const logApiInfo = (method, endpoint, status, responseData = null, error = null) => {
    console.log(`API Call: ${method} ${endpoint}`, {
      status,
      responseData: responseData || "No data",
      error: error ? error.message : null,
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
        (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
    );
    logApiInfo("FILTER", "Client-side search", "Success", filtered, null);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {loading ? (
        <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
      ) : error ? (
        <p className="text-center text-red-600">Lỗi: {error}</p>
      ) : !Array.isArray(allUsers) || allUsers.length === 0 ? (
        <p className="text-center text-gray-600">Không có người dùng nào trong hệ thống. Vui lòng kiểm tra cơ sở dữ liệu hoặc API.</p>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-700">Quản lý người dùng</h1>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faSyncAlt} />
              Làm mới
            </button>
          </div>
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
          <p className="mb-6 text-gray-600">Tổng số người dùng: {total} (Đã lọc: {filteredTotal})</p>

          {paginatedUsers.length === 0 ? (
            <p className="text-center text-gray-600">
              {search ? "Không có người dùng nào khớp với tìm kiếm." : "Không có người dùng trong trang này."}
            </p>
          ) : (
            <div>
              {/* Giao diện mobile */}
              <div className="md:hidden">
                {paginatedUsers.map((user) => (
                  <div key={user.userId} className="border-b border-gray-200 p-4 bg-white rounded-lg mb-2 shadow-sm">
                    <p>
                      <strong>Tên:</strong>{" "}
                      <button
                        onClick={() => handleViewDetails(user.userId)}
                        className="text-blue-600 hover:underline"
                      >
                        {user.fullName || "N/A"}
                      </button>
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email || "N/A"}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {user.phone || "N/A"}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong> {user.isLocked ? "Đã khóa" : "Hoạt động"}
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => handleViewDetails(user.userId)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Giao diện desktop */}
              <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Họ tên</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Số điện thoại</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.userId} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{user.userId}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <button
                            onClick={() => handleViewDetails(user.userId)}
                            className="text-blue-600 hover:underline"
                          >
                            {user.fullName || "N/A"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.email || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.phone || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.isLocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.isLocked ? "Đã khóa" : "Hoạt động"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleViewDetails(user.userId)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Trang trước
            </button>
            <span className="text-gray-600">
              Trang {page} / {Math.ceil(filteredTotal / limit) || 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={paginatedUsers.length < limit || page * limit >= filteredTotal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Trang sau
            </button>
          </div>
          {selectedUserId && (
            <UserDetailsModal
              userId={selectedUserId}
              onClose={() => setSelectedUserId(null)}
              refreshUsers={refreshData}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;