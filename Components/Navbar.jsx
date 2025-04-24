import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../src/assets/book-shop1.png"; // Đường dẫn tới logo
import {
  faHome,
  faBookOpen,
  faExchangeAlt,
  faDollarSign,
  faSignInAlt,
  faUser, // Biểu tượng người dùng
  faShoppingCart, // Thêm biểu tượng giỏ hàng
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../src/contexts/AuthContext"; // Import context

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth(); // Lấy thông tin đăng nhập từ context
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State để theo dõi trạng thái dropdown
  const dropdownRef = useRef(null); // Ref để tham chiếu đến dropdown menu

  // Hàm để toggle trạng thái của dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Hàm để đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo + Brand name */}
        <div className="relative">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold text-blue-700">BookStore</span>
          </Link>
        </div>

        {/* Navigation Links with Icons */}
        <div className="space-x-6 text-sm font-medium text-gray-700 flex items-center">
          <Link to="/" className="hover:text-blue-600 flex items-center space-x-1">
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </Link>
          <Link to="/browse" className="hover:text-blue-600 flex items-center space-x-1">
            <FontAwesomeIcon icon={faBookOpen} />
            <span>Browse Books</span>
          </Link>
          <Link to="/exchange" className="hover:text-blue-600 flex items-center space-x-1">
            <FontAwesomeIcon icon={faExchangeAlt} />
            <span>Exchange</span>
          </Link>
          <Link to="/sell" className="hover:text-blue-600 flex items-center space-x-1">
            <FontAwesomeIcon icon={faDollarSign} />
            <span>Sell</span>
          </Link>

          {/* Hiển thị giỏ hàng khi đăng nhập */}
          {isLoggedIn && (
            <Link
              to="/cart"
              className="hover:text-blue-600 flex items-center space-x-1"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              <span>Cart</span>
            </Link>
          )}

          {/* Hiển thị avatar hoặc icon người dùng khi đã đăng nhập */}
          {isLoggedIn && (
            <div className="relative">
              <button
                className="flex items-center space-x-2"
                onClick={toggleDropdown} // Thêm sự kiện click để mở/đóng dropdown
              >
                {/* Hiển thị avatar của người dùng hoặc icon người dùng */}
                <img
                  src={user?.avatar || "https://via.placeholder.com/40"} // Nếu không có avatar, dùng hình placeholder
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border"
                />
              </button>

              {/* Dropdown khi click vào avatar */}
              {isDropdownOpen && (
                <div
                  ref={dropdownRef} // Thêm ref cho dropdown menu
                  className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-md w-48 z-50"
                >
                  <div className="p-2">
                    <Link to="/profile" className="block text-gray-700 hover:text-blue-600 py-2">Profile</Link>
                    <Link to="/settings" className="block text-gray-700 hover:text-blue-600 py-2">Settings</Link>
                    <button
                      onClick={logout}
                      className="w-full text-left text-gray-700 hover:text-blue-600 py-2"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hiển thị nút login nếu chưa đăng nhập */}
          {!isLoggedIn && (
            <Link to="/login" className="hover:text-blue-600 flex items-center space-x-1">
              <FontAwesomeIcon icon={faSignInAlt} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
