// src/pages/AdminUsersPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { DataContext } from '../src/contexts/DataContext';
import { lockUser } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const AdminUsersPage = () => {
  const { users: allUsers, refreshData } = useContext(DataContext);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 10;

  // Cập nhật tổng số khi dữ liệu thay đổi
  useEffect(() => {
    setTotal(allUsers.length);
    setFilteredTotal(allUsers.length);
  }, [allUsers]);

  // Memoize dữ liệu đã lọc
  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];

    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  }, [allUsers, search]);

  // Memoize dữ liệu phân trang
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, page]);

  // Cập nhật page khi cần
  useEffect(() => {
    setFilteredTotal(filteredUsers.length);

    const maxPage = Math.ceil(filteredUsers.length / limit);
    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    } else if (filteredUsers.length === 0) {
      setPage(1);
    }
  }, [filteredUsers, page]);

  // Memoize các hàm xử lý sự kiện
  const handleLock = useCallback(async (userId, isLocked) => {
    try {
      await lockUser(userId, isLocked);
      refreshData();
      toast.success(`User ${isLocked ? 'locked' : 'unlocked'} successfully`);
    } catch (err) {
      toast.error(err.message);
    }
  }, [refreshData]);

  const handleViewDetails = useCallback((user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedUser(null);
  }, []);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setSearch('');
    refreshData();
  }, [refreshData]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Manage Users</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faSyncAlt} />
          Refresh
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <p className="mb-6 text-gray-600">Total Users: {total} (Filtered: {filteredTotal})</p>
      {paginatedUsers.length === 0 ? (
        <p className="text-center text-gray-600">
          {search ? 'No users match your search.' : 'No users found.'}
        </p>
      ) : (
        <div>
          {/* Mobile view */}
          <div className="md:hidden">
            {paginatedUsers.map((user) => (
              <div key={user.id} className="border-b p-4">
                <p>
                  <strong>Name:</strong>{' '}
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="text-blue-600 hover:underline"
                  >
                    {user.fullName}
                  </button>
                </p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Status:</strong> {user.isLocked ? 'Locked' : 'Active'}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleLock(user.id, !user.isLocked)}
                    className={`px-3 py-1 rounded text-white ${
                      user.isLocked
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {user.isLocked ? 'Unlock' : 'Lock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop view */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Full Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="text-blue-600 hover:underline"
                      >
                        {user.fullName}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.isLocked ? 'Locked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleLock(user.id, !user.isLocked)}
                        className={`px-3 py-1 rounded text-white ${
                          user.isLocked
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {user.isLocked ? 'Unlock' : 'Lock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={paginatedUsers.length < limit || page * limit >= filteredUsers.length}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-700">User Details</h2>
            <p><strong>ID:</strong> {selectedUser.id}</p>
            <p><strong>Full Name:</strong> {selectedUser.fullName}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Phone:</strong> {selectedUser.phone}</p>
            <p><strong>Status:</strong> {selectedUser.isLocked ? 'Locked' : 'Active'}</p>
            <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;