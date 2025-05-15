import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getUserOrderById, confirmOrder, rejectOrder, shipOrder, deliverOrder, cancelOrder, confirmMoney } from '../src/API/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm chuẩn hóa orderStatus
  const normalizeStatus = (status) => {
    return status?.trim().replace(/\s+/g, '');
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!orderId || isNaN(parseInt(orderId))) {
        throw new Error('ID đơn hàng không hợp lệ.');
      }
      const orderData = await getUserOrderById(orderId);
      if (!orderData) {
        throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền xem.');
      }
      console.log('Fetched order:', orderData);
      setOrder({
        ...orderData,
        orderStatus: normalizeStatus(orderData.orderStatus) // Chuẩn hóa orderStatus
      });
    } catch (err) {
      console.error('Fetch order error:', err);
      setError(err.message || 'Không thể tải chi tiết đơn hàng');
      toast.error(err.message || 'Không thể tải chi tiết đơn hàng');
      if (err.message.includes('Unauthorized') || err.message.includes('No authentication token')) {
        toast.info('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để xem chi tiết đơn hàng');
      navigate('/login');
      return;
    }
    console.log('Current user:', user);
    fetchOrderDetails();
  }, [orderId, isLoggedIn, navigate]);

  const handleConfirmOrder = async () => {
    if (!order || order.orderStatus !== 'PendingSellerConfirmation') {
      toast.error('Đơn hàng không ở trạng thái chờ xác nhận');
      setIsConfirmModalOpen(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await confirmOrder(orderId, { rowVersion: order.rowVersion });
      setOrder({
        ...response,
        orderStatus: normalizeStatus(response.orderStatus)
      });
      setIsConfirmModalOpen(false);
      toast.success(`Đơn hàng đã được xác nhận! Trạng thái mới: ${response.orderStatus}`);
    } catch (error) {
      console.error('Confirm order error:', error);
      toast.error(error.message || 'Không thể xác nhận đơn hàng');
    } finally {
      setIsSubmitting(false);
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
    if (!order || order.orderStatus !== 'PendingSellerConfirmation') {
      toast.error('Đơn hàng không ở trạng thái chờ xác nhận');
      setIsRejectModalOpen(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await rejectOrder(orderId, { rowVersion: order.rowVersion, reason: rejectReason });
      setOrder({
        ...response,
        orderStatus: normalizeStatus(response.orderStatus)
      });
      setIsRejectModalOpen(false);
      setRejectReason('');
      toast.success('Đơn hàng đã được từ chối!');
    } catch (error) {
      console.error('Reject order error:', error);
      toast.error(error.message || 'Không thể từ chối đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShipOrder = async () => {
    if (!shippingProvider.trim() || !trackingNumber.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin vận chuyển');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await shipOrder(orderId, {
        shippingProvider,
        trackingNumber,
        rowVersion: order.rowVersion,
      });
      setOrder({
        ...response,
        orderStatus: normalizeStatus(response.orderStatus)
      });
      setIsShipModalOpen(false);
      setShippingProvider('');
      setTrackingNumber('');
      toast.success('Đơn hàng đã được cập nhật trạng thái giao hàng!');
    } catch (error) {
      console.error('Ship order error:', error);
      toast.error(error.message || 'Không thể cập nhật trạng thái giao hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliverOrder = async () => {
    setIsSubmitting(true);
    try {
      const response = await deliverOrder(orderId, { rowVersion: order.rowVersion });
      setOrder({
        ...response,
        orderStatus: normalizeStatus(response.orderStatus)
      });
      toast.success('Đã xác nhận nhận hàng!');
    } catch (error) {
      console.error('Deliver order error:', error);
      toast.error(error.message || 'Không thể xác nhận nhận hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }
    if (cancelReason.length > 500) {
      toast.error('Lý do hủy không được vượt quá 500 ký tự');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await cancelOrder(orderId, { rowVersion: order.rowVersion, reason: cancelReason });
      setOrder({
        ...response,
        orderStatus: normalizeStatus(response.orderStatus)
      });
      setIsCancelModalOpen(false);
      setCancelReason('');
      toast.success('Đơn hàng đã được hủy!');
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error(error.message || 'Không thể hủy đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmMoney = async () => {
    setIsSubmitting(true);
    try {
      const response = await confirmMoney(orderId, { rowVersion: order.rowVersion });
      setOrder({
        ...response,
        orderStatus: normalizeStatus(response.orderStatus)
      });
      toast.success('Đã xác nhận nhận tiền!');
    } catch (error) {
      console.error('Confirm money error:', error);
      toast.error(error.message || 'Không thể xác nhận nhận tiền');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-6">Đang tải...</div>;

  if (error || !order) {
    return (
      <div className="text-center text-red-600 py-6">
        {error || 'Không tìm thấy đơn hàng'}
        <button
          onClick={() => navigate('/browse')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Quay lại duyệt sách"
        >
          Quay lại duyệt sách
        </button>
      </div>
    );
  }

  const isSeller = user?.id && order?.sellerId ? String(user.id).trim() === String(order.sellerId).trim() : false;
  const isBuyer = user?.id && order?.buyerId ? String(user.id).trim() === String(order.buyerId).trim() : false;

  console.log('Render condition:', {
    isSeller,
    isBuyer,
    orderStatus: order.orderStatus,
    orderStatusRaw: order.orderStatus,
    orderStatusNormalized: normalizeStatus(order.orderStatus),
    userIdRaw: user?.id,
    sellerIdRaw: order?.sellerId,
    buyerIdRaw: order?.buyerId,
    userIdConverted: String(user?.id).trim(),
    sellerIdConverted: String(order?.sellerId).trim(),
    buyerIdConverted: String(order?.buyerId).trim(),
    userType: typeof user?.id,
    sellerIdType: typeof order?.sellerId,
    buyerIdType: typeof order?.buyerId
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Chi tiết đơn hàng #{order.orderId}</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
            <p><strong>ID đơn hàng:</strong> {order.orderId}</p>
            <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleString()}</p>
            <p>
              <strong>Trạng thái:</strong>
              <span
                className={`px-2 py-1 rounded-full text-xs ml-2 ${
                  order.orderStatus === 'PendingSellerConfirmation'
                    ? 'bg-yellow-100 text-yellow-800'
                    : order.orderStatus === 'AwaitingOfflinePayment'
                    ? 'bg-blue-100 text-blue-800'
                    : order.orderStatus === 'PendingShipment'
                    ? 'bg-orange-100 text-orange-800'
                    : order.orderStatus === 'Shipped'
                    ? 'bg-green-100 text-green-800'
                    : order.orderStatus === 'Delivered' || order.orderStatus === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : order.orderStatus.includes('Cancelled')
                    ? 'bg-red-100 text-red-800'
                    : order.orderStatus.includes('Rejected')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {order.orderStatus}
              </span>
            </p>
            <p><strong>Tổng tiền:</strong> ${parseFloat(order.totalAmount).toFixed(2)}</p>
            {order.notes && <p><strong>Ghi chú:</strong> {order.notes}</p>}
            {order.rejectionReason && <p><strong>Lý do từ chối:</strong> {order.rejectionReason}</p>}
            {order.cancellationReason && <p><strong>Lý do hủy:</strong> {order.cancellationReason}</p>}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <p><strong>Địa chỉ:</strong> {order.shippingAddress || 'Không có'}</p>
            <p><strong>Phương thức thanh toán:</strong> {order.paymentMethodName || 'Không xác định'}</p>
            {order.shippingProvider && <p><strong>Nhà vận chuyển:</strong> {order.shippingProvider}</p>}
            {order.trackingNumber && <p><strong>Mã theo dõi:</strong> {order.trackingNumber}</p>}
            {order.proofImageUrl && (
              <div className="mt-2">
                <p><strong>Bằng chứng thanh toán:</strong></p>
                <img
                  src={order.proofImageUrl}
                  alt="Bằng chứng thanh toán"
                  className="w-32 h-32 object-cover rounded mt-1"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <img
                src={order.imageUrl || 'https://via.placeholder.com/150'}
                alt={order.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p><strong>Tiêu đề:</strong> {order.title || 'Không rõ tiêu đề'}</p>
                <p><strong>Tác giả:</strong> {order.author || 'Không rõ tác giả'}</p>
                <p><strong>Giá:</strong> ${parseFloat(order.totalAmount).toFixed(2)}</p>
                <p><strong>Số lượng:</strong> 1</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          {isSeller && order.orderStatus === 'PendingSellerConfirmation' && (
            <>
              <button
                onClick={() => setIsConfirmModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Xác nhận đơn hàng"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
              </button>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Từ chối đơn hàng"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Từ chối đơn hàng'}
              </button>
            </>
          )}
          {isSeller && order.orderStatus === 'PendingShipment' && (
            <button
              onClick={() => setIsShipModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              aria-label="Gửi hàng"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Gửi hàng'}
            </button>
          )}
          {isBuyer && order.orderStatus === 'Shipped' && (
            <button
              onClick={handleDeliverOrder}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              aria-label="Xác nhận nhận hàng"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận nhận hàng'}
            </button>
          )}
          {(isBuyer || isSeller) &&
            ['PendingSellerConfirmation', 'AwaitingOfflinePayment', 'PendingShipment'].includes(order.orderStatus) && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Hủy đơn hàng"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Hủy đơn hàng'}
              </button>
            )}
          {isSeller &&
            (order.orderStatus === 'AwaitingOfflinePayment' ||
              (order.orderStatus === 'Delivered' && order.paymentMethodName === 'COD')) && (
              <button
                onClick={handleConfirmMoney}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Xác nhận nhận tiền"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận nhận tiền'}
              </button>
            )}
          {isBuyer && order.orderStatus === 'AwaitingOfflinePayment' && order.paymentMethodName === 'BankTransfer' && (
            <button
              onClick={() => navigate(`/orders/${order.orderId}/confirm-payment`, { state: { rowVersion: order.rowVersion } })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              aria-label="Hoàn tất thanh toán"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất thanh toán'}
            </button>
          )}
          <button
            onClick={() => navigate('/browse')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            aria-label="Quay lại duyệt sách"
          >
            Quay lại duyệt sách
          </button>
        </div>
      </div>

      {/* Modal xác nhận đơn hàng */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="confirm-modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Đóng modal xác nhận"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 id="confirm-modal-title" className="text-xl font-bold mb-4 text-blue-700">Xác nhận đơn hàng</h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Đơn hàng:</strong> #{order.orderId}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Sách:</strong> {order.title}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Tổng tiền:</strong> ${parseFloat(order.totalAmount).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn xác nhận đơn hàng này? Trạng thái sẽ chuyển thành{' '}
              {order.paymentMethodName === 'BankTransfer' ? 'Đang chờ thanh toán' : 'Đang chờ gửi hàng'}.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Hủy"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmOrder}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Xác nhận đơn hàng"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối đơn hàng */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="reject-modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Đóng modal từ chối"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 id="reject-modal-title" className="text-xl font-bold mb-4 text-blue-700">Từ chối đơn hàng</h2>
            <div className="mb-4">
              <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-600">
                Lý do từ chối
              </label>
              <textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Nhập lý do từ chối..."
                maxLength={500}
                aria-required="true"
              />
              <p className="text-xs text-gray-500 mt-1">{rejectReason.length}/500 ký tự</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Hủy"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectOrder}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Xác nhận từ chối"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal gửi hàng */}
      {isShipModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="ship-modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setIsShipModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Đóng modal giao hàng"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 id="ship-modal-title" className="text-xl font-bold mb-4 text-blue-700">Cập nhật thông tin giao hàng</h2>
            <div className="mb-4">
              <label htmlFor="shippingProvider" className="block text-sm font-medium text-gray-600">
                Nhà vận chuyển
              </label>
              <input
                id="shippingProvider"
                type="text"
                value={shippingProvider}
                onChange={(e) => setShippingProvider(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên nhà vận chuyển..."
                aria-required="true"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-600">
                Mã theo dõi
              </label>
              <input
                id="trackingNumber"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mã theo dõi..."
                aria-required="true"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsShipModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Hủy"
              >
                Hủy
              </button>
              <button
                onClick={handleShipOrder}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Xác nhận giao hàng"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận giao hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hủy đơn hàng */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="cancel-modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Đóng modal hủy"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 id="cancel-modal-title" className="text-xl font-bold mb-4 text-blue-700">Hủy đơn hàng</h2>
            <div className="mb-4">
              <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-600">
                Lý do hủy
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Nhập lý do hủy..."
                maxLength={500}
                aria-required="true"
              />
              <p className="text-xs text-gray-500 mt-1">{cancelReason.length}/500 ký tự</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Hủy"
              >
                Hủy
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Xác nhận hủy"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;