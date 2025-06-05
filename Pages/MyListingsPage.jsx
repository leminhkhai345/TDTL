import React, { useState, useEffect } from "react";
import { getMyListings } from "../src/API/api";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;
  const location = useLocation();

  // Lấy userId từ query string
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");

  const fetchListings = async () => {
    setLoading(true);
    try {
      console.log('Calling getMyListings:', { page, pageSize, userId });
      const data = await getMyListings(page, pageSize, userId ? { userId } : {});
      console.log('getMyListings response:', data);
      setListings(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching listings:', err);
      toast.error(err.message || 'Failed to fetch my listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, userId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">
          {userId ? `Sách đã đăng bán của người dùng ${userId}` : "Sách của tôi"}
        </h1>
        <button
          onClick={fetchListings}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSyncAlt} />
          Làm mới
        </button>
      </div>
      {loading ? (
        <p className="text-center text-gray-600">Đang tải...</p>
      ) : listings.length === 0 ? (
        <p className="text-center text-gray-600">Không tìm thấy sách nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.listingId} className="border rounded-lg p-4 shadow">
              <img
                src={listing.imageUrl || "https://via.placeholder.com/150"}
                alt={listing.title}
                className="w-full h-48 object-cover rounded"
              />
              <h3 className="text-lg font-semibold mt-2">{listing.title}</h3>
              <p className="text-gray-600">Tác giả: {listing.author}</p>
              <p className="text-gray-600">Giá: ${listing.price}</p>
              <p className="text-gray-600">Danh mục: {listing.categoryName}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1 || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Trang trước
        </button>
        <span className="text-gray-600">Trang {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={listings.length < pageSize || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default MyListingsPage;