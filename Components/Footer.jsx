// src/components/Footer.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import logo from "../src/assets/book-shop.png";

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo + Mô tả */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold">BookStore</span>
          </div>
          <p className="text-sm">
            Nền tảng trao đổi, mua bán sách cũ, giúp bạn tiết kiệm chi phí và bảo vệ môi trường.
          </p>
        </div>

        {/* Liên kết nhanh */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Liên kết nhanh</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-yellow-300">Trang chủ</a></li>
            <li><a href="/browse" className="hover:text-yellow-300">Tìm sách</a></li>
            <li><a href="/exchange" className="hover:text-yellow-300">Trao đổi</a></li>
            <li><a href="/sell" className="hover:text-yellow-300">Bán sách</a></li>
          </ul>
        </div>

        {/* Thông tin liên hệ */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Liên hệ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              Hà Nội, Việt Nam
            </li>
            <li>
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              0123 456 789
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              support@bookstore.vn
            </li>
          </ul>
        </div>

        {/* Mạng xã hội */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Kết nối với chúng tôi</h3>
          <div className="flex space-x-4 text-xl">
            <a href="#" className="hover:text-yellow-300"><FontAwesomeIcon icon={faFacebook} /></a>
            <a href="#" className="hover:text-yellow-300"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="#" className="hover:text-yellow-300"><FontAwesomeIcon icon={faTwitter} /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center text-sm text-gray-300">
        &copy; {new Date().getFullYear()} BookStore. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
