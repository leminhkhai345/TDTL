import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminListings, approveListing, rejectListing, getCategories } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faEye, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const AdminBooksPage = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('documenttitle');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectListingId, setRejectListingId] = useState(null);
  const [rejectRowVersion, setRejectRowVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để truy cập trang này');
      navigate('/login');
    } else if (!isAdmin()) {
      toast.error('Quyền truy cập bị từ chối: Yêu cầu vai trò admin');
      navigate('/');
    }
  }, [isLoggedIn, isAdmin, navigate]);

  // Lấy danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Không thể tải danh mục');
        toast.error(err.message || 'Không thể tải danh mục');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Lấy danh sách listing
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        pageNumber: page,
        pageSize: pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };
      const data = await getAdminListings(params);
      setListings(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách listing');
      toast.error(err.message || 'Không thể tải danh sách listing');
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && isAdmin()) {
      fetchListings();
    }
  }, [page, statusFilter, sortBy, sortOrder, isLoggedIn, isAdmin]);

  // Lọc listing
  const filteredListings = useMemo(() => {
    if (!listings || !Array.isArray(listings)) {
      console.warn('Listings không phải mảng hoặc không xác định');
      return [];
    }

    let filtered = [...listings];

    filtered = filtered.filter((listing) => {
      if (!listing) return false;
      const matchesSearch =
        !search ||
        (listing.title && listing.title.toLowerCase().includes(search.toLowerCase())) ||
        (listing.author && listing.author.toLowerCase().includes(search.toLowerCase())) ||
        (listing.ownerName && listing.ownerName.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory =
        categoryFilter === 'all' ||
        listing.categoryName.toLowerCase() === categoryFilter.toLowerCase();
      const price = Number(listing.price) || 0;
      const min = minPrice ? Number(minPrice) : -Infinity;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    return filtered;
  }, [listings, search, categoryFilter, minPrice, maxPrice]);

  // Phân trang
  const paginatedListings = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredListings.slice(startIndex, startIndex + pageSize);
  }, [filteredListings, page]);

  // Điều chỉnh trang khi cần
  useEffect(() => {
    const maxPage = Math.ceil(filteredListings.length / pageSize);
    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    } else if (filteredListings.length === 0) {
      setPage(1);
    }
  }, [filteredListings, page]);

  // Xử lý duyệt listing
  const handleApprove = useCallback(
    async (listingId, rowVersion) => {
      try {
        setLoading(true);
        await approveListing(listingId, rowVersion);
        toast.success('Duyệt listing thành công');
        fetchListings();
      } catch (err) {
        toast.error(err.message || 'Không thể duyệt listing');
        if (err.message.includes('Unauthorized')) {
          navigate('/login');
        } else if (err.message.includes('ConcurrencyConflict')) {
          toast.error('Listing đã được chỉnh sửa bởi người khác. Vui lòng làm mới và thử lại.');
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // Xử lý từ chối listing
  const handleReject = useCallback(
    async (listingId, reason, rowVersion) => {
      try {
        setLoading(true);
        await rejectListing(listingId, reason, rowVersion);
        toast.success('Từ chối listing thành công');
        fetchListings();
      } catch (err) {
        toast.error(err.message || 'Không thể từ chối listing');
        if (err.message.includes('Unauthorized')) {
          navigate('/login');
        } else if (err.message.includes('ConcurrencyConflict')) {
          toast.error('Listing đã được chỉnh sửa bởi người khác. Vui lòng làm mới và thử lại.');
        }
      } finally {
        setLoading(false);
        setIsRejectModalOpen(false);
        setRejectReason('');
        setRejectListingId(null);
        setRejectRowVersion(null);
      }
    },
    [navigate]
  );

  // Mở modal từ chối
  const openRejectModal = useCallback((listingId, rowVersion) => {
    setRejectListingId(listingId);
    setRejectRowVersion(rowVersion);
    setIsRejectModalOpen(true);
  }, []);

  // Xem chi tiết listing
  const handleViewDetails = useCallback((listing) => {
    setSelectedListing(listing);
    setIsDetailsModalOpen(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedListing(null);
  }, []);

  const closeRejectModal = useCallback(() => {
    setIsRejectModalOpen(false);
    setRejectReason('');
    setRejectListingId(null);
    setRejectRowVersion(null);
  }, []);

  // Làm mới dữ liệu
  const handleRefresh = useCallback(() => {
    setPage(1);
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('documenttitle');
    setSortOrder('asc');
    setError(null);
    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 animate-fade-in">Quản lý yêu cầu đăng bán</h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSyncAlt} />
            Làm mới
          </button>
        </div>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, tác giả, hoặc người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Đang chờ</option>
            <option value="Active">Đã duyệt</option>
            <option value="Rejected">Đã từ chối</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading || categories.length === 0}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryName.toLowerCase()}>
                {category.categoryName}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Giá tối thiểu"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="p-3 border rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          />
          <input
            type="number"
            placeholder="Giá tối đa"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="p-3 border rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          >
            <option value="documenttitle">Sắp xếp theo tiêu đề</option>
            <option value="ownername">Sắp xếp theo người dùng</option>
            <option value="statusname">Sắp xếp theo trạng thái</option>
            <option value="listingtype">Sắp xếp theo loại listing</option>
            <option value="createdat">Sắp xếp theo ngày tạo</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          >
            <option value="asc">Tăng dần</option>
            <option value="desc">Giảm dần</option>
          </select>
        </div>
        <p className="mb-6 text-gray-600">Tổng số listing: {listings.length} (Đã lọc: {filteredListings.length})</p>
        {loading ? (
          <div className="text-center text-gray-600 py-6">Đang tải...</div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center text-gray-600 py-6">
            <p>Không có listing nào khớp với tiêu chí. Vui lòng điều chỉnh bộ lọc hoặc làm mới.</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử làm mới
            </button>
          </div>
        ) : (
          <>
            <div className="md:hidden">
              {paginatedListings.map((listing) => (
                <div key={listing.listingId} className="border-b p-4">
                  <div className="flex items-center gap-2">
                    {listing.imageUrl && (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title || 'Sách'}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <p>
                      <strong>Tiêu đề:</strong>{' '}
                      <button
                        onClick={() => handleViewDetails(listing)}
                        className="text-blue-600 hover:underline"
                      >
                        {listing.title}
                      </button>
                    </p>
                  </div>
                  <p><strong>Tác giả:</strong> {listing.author}</p>
                  <p><strong>Giá:</strong> {listing.price ? `$${Number(listing.price).toFixed(2)}` : 'Không có'}</p>
                  <p><strong>Danh mục:</strong> {listing.categoryName}</p>
                  <p><strong>Người đăng:</strong> {listing.ownerName}</p>
                  <p><strong>Loại:</strong> {listing.listingType === 0 ? 'Bán' : 'Trao đổi'}</p>
                  <p><strong>Trạng thái:</strong> {listing.statusName}</p>
                  <div className="mt-2 flex gap-2">
                    {listing.statusName === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(listing.listingId, listing.rowVersion)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          disabled={loading}
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => openRejectModal(listing.listingId, listing.rowVersion)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          disabled={loading}
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Hình ảnh</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tiêu đề</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tác giả</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Giá</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Danh mục</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Người đăng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Loại</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedListings.map((listing) => (
                    <tr key={listing.listingId} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {listing.imageUrl ? (
                          <img
                            src={listing.imageUrl}
                            alt={listing.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <span>Không có hình</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button
                          onClick={() => handleViewDetails(listing)}
                          className="text-blue-600 hover:underline"
                        >
                          {listing.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{listing.author}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {listing.price ? `$${Number(listing.price).toFixed(2)}` : 'Không có'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{listing.categoryName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{listing.ownerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{listing.listingType === 0 ? 'Bán' : 'Trao đổi'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            listing.statusName === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : listing.statusName === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : listing.statusName === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {listing.statusName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex space-x-2">
                        {listing.statusName === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(listing.listingId, listing.rowVersion)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                              disabled={loading}
                              title="Duyệt listing"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                            <button
                              onClick={() => openRejectModal(listing.listingId, listing.rowVersion)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              disabled={loading}
                              title="Từ chối listing"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <span className="text-gray-600">Trang {page} / {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
            {isDetailsModalOpen && selectedListing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                  <h2 className="text-xl font-bold mb-4 text-blue-800">Chi tiết listing</h2>
                  {selectedListing.imageUrl ? (
                    <img
                      src={selectedListing.imageUrl}
                      alt={selectedListing.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <p className="text-gray-600 mb-4">Không có hình ảnh</p>
                  )}
                  <p><strong>ID:</strong> {selectedListing.listingId}</p>
                  <p><strong>Tiêu đề:</strong> {selectedListing.title}</p>
                  <p><strong>Tác giả:</strong> {selectedListing.author}</p>
                  <p><strong>Giá:</strong> {selectedListing.price ? `$${Number(selectedListing.price).toFixed(2)}` : 'Không có'}</p>
                  <p><strong>Danh mục:</strong> {selectedListing.categoryName}</p>
                  <p><strong>Mô tả:</strong> {selectedListing.description || 'Không có'}</p>
                  <p><strong>Trạng thái:</strong> {selectedListing.statusName}</p>
                  <p><strong>Người đăng:</strong> {selectedListing.ownerName}</p>
                  <p><strong>Loại listing:</strong> {selectedListing.listingType === 0 ? 'Bán' : 'Trao đổi'}</p>
                  {selectedListing.listingType === 1 && (
                    <p><strong>ID sách mong muốn:</strong> {selectedListing.desiredDocumentId || 'Không có'}</p>
                  )}
                  <p><strong>Ngày tạo:</strong> {new Date(selectedListing.createdAt).toLocaleString()}</p>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={closeDetailsModal}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      disabled={loading}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
            {isRejectModalOpen && rejectListingId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                  <h2 className="text-xl font-bold mb-4 text-blue-800">Từ chối listing</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-1">Lý do từ chối *</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Nhập lý do từ chối (tối đa 500 ký tự)"
                        maxLength={500}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={closeRejectModal}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 shadow-sm"
                        disabled={loading}
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleReject(rejectListingId, rejectReason, rejectRowVersion)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm"
                        disabled={loading || !rejectReason.trim()}
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBooksPage;