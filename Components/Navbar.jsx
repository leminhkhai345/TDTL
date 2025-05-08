// src/Components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBookOpen,
  faExchangeAlt,
  faDollarSign,
  faSignInAlt,
  faUser,
  faShoppingCart,
  faHistory,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import logo from '../src/assets/book-shop1.png';
import { useAuth } from '../src/contexts/AuthContext';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  console.log('Navbar user:', user); // Debug

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="relative">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="text-2xl font-bold text-blue-700">BookStore</span>
          </Link>
        </div>

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
          {isLoggedIn && (
            <>
              <Link to="/cart" className="hover:text-blue-600 flex items-center space-x-1">
                <FontAwesomeIcon icon={faShoppingCart} />
                <span>Cart</span>
              </Link>
              <Link to="/exchange-history" className="hover:text-blue-600 flex items-center space-x-1">
                <FontAwesomeIcon icon={faHistory} />
                <span>Exchange History</span>
              </Link>
              <Link to="/sell-history" className="hover:text-blue-600 flex items-center space-x-1">
                <FontAwesomeIcon icon={faHistory} />
                <span>Sell History</span>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-600 flex items-center space-x-1">
                  <FontAwesomeIcon icon={faUserShield} />
                  <span>Admin</span>
                </Link>
              )}
              <div className="relative">
                <button className="flex items-center space-x-2" onClick={toggleDropdown}>
                  <img
                    src={user?.avatar || 'https://via.placeholder.com/40'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border"
                  />
                </button>
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-md w-48 z-50"
                  >
                    <div className="p-2">
                      <Link to="/profile" className="block text-gray-700 hover:text-blue-600 py-2">
                        Profile
                      </Link>
                      <Link to="/settings" className="block text-gray-700 hover:text-blue-600 py-2">
                        Settings
                      </Link>
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
            </>
          )}
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