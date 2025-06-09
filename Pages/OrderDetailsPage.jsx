import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getUserOrderById, confirmOrder, rejectOrder, shipOrder, deliverOrder, cancelOrder, confirmMoney, getReviewByOrderId, getPublicPaymentMethods, getListingById } from '../src/API/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faStar, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import ReviewForm from '../Components/ReviewForm';
import { deleteUserReview } from '../src/API/api';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodName, setPaymentMethodName] = useState('');

  // Hàm chuẩn hóa orderStatus
  const normalizeStatus = (status) => {
    return status?.trim().replace(/\s+/g, '');
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!orderId || isNaN(parseInt(orderId))) {
          throw new Error('ID đơn hàng không hợp lệ.');
        }
        // Lấy danh sách phương thức thanh toán
        const methods = await getPublicPaymentMethods();
        setPaymentMethods(methods);

        const orderData = await getUserOrderById(orderId);
        console.log(orderData);
        if (!orderData) {
          throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền xem.');
        }
        // Map tên phương thức thanh toán
        let methodName = orderData.paymentMethodName;
        if (!methodName && methods && Array.isArray(methods)) {
          const matched = methods.find(
            (pm) =>
              pm.paymentMethodId === orderData.paymentMethodId ||
              pm.PaymentMethodId === orderData.paymentMethodId
          );
          methodName = matched
            ? matched.name || matched.Name
            : 'Không xác định';
        }
        setPaymentMethodName(methodName);

        setOrder({
          ...orderData,
          orderStatus: normalizeStatus(orderData.orderStatus),
        });

        // Lấy thông tin sản phẩm từ listingId
        if (orderData.listingId) {
          console.log('listingId:', orderData.listingId);
          try {
            const listing = await getListingById(orderData.listingId);
            console.log('listing from getListingById:', listing);
            setProduct(listing);
          } catch (err) {
             console.log('Error getListingById:', err);
            setProduct(null);
          }
        }

        // Kiểm tra review từ API
        try {
          const reviewData = await getReviewByOrderId(orderId);
          setExistingReview(reviewData);
          // Nếu có review, cập nhật state order
          if(reviewData) {
            setOrder(prev => ({
              ...prev,
              hasReview: true
            }));
          }
        } catch (err) {
          console.log('No review found');
          setExistingReview(null);
        }
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

    fetchOrderDetails();
  }, [orderId, isLoggedIn, navigate]);

  const handleConfirmOrder = async () => {
    if (!order || order.orderStatus !== 'PendingSellerConfirmation') {
      toast.error('Đơn hàng không ở trạng thái chờ xác nhận');
      setIsConfirmModalOpen(false);
      return;
    }
    setIsSubmitting(true);

    // Error messages for order operations
    try {
      const response = await confirmOrder(orderId, { RowVersion: order.rowVersion });
      
      setOrder({
        ...response,
        orderStatus: normalizeStatus(response.orderStatus),
      });
      setIsConfirmModalOpen(false);
      toast.success(`Đơn hàng đã được xác nhận! Trạng thái mới: ${response.orderStatus}`);
    } catch (error) {
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
        orderStatus: normalizeStatus(response.orderStatus),
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
        orderStatus: normalizeStatus(response.orderStatus),
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
        orderStatus: normalizeStatus(response.orderStatus),
      });
      toast.success('Đã xác nhận nhận hàng!');
      // Làm mới dữ liệu để kiểm tra trạng thái đánh giá
      fetchOrderDetails();
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
    // Cancel order
    try {
      await cancelOrder(orderId);
      setOrder({
        ...response,
        orderStatus: normalizeStatus(response.orderStatus),
      });
      setIsCancelModalOpen(false);
      setCancelReason('');
      toast.success('Đơn hàng đã được hủy!');
    } catch (error) {
      toast.error('Không thể hủy đơn hàng. Vui lòng thử lại.');
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
        orderStatus: normalizeStatus(response.orderStatus),
      });
      toast.success('Đã xác nhận nhận tiền!');
    } catch (error) {
      console.error('Confirm money error:', error);
      toast.error(error.message || 'Không thể xác nhận nhận tiền');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    setIsSubmitting(true);
    try {
      await deleteUserReview(existingReview.reviewId, existingReview.rowVersion);
      setExistingReview(null);
      toast.success('Đánh giá đã được xóa!');
      setIsDeleteModalOpen(false);
      fetchOrderDetails();
    } catch (error) {
      console.error('Delete review error:', error);
      toast.error(error.message || 'Không thể xóa đánh giá');
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
    buyerIdType: typeof order?.buyerId,
  });

  console.log('order.paymentMethodName:', order.paymentMethodName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-6 p-8 bg-white rounded-xl shadow-lg w-full max-w-4xl mx-auto">
          {/* Header with Icon */}
          <div className="flex flex-col items-center border-b pb-6">
            <div className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
              <FontAwesomeIcon 
                icon={faBoxOpen} 
                className="text-6xl text-white"
                aria-label="Order icon"
              />
            </div>
            <h2 className="text-3xl font-bold text-blue-800">Order Details</h2>
            <p className="text-gray-600">Order #{order.orderId}</p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Information */}
            <div className="space-y-6">
              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Order Date
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                  {new Date(order.orderDate).toLocaleString()}
                </div>
              </div>

              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Status
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
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
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Total Amount
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                  ${parseFloat(order.totalAmount).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Shipping Address
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                  {order.shippingAddress || 'Not available'}
                </div>
              </div>

              <div className="relative">
                <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Payment Method
                </label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                  {paymentMethodName || 'Not specified'}
                </div>
              </div>

              {order.shippingProvider && (
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Shipping Provider
                  </label>
                  <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                    {order.shippingProvider}
                    {order.trackingNumber && (
                      <div className="text-sm text-gray-500 mt-1">
                        Tracking Number: {order.trackingNumber}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="border-t pt-6 mt-6">
            {/* Header */}
            <div className="flex flex-col items-center border-b pb-6 mb-6">
              <h2 className="text-3xl font-bold text-blue-800">Product Details</h2>
              <p className="text-gray-600">View product information</p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Image */}
              <div className="space-y-6">
                {product?.imageUrl ? (
                  <img
                    src={product.imageUrl || order.imageUrl}
                    alt={product?.title || order.title}
                    className="w-full h-[400px] object-cover rounded-lg shadow-md"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/400')}
                  />
                ) : (
                  <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Title
                  </label>
                  <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                    {product?.title || order.title || "No information"}
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Author
                  </label>
                  <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                    {product?.author || order.author || "No information"}
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Price
                  </label>
                  <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                    ${product?.price !== undefined ? Number(product.price).toFixed(2) : (order.totalAmount ? Number(order.totalAmount).toFixed(2) : 'N/A')}
                  </div>
                </div>

                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Category
                  </label>
                  <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                    {product?.categoryName || order.categoryName || "No information"}
                  </div>
                </div>

                {product?.description && (
                  <div className="relative">
                    <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Description
                    </label>
                    <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50">
                      {product.description}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Status
                  </label>
                  <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 flex justify-center">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      product?.statusName === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : product?.statusName === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product?.statusName || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Section */}
          {existingReview && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-6">Your Review</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={`text-xl ${i < existingReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p><strong>Comment:</strong> {existingReview.comment}</p>
                <p><strong>Type:</strong> {existingReview.reviewType === 'Constructive' ? 'Constructive Feedback' : 'Report Violation'}</p>
                <p><strong>Evidence:</strong></p>
                {existingReview.evidences?.length > 0 && (
                  <div className="mt-2">
                    <p><strong>Bằng chứng:</strong></p>
                    <div className="flex gap-2 flex-wrap">
                      {existingReview.evidences.map((evidence, index) => (
                        <div key={index}>
                          {evidence.fileType.includes('video') ? (
                            <video src={evidence.fileUrl} className="w-20 h-20 object-cover rounded" controls />
                          ) : (
                            <img src={evidence.fileUrl} alt="Evidence" className="w-20 h-20 object-cover rounded" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    aria-label="Chỉnh sửa đánh giá"
                  >
                    Chỉnh sửa đánh giá
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    aria-label="Xóa đánh giá"
                  >
                    Xóa đánh giá
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            {isSeller && order.orderStatus === 'PendingSellerConfirmation' && (
              <>
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  aria-label="Xác nhận đơn hàng"
                >
                  {isSubmitting ? 'Processing...' : 'Xác nhận đơn hàng'}
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  aria-label="Từ chối đơn hàng"
                >
                  {isSubmitting ? 'Processing...' : 'Từ chối đơn hàng'}
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
                {isSubmitting ? 'Processing...' : 'Gửi hàng'}
              </button>
            )}
            {isBuyer && order.orderStatus === 'Shipped' && (
              <button
                onClick={handleDeliverOrder}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Xác nhận nhận hàng"
              >
                {isSubmitting ? 'Processing...' : 'Xác nhận nhận hàng'}
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
                  {isSubmitting ? 'Processing...' : 'Hủy đơn hàng'}
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
                {isSubmitting ? 'Processing...' : 'Xác nhận nhận tiền'}
              </button>
            )}
            {isBuyer && order.orderStatus === 'AwaitingOfflinePayment' && (!order.paymentMethodName || order.paymentMethodName === 'BankTransfer') && (
              <button
                onClick={() => navigate(`/orders/${order.orderId}/confirm-payment`, { state: { rowVersion: order.rowVersion } })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Complete Payment"
              >
                {isSubmitting ? 'Processing...' : 'Complete Payment'}
              </button>
            )}
            {isBuyer && 
  (order.orderStatus === 'Delivered' || order.orderStatus === 'Completed') && (
    <>
      {(!existingReview && !order.hasReview) ? (
        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Write a review
        </button>
      ) : (
        <button 
          disabled
          className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
        >
          Đã đánh giá
        </button>
      )}
    </>
)}
            <button
              onClick={() => navigate('/browse')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              aria-label="Quay lại duyệt sách"
            >
              Return to book review
            </button>
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

          {/* Modal đánh giá */}
          {isReviewModalOpen && (
            <ReviewForm
              isOpen={isReviewModalOpen}
              onClose={() => setIsReviewModalOpen(false)}
              order={order}
              review={existingReview}
              onSubmitSuccess={(review) => {
                setExistingReview(review);
                // Cập nhật order để lưu trạng thái đã review
                setOrder(prev => ({
                  ...prev,
                  hasReview: true // Thêm trường để đánh dấu đã có review
                }));
                setIsReviewModalOpen(false);
                toast.success('Đánh giá thành công');
              }}
            />
          )}

          {/* Modal xóa đánh giá */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="delete-modal-title">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                  aria-label="Đóng modal xóa"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <h2 id="delete-modal-title" className="text-xl font-bold mb-4 text-blue-700">Xóa đánh giá</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Bạn có chắc muốn xóa đánh giá cho đơn hàng #{order.orderId}? Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                    aria-label="Hủy"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                    aria-label="Xác nhận xóa"
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận xóa'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;