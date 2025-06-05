import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Trang không tìm thấy</h2>
        <p className="text-gray-600 mb-6">Xin lỗi, trang bạn đang tìm không tồn tại.</p>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;