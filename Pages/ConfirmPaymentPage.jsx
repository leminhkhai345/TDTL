import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../src/contexts/NotificationContext';
import { toast } from 'react-toastify';
import { confirmPayment, createNotificationByTemplate, getUserOrderById } from '../src/API/api';

const ConfirmPaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchNotifications, fetchUnreadCount } = useNotifications();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const rowVersion = location.state?.rowVersion || '';

  // Kiểm tra trạng thái đơn hàng khi component mount
  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        setLoading(true);
        const order = await getUserOrderById(orderId);
        if (!order) {
          throw new Error('Đơn hàng không tồn tại.');
        }
        setOrderStatus(order.orderStatus);
        const normalizeStatus = (status) => status?.trim().replace(/\s+/g, '');
        if (normalizeStatus(order.orderStatus) !== 'AwaitingOfflinePayment') {
          toast.error('Đơn hàng không ở trạng thái chờ thanh toán offline. Vui lòng kiểm tra lại.');
          navigate(`/orders/${orderId}`);
        }
      } catch (error) {
        toast.error(error.message || 'Không thể tải thông tin đơn hàng.');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderStatus();
  }, [orderId, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      toast.error('Vui lòng chọn file JPEG hoặc PNG.');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Vui lòng chọn file bằng chứng thanh toán.');
      return;
    }

    setLoading(true);
    try {
      // Lấy rowVersion mới nhất từ API
      const order = await getUserOrderById(orderId);
      const latestRowVersion = order.rowVersion;
      if (!latestRowVersion) {
        toast.error('Không tìm thấy thông tin phiên bản đơn hàng.');
        setLoading(false);
        return;
      }

      const proofData = {
        file,
        rowVersion: latestRowVersion, // Gửi đúng base64 string từ API
      };
      const response = await confirmPayment(orderId, proofData);
      console.log('Confirm payment response:', response);
      // await createNotificationByTemplate('PaymentConfirmed', parseInt(orderId)); // Tạm thời bỏ qua nếu backend chưa có API này
      toast.success('Bằng chứng thanh toán đã được gửi thành công!');
      // fetchNotifications();
      // fetchUnreadCount();
      navigate(`/orders/${orderId}`);
    } catch (error) {
      toast.error(error.message || 'Không thể gửi bằng chứng thanh toán. Vui lòng thử lại.');
      if (error.message.includes('Unauthorized')) {
        navigate('/login');
      }
      console.error('Error confirming payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !orderStatus) {
    return <div className="text-center py-6">Đang tải...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Confirm payment for the order #{orderId}</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Proof of payment (JPEG/PNG)</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Sending...' : 'Submit proof'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmPaymentPage;