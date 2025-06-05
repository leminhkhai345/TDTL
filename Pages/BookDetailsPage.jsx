import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../src/contexts/CartContext';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getListingById, createOrder } from '../src/API/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const BookDetailsPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [hasOrdered, setHasOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!listingId || listingId === 'undefined' || isNaN(parseInt(listingId))) {
        throw new Error('ID danh sách không hợp lệ. Vui lòng kiểm tra liên kết hoặc thử sách khác.');
      }
      const listingData = await getListingById(listingId);
      if (!listingData) {
        throw new Error('Sách không tồn tại hoặc chưa được phê duyệt để hiển thị.');
      }
      // Lọc các phương thức thanh toán được kích hoạt
      const validPaymentMethods = listingData.acceptedPaymentMethods?.filter(method => method.isEnabled) || [];
      setListing({
        ...listingData,
        acceptedPaymentMethods: validPaymentMethods,
      });
      if (validPaymentMethods.length === 1) {
        setPaymentMethodId(validPaymentMethods[0].paymentMethodId);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết sách');
      toast.error(err.message || 'Không thể tải chi tiết sách');
      if (err.message.includes('Unauthorized') || err.message.includes('No authentication token')) {
        toast.info('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để xem chi tiết sách');
      navigate('/login');
      return;
    }
    fetchListingDetails();
  }, [listingId, isLoggedIn, navigate]);

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    if (listing.statusName !== 'Active') {
      toast.error('Sách này không thể mua vì chưa được phê duyệt.');
      return;
    }
    if (!listing.acceptedPaymentMethods || listing.acceptedPaymentMethods.length === 0) {
      toast.error('Không có phương thức thanh toán nào khả dụng cho sách này.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsConfirmModalOpen(false);
    setShippingAddress('');
    setPaymentMethodId(
      listing?.acceptedPaymentMethods?.length === 1
        ? listing.acceptedPaymentMethods[0].paymentMethodId
        : null
    );
  };

  const handleProceedToConfirm = () => {
    if (!shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }
    if (shippingAddress.length > 255) {
      toast.error('Địa chỉ giao hàng không được vượt quá 255 ký tự.');
      return;
    }
    if (!paymentMethodId) {
      toast.error('Vui lòng chọn phương thức thanh toán.');
      return;
    }
    setIsModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleModalSubmit = async () => {
    setIsSubmitting(true);
    const selectedPaymentMethod = listing.acceptedPaymentMethods.find(
      (method) => method.paymentMethodId === paymentMethodId
    );
    const orderData = {
      listingId: listing.listingId,
      shippingAddress,
      paymentMethodId,
      notes: '',
      paymentMethodName: selectedPaymentMethod?.name || '',
    };

    try {
      const response = await createOrder(orderData);
      toast.success(`Đơn hàng #${response.orderId} đã được tạo thành công!`);
      setIsConfirmModalOpen(false);
      setHasOrdered(true);
      if (response.paymentMethodName === 'BankTransfer') {
        navigate(`/orders/${response.orderId}/confirm-payment`, {
          state: { rowVersion: response.rowVersion },
        });
      } else {
        navigate(`/orders/${response.orderId}`);
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tạo đơn hàng.');
      if (error.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (listing) {
      const mappedListing = {
        listingId: listing.listingId,
        documentId: listing.documentId,
        title: listing.title || 'Unknown Title',
        author: listing.author || 'Unknown Author',
        categoryName: listing.categoryName || 'Unknown Category',
        price: listing.price !== null ? listing.price : null,
        image: listing.imageUrl || 'https://via.placeholder.com/150',
        description: listing.description || 'No description available',
      };
      addToCart(mappedListing);
      toast.success(`${mappedListing.title} đã được thêm vào giỏ hàng!`);
    }
  };

  if (loading) return <div className="text-center py-6">Đang tải...</div>;

  if (error || !listing) {
    return (
      <div className="text-center text-red-600 py-6">
        {error || 'Không tìm thấy sách'}
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6 mb-8">
        <div className="w-1/3">
          <img
            src={listing.imageUrl || 'https://via.placeholder.com/150'}
            alt={listing.title}
            className="w-full h-72 object-cover rounded-lg"
          />
        </div>
        <div className="w-2/3">
          <h2 className="text-3xl font-semibold text-blue-800">{listing.title}</h2>
          <p className="text-xl text-gray-600">Tác giả: {listing.author || 'Không rõ tác giả'}</p>
          <p className="text-sm text-gray-600 mt-2">Danh mục: {listing.categoryName}</p>
          <p className="text-sm text-gray-600 mt-2">Người bán: {listing.ownerName}</p>
          <p className="text-sm text-gray-600 mt-2">
            Loại: {listing.listingType === 0 ? 'Bán' : 'Trao đổi'}
          </p>
          {listing.listingType === 1 && listing.desiredDocumentIds && listing.desiredDocumentIds.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              ID sách mong muốn trao đổi: {listing.desiredDocumentIds.join(', ')}
            </p>
          )}
          {listing.acceptedPaymentMethods && listing.acceptedPaymentMethods.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Phương thức thanh toán: {listing.acceptedPaymentMethods.map(method => method.name).join(', ')}
            </p>
          )}
          <p className="mt-4 text-lg">{listing.description || 'Không có mô tả'}</p>
          <p className="mt-4 text-xl font-bold text-blue-600">
            {listing.price !== null ? `$${parseFloat(listing.price).toFixed(2)}` : 'Giá không có sẵn'}
          </p>
          <p className="text-sm text-gray-600 mt-2">Trạng thái: {listing.statusName}</p>
          {listing.statusName !== 'Active' && (
            <p className="text-sm text-red-600 mt-2">
              Sách này không thể mua hoặc thêm vào giỏ hàng vì chưa được phê duyệt.
            </p>
          )}
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={listing.statusName !== 'Active'}
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={listing.statusName !== 'Active' || hasOrdered}
            >
              {hasOrdered ? 'Đã đặt hàng' : 'Mua ngay'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal thông tin giao hàng */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={handleModalClose}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Đóng modal"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 id="modal-title" className="text-xl font-bold mb-4 text-blue-700">Thông tin giao hàng</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Sách:</strong> {listing.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Giá:</strong> ${parseFloat(listing.price).toFixed(2)}
              </p>
            </div>
            <div className="mb-4">
              <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-600">
                Địa chỉ giao hàng
              </label>
              <textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Nhập địa chỉ giao hàng..."
                maxLength={255}
                aria-required="true"
              />
              <p className="text-xs text-gray-500 mt-1">{shippingAddress.length}/255 ký tự</p>
            </div>
            <div className="mb-4">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-600">
                Phương thức thanh toán
              </label>
              {listing.acceptedPaymentMethods && listing.acceptedPaymentMethods.length > 0 ? (
                listing.acceptedPaymentMethods.length === 1 ? (
                  <input
                    id="paymentMethod"
                    type="text"
                    value={listing.acceptedPaymentMethods[0].name}
                    className="w-full p-2 border rounded-lg bg-gray-100"
                    disabled
                    aria-readonly="true"
                  />
                ) : (
                  <select
                    id="paymentMethod"
                    value={paymentMethodId || ''}
                    onChange={(e) => setPaymentMethodId(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-required="true"
                  >
                    <option value="" disabled>
                      Chọn phương thức
                    </option>
                    {listing.acceptedPaymentMethods.map((method) => (
                      <option key={method.paymentMethodId} value={method.paymentMethodId}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                )
              ) : (
                <p className="text-sm text-red-600">Không có phương thức thanh toán nào khả dụng.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                aria-label="Hủy"
              >
                Hủy
              </button>
              <button
                onClick={handleProceedToConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isSubmitting || !listing.acceptedPaymentMethods || listing.acceptedPaymentMethods.length === 0}
                aria-label="Tiếp tục"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận đơn hàng */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="confirm-modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={handleModalClose}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Đóng modal xác nhận"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 id="confirm-modal-title" className="text-xl font-bold mb-4 text-blue-700">Xác nhận đơn hàng</h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Sách:</strong> {listing.title}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Giá:</strong> ${parseFloat(listing.price).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Địa chỉ giao hàng:</strong> {shippingAddress}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Phương thức thanh toán:</strong>{' '}
              {listing.acceptedPaymentMethods.find((m) => m.paymentMethodId === paymentMethodId)?.name || 'Không rõ'}
            </p>
            <p className="text-sm text-gray-600 mb-4">Bạn có chắc chắn muốn tạo đơn hàng này?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                aria-label="Hủy"
              >
                Hủy
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isSubmitting}
                aria-label="Xác nhận đơn hàng"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailsPage;