import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getMyPurchases } from '../src/API/api';

const MyPurchasesPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = { page, pageSize };
      const response = await getMyPurchases(queryParams);
      setOrders(response.items || []);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đơn hàng');
      toast.error(err.message || 'Không thể tải danh sách đơn hàng');
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để xem đơn hàng');
      navigate('/login');
      return;
    }
    fetchPurchases();
  }, [page, isLoggedIn, navigate]);

  if (loading) return <div className="text-center py-6">Đang tải...</div>;

  if (error) {
    return (
      <div className="text-center text-red-600 py-6">
        {error}
        <button
          onClick={() => navigate('/browse')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Quay lại duyệt sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Đơn hàng đã mua</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-600">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ngày đặt</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId} className="border-b">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button
                      onClick={() => navigate(`/orders/${order.orderId}`)}
                      className="text-blue-600 hover:underline"
                    >
                      #{order.orderId}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(order.orderDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.orderStatus === 'PendingSellerConfirmation' ? 'bg-yellow-100 text-yellow-800' :
                      order.orderStatus === 'AwaitingOfflinePayment' ? 'bg-blue-100 text-blue-800' :
                      order.orderStatus === 'PendingShipment' ? 'bg-orange-100 text-orange-800' :
                      order.orderStatus === 'Shipped' ? 'bg-green-100 text-green-800' :
                      order.orderStatus === 'Delivered' || order.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.orderStatus.includes('Cancelled') ? 'bg-red-100 text-red-800' :
                      order.orderStatus.includes('Rejected') ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => navigate(`/orders/${order.orderId}`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Trang trước
        </button>
        <span className="text-gray-600">Trang {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page * pageSize >= totalCount}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default MyPurchasesPage;