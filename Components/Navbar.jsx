// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../src/assets/book-shop1.png"; // Đường dẫn đến logo của bạn
import {
  faHome,
  faBookOpen,
  faExchangeAlt,
  faDollarSign,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  return (
    <nav className="bg-white shadow">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      {/* Logo + Brand name */}
      <Link to="/" className="flex items-center space-x-2">
        <img src={logo} alt="Logo" className="w-8 h-8" />
        <span className="text-2xl font-bold text-blue-700">
          BookStore
        </span>
      </Link>

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
          <Link to="/login" className="hover:text-blue-600 flex items-center space-x-1">
            <FontAwesomeIcon icon={faSignInAlt} />
            <span>Login</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
