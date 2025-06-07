import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../src/contexts/CartContext';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { createOrder, getListingById, getPublicPaymentMethods } from '../src/API/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listing } = location.state || {};
  const { addToCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }

    if (!listing || !listing.listingId) {
      setError('Không tìm thấy thông tin sách');
      setLoading(false);
      return;
    }

   const fetchData = async () => {
  try {
    setLoading(true);
    const listingResponse = await getListingById(listing.listingId);
    console.log('Listing Response:', listingResponse);
    if (!listingResponse) {
      throw new Error('Sách không tồn tại hoặc chưa được phê duyệt.');
    }
    setListingData(listingResponse);

    const paymentMethods = await getPublicPaymentMethods();
    console.log('Public Payment Methods:', paymentMethods);
    const validMethods = paymentMethods.filter(method =>
      listingResponse.acceptedPaymentMethods?.some(
        listingMethod => listingMethod.paymentMethodId === method.paymentMethodId
      )
    );
    console.log('Valid Payment Methods:', validMethods);
    setAvailablePaymentMethods(validMethods);

    if (validMethods.length === 1) {
      setPaymentMethodId(validMethods[0].paymentMethodId);
    }
  } catch (err) {
    console.error('Fetch data error:', err);
    setError(err.message || 'Không thể tải dữ liệu');
    toast.error(err.message || 'Không thể tải dữ liệu');
  } finally {
    setLoading(false);
  }
};

    fetchData();
  }, [listing, isLoggedIn, navigate]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsConfirmModalOpen(false);
    setShippingAddress('');
    setPaymentMethodId(null);
    navigate(-1);
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
    const selectedPaymentMethod = availablePaymentMethods.find(
      (method) => method.paymentMethodId === paymentMethodId
    );
    const orderData = {
      listingId: listingData.listingId,
      shippingAddress,
      paymentMethodId,
      notes: '',
      paymentMethodName: selectedPaymentMethod?.name || '',
    };

    try {
      const response = await createOrder(orderData);
      toast.success(`Đơn hàng #${response.orderId} đã được tạo thành công!`);
      setIsConfirmModalOpen(false);
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

  if (loading) return <div className="text-center py-6">Đang tải...</div>;

  if (error || !listingData) {
    return (
      <div className="text-center text-red-600 py-6">
        {error || 'Không tìm thấy thông tin sách'}
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
    <>
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
                <strong>Sách:</strong> {listingData.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Giá:</strong> ${parseFloat(listingData.price).toFixed(2)}
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
              {availablePaymentMethods.length > 0 ? (
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
                  {availablePaymentMethods.map((method) => (
                    <option key={method.paymentMethodId} value={method.paymentMethodId}>
                      {method.name}
                    </option>
                  ))}
                </select>
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
                disabled={isSubmitting || availablePaymentMethods.length === 0}
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
              <strong>Sách:</strong> {listingData.title}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Giá:</strong> ${parseFloat(listingData.price).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Địa chỉ giao hàng:</strong> {shippingAddress}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Phương thức thanh toán:</strong>{' '}
              {availablePaymentMethods.find((m) => m.paymentMethodId === paymentMethodId)?.name || 'Không rõ'}
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
    </>
  );
};

export default OrderPage;