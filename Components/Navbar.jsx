import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../src/contexts/AuthContext";
import { useNotifications } from "../src/contexts/NotificationContext";
import ChangePasswordModal from "../Pages/ChangePasswordModal";
import NotificationsDropdown from "../Components/NotificationsDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBook,
  faUser,
  faSignOutAlt,
  faTachometerAlt,
  faWarehouse,
  faShoppingBag,
  faKey,
  faBell,
  faSearch,
  faShoppingCart,
  faMoneyBillWave,
  faSignInAlt,
  faUserPlus,
  faStar
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isSellDropdownOpen, setIsSellDropdownOpen] = useState(false);
  const [isInventoryDropdownOpen, setIsInventoryDropdownOpen] = useState(false);
  const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/");

  const handleLogout = () => {
    logout();
    navigate("/login");
    setActiveLink("/login");
    closeAllDropdowns();
  };

  const toggleDropdown = () => {
    closeAllDropdowns();
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotificationsDropdown = () => {
    closeAllDropdowns();
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsDropdownOpen(false);
  };

  const toggleAccountDropdown = () => {
    closeAllDropdowns();
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const toggleSellDropdown = () => {
    closeAllDropdowns();
    setIsSellDropdownOpen(!isSellDropdownOpen);
  };

  const toggleInventoryDropdown = () => {
    closeAllDropdowns();
    setIsInventoryDropdownOpen(!isInventoryDropdownOpen);
  };

  const toggleOrdersDropdown = () => {
    closeAllDropdowns();
    setIsOrdersDropdownOpen(!isOrdersDropdownOpen);
  };

  const closeAllDropdowns = () => {
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
    setIsAccountDropdownOpen(false);
    setIsSellDropdownOpen(false);
    setIsInventoryDropdownOpen(false);
    setIsOrdersDropdownOpen(false);
  };

  const handleLinkClick = (path) => {
    setActiveLink(path);
    closeAllDropdowns();
    navigate(path);
  };

  return (
    <nav className="bg-[#1946CE] shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 space-x-8">
          {/* Logo */}
          <div>
            <Link
              to="/"
              className={`text-3xl font-bold ${
                activeLink === "/" ? "text-white" : "text-white hover:text-blue-200"
              } transition-colors`}
              onClick={() => handleLinkClick("/")}
            >
              BookStore
            </Link>
          </div>

          {/* Search Bar */}
          {activeLink === "/" && (
            <div className="flex max-w-md w-full">
              <input
                type="text"
                placeholder="Search books by title or author..."
                className="bg-gray-100 rounded-l-lg px-4 py-2 w-full focus:outline-none text-gray-800"
                disabled
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          )}

          {/* Menu */}
          <div className="flex items-center space-x-6">
            {!isAdmin() && (
              <>
                <Link
                  to="/"
                  className={`flex items-center space-x-1 font-semibold px-3 ${
                    activeLink === "/" ? "text-[#ECAC00]" : "text-white hover:text-blue-100"
                  } transition-colors`}
                  onClick={() => handleLinkClick("/")}
                >
                  <FontAwesomeIcon icon={faHome} />
                  <span>Home</span>
                </Link>
                <Link
                  to="/browse"
                  className={`flex items-center space-x-1 font-semibold px-3 ${
                    activeLink === "/browse" ? "text-[#ECAC00]" : "text-white hover:text-blue-100"
                  } transition-colors`}
                  onClick={() => handleLinkClick("/browse")}
                >
                  <FontAwesomeIcon icon={faBook} />
                  <span>Browse</span>
                </Link>
                {isLoggedIn && (
                  <>
                    <div className="relative">
                      <button
                        onClick={toggleSellDropdown}
                        className={`flex items-center space-x-1 font-semibold px-3 ${
                          activeLink === "/sell" ? "text-[#ECAC00]" : "text-white hover:text-blue-100"
                        } transition-colors`}
                      >
                        <FontAwesomeIcon icon={faBook} />
                        <span>Sell</span>
                      </button>
                      {isSellDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                          <Link
                            to="/sell"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                            onClick={() => handleLinkClick("/sell")}
                          >
                            <FontAwesomeIcon icon={faBook} className="mr-2" />
                            Sell a Book
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={toggleInventoryDropdown}
                        className={`flex items-center space-x-1 font-semibold px-3 ${
                          activeLink === "/inventory" ? "text-[#ECAC00]" : "text-white hover:text-blue-100"
                        } transition-colors`}
                      >
                        <FontAwesomeIcon icon={faWarehouse} />
                        <span>Inventory</span>
                      </button>
                      {isInventoryDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                          <Link
                            to="/inventory"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                            onClick={() => handleLinkClick("/inventory")}
                          >
                            <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                            View Inventory
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={toggleOrdersDropdown}
                        className={`flex items-center space-x-1 font-semibold px-3 ${
                          activeLink === "/my-purchases" || activeLink === "/my-sales"
                            ? "text-[#ECAC00]"
                            : "text-white hover:text-blue-100"
                        } transition-colors`}
                      >
                        <FontAwesomeIcon icon={faShoppingBag} />
                        <span>Orders</span>
                      </button>
                      {isOrdersDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                          <Link
                            to="/my-purchases"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                            onClick={() => handleLinkClick("/my-purchases")}
                          >
                            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                            My Purchases
                          </Link>
                          <Link
                            to="/my-sales"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                            onClick={() => handleLinkClick("/my-sales")}
                          >
                            <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                            My Sales
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={toggleDropdown}
                        className="flex items-center space-x-1 font-semibold px-3 text-white hover:text-blue-100 transition-colors"
                        aria-label="User Menu"
                      >
                        <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center text-sm font-semibold">
                          {user.email[0].toUpperCase()}
                        </div>
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-1">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                          <button
                            onClick={toggleNotificationsDropdown}
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                          >
                            <FontAwesomeIcon icon={faBell} className="mr-2" />
                            Notifications
                            {unreadCount > 0 && (
                              <span className="ml-2 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-1">
                                {unreadCount}
                              </span>
                            )}
                          </button>
                          <Link
                            to="/profile"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                            onClick={() => handleLinkClick("/profile")}
                          >
                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                            Profile
                          </Link>
                          <Link
                            to="/reviews"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                            onClick={() => handleLinkClick("/reviews")}
                          >
                            <FontAwesomeIcon icon={faStar} className="mr-2" />
                            My Reviews
                          </Link>
                          <button
                            onClick={() => {
                              setIsPasswordModalOpen(true);
                              closeAllDropdowns();
                            }}
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                          >
                            <FontAwesomeIcon icon={faKey} className="mr-2" />
                            Change Password
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-blue-100 flex items-center"
                          >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            Logout
                          </button>
                        </div>
                      )}
                      {isNotificationsOpen && (
                        <NotificationsDropdown onClose={() => closeAllDropdowns()} />
                      )}
                    </div>
                  </>
                )}
                {!isLoggedIn && (
                  <div className="relative">
                    <button
                      onClick={toggleAccountDropdown}
                      className={`flex items-center space-x-1 font-semibold px-3 ${
                        activeLink === "/login" || activeLink === "/signup"
                          ? "text-[#ECAC00]"
                          : "text-white hover:text-blue-100"
                      } transition-colors`}
                    >
                      <FontAwesomeIcon icon={faUser} />
                      <span>Account</span>
                    </button>
                    {isAccountDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                        <Link
                          to="/login"
                          className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                          onClick={() => handleLinkClick("/login")}
                        >
                          <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                          onClick={() => handleLinkClick("/signup")}
                        >
                          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {isLoggedIn && isAdmin() && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 font-semibold px-3 ${
                    activeLink === "/admin" ? "text-[#ECAC00]" : "text-white hover:text-blue-100"
                  } transition-colors`}
                  onClick={() => handleLinkClick("/admin")}
                >
                  <FontAwesomeIcon icon={faTachometerAlt} />
                  <span>Dashboard</span>
                </Link>
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-1 font-semibold px-3 text-white hover:text-blue-100 transition-colors"
                    aria-label="User Menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center text-sm font-semibold">
                      {user.email[0].toUpperCase()}
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-1">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                      <button
                        onClick={toggleNotificationsDropdown}
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                      >
                        <FontAwesomeIcon icon={faBell} className="mr-2" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-1">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      <Link
                        to="/profile"
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                        onClick={() => handleLinkClick("/profile")}
                      >
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/reviews"
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                        onClick={() => handleLinkClick("/reviews")}
                      >
                        <FontAwesomeIcon icon={faStar} className="mr-2" />
                        My Reviews
                      </Link>
                      <button
                        onClick={() => {
                          setIsPasswordModalOpen(true);
                          closeAllDropdowns();
                        }}
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center"
                      >
                        <FontAwesomeIcon icon={faKey} className="mr-2" />
                        Change Password
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-blue-100 flex items-center"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Logout
                      </button>
                    </div>
                  )}
                  {isNotificationsOpen && (
                    <NotificationsDropdown onClose={() => closeAllDropdowns()} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;