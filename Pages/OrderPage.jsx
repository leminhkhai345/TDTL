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
    if (!listingResponse) {
      throw new Error('Sách không tồn tại hoặc chưa được phê duyệt.');
    }
    setListingData(listingResponse);

    // Lấy tất cả payment methods available
    const paymentMethods = await getPublicPaymentMethods();
    
    // Nếu listing không có acceptedPaymentMethods hoặc mảng rỗng 
    // => hiển thị tất cả payment methods
    if (!listingResponse.acceptedPaymentMethods || listingResponse.acceptedPaymentMethods.length === 0) {
      setAvailablePaymentMethods(paymentMethods);
      return;
    }

    // Nếu có chỉ định payment methods thì filter theo đó
    const validMethods = paymentMethods.filter(method =>
      listingResponse.acceptedPaymentMethods.some(
        listingMethod => listingMethod.paymentMethodId === method.paymentMethodId
      )
    );
    setAvailablePaymentMethods(validMethods);

    // Auto select nếu chỉ có 1 phương thức
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
      toast.success(`Order #${response.orderId} has been created successfully!`);
      setIsConfirmModalOpen(false);
      navigate(`/orders/${response.orderId}`); // Luôn chuyển về trang chi tiết đơn hàng
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
      {/* Shipping Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[3px] bg-white/30" role="dialog" aria-labelledby="modal-title">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative animate-fade-in">
            <button
              onClick={handleModalClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-blue-700 transition-colors text-xl"
              aria-label="Close modal"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 id="modal-title" className="text-2xl font-bold mb-6 text-blue-700 text-center tracking-tight">
              Shipping Information
            </h2>
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1">
                  <p className="text-base text-gray-700 font-semibold truncate">
                    <span className="text-gray-500 font-normal">Book:</span>{" "}
                    <span className="text-blue-700 font-bold">{listingData.title}</span>
                  </p>
                  <p className="text-base text-gray-700 font-semibold">
                    <span className="text-gray-500 font-normal">Price:</span>{" "}
                    <span className="text-green-600 font-bold">${parseFloat(listingData.price).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-5">
              <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-600 mb-1">
                Shipping Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                rows="4"
                placeholder="Enter your shipping address..."
                maxLength={255}
                aria-required="true"
              />
              <p className="text-xs text-gray-400 mt-1">{shippingAddress.length}/255 characters</p>
            </div>
            <div className="mb-8">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-600 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              {availablePaymentMethods.length > 0 ? (
                <select
                  id="paymentMethod"
                  value={paymentMethodId || ''}
                  onChange={(e) => setPaymentMethodId(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  aria-required="true"
                >
                  <option value="" disabled>
                    Select payment method
                  </option>
                  {availablePaymentMethods.map((method) => (
                    <option key={method.paymentMethodId} value={method.paymentMethodId}>
                      {method.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-red-600">No payment methods available.</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleModalClose}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToConfirm}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting || availablePaymentMethods.length === 0}
                aria-label="Continue"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirm Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[3px] bg-white/30" role="dialog" aria-labelledby="confirm-modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative animate-fade-in">
            <button
              onClick={handleModalClose}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Close confirm modal"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 id="confirm-modal-title" className="text-xl font-bold mb-4 text-blue-700">Order Confirmation</h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Book:</strong>{" "}
              <span className="text-blue-700 font-bold">{listingData.title}</span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Price:</strong>{" "}
              <span className="text-green-600 font-bold">${parseFloat(listingData.price).toFixed(2)}</span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Shipping Address:</strong> {shippingAddress}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Payment Method:</strong>{" "}
              {availablePaymentMethods.find((m) => m.paymentMethodId === paymentMethodId)?.name || 'Unknown'}
            </p>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to place this order?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={isSubmitting}
                aria-label="Confirm order"
              >
                {isSubmitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeInDropdown 0.18s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeInDropdown {
          0% { opacity: 0; transform: translateY(-10px) scale(0.98);}
          100% { opacity: 1; transform: translateY(0) scale(1);}
        }
      `}</style>
    </>
  );
};

export default OrderPage;