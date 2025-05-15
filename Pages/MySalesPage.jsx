import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getMySales, confirmOrder, rejectOrder } from '../src/API/api';

const MySalesPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [rejectModalOrderId, setRejectModalOrderId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = { page, pageSize };
      const response = await getMySales(queryParams);
      console.log('Dữ liệu đơn hàng từ getMySales:', response);
      setOrders(response.items.map(item => ({
        ...item,
        orderStatus: item.orderStatus?.trim() // Chuẩn hóa orderStatus
      })) || []);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      console.error('Fetch sales error:', err);
      setError(err.message || 'Không thể tải danh sách đơn hàng');
      toast.error(err.message || 'Không thể tải danh sách đơn hàng');
      if (err.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId, rowVersion) => {
    try {
      const response = await confirmOrder(orderId, { rowVersion });
      setOrders(orders.map(order => order.orderId === orderId ? {
        ...response,
        orderStatus: response.orderStatus?.trim()
      } : order));
      toast.success(`Đơn hàng #${orderId} đã được xác nhận!`);
    } catch (error) {
      console.error('Confirm order error:', error);
      toast.error(error.message || 'Không thể xác nhận đơn hàng');
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    if (rejectReason.length > 500) {
      toast.error('Lý do từ chối không được vượt quá 500 ký tự');
      return;
    }
    try {
      const order = orders.find(o => o.orderId === rejectModalOrderId);
      const response = await rejectOrder(rejectModalOrderId, { rowVersion: order.rowVersion, reason: rejectReason });
      setOrders(orders.map(o => o.orderId === rejectModalOrderId ? {
        ...response,
        orderStatus: response.orderStatus?.trim()
      } : o));
      setRejectModalOrderId(null);
      setRejectReason('');
      toast.success(`Đơn hàng #${rejectModalOrderId} đã được từ chối!`);
    } catch (error) {
      console.error('Reject order error:', error);
      toast.error(error.message || 'Không thể từ chối đơn hàng');
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để xem đơn hàng');
      navigate('/login');
      return;
    }
    console.log('Người dùng hiện tại:', user);
    fetchSales();
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
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Đơn hàng đã bán</h1>
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
              {orders.map((order) => {
                const isSeller = user?.id && order?.sellerId ? String(user.id).trim() === String(order.sellerId).trim() : false;
                console.log(`Đơn hàng #${order.orderId} - Trạng thái: ${order.orderStatus}, isSeller: ${isSeller}`, {
                  userIdRaw: user?.id,
                  sellerIdRaw: order?.sellerId,
                  userIdConverted: String(user?.id).trim(),
                  sellerIdConverted: String(order?.sellerId).trim(),
                  userType: typeof user?.id,
                  sellerIdType: typeof order?.sellerId
                });
                return (
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
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => navigate(`/orders/${order.orderId}`)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Xem chi tiết
                      </button>
                      {isSeller && order.orderStatus === 'PendingSellerConfirmation' && (
                        <>
                          <button
                            onClick={() => handleConfirmOrder(order.orderId, order.rowVersion)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => setRejectModalOrderId(order.orderId)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
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

      {/* Modal từ chối đơn hàng */}
      {rejectModalOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Từ chối đơn hàng #{rejectModalOrderId}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Lý do từ chối</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Nhập lý do từ chối..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{rejectReason.length}/500 ký tự</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalOrderId(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectOrder}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySalesPage;