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
  faStar,
  faChartLine // Add this for statistics icon
} from "@fortawesome/free-solid-svg-icons";
import bookLogo from "../src/assets/book-shop1.png";

const Navbar = () => {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isSellDropdown, setIsSellDropdown] = useState(false);
  const [isInventoryDropdown, setIsInventoryDropdown] = useState(false);
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
    setIsSellDropdown(!isSellDropdown);
  };

  const toggleInventoryDropdown = () => {
    closeAllDropdowns();
    setIsInventoryDropdown(!isInventoryDropdown);
  };

  const toggleOrdersDropdown = () => {
    closeAllDropdowns();
    setIsOrdersDropdownOpen(!isOrdersDropdownOpen);
  };

  const closeAllDropdowns = () => {
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
    setIsAccountDropdownOpen(false);
    setIsSellDropdown(false);
    setIsInventoryDropdown(false);
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={bookLogo}
              alt="Book Store Logo"
              className="h-10 w-10 object-contain"
            />
            <Link
              to="/"
              className={`text-3xl font-bold flex items-center ${
                activeLink === "/" ? "text-white" : "text-white hover:text-blue-200"
              } transition-colors`}
              onClick={() => handleLinkClick("/")}
              style={{ letterSpacing: "1px" }}
            >
              Book Store
            </Link>
          </div>

          {/* Search Bar */}
          {activeLink === "/" && (
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  className="w-full bg-gray-100 rounded-lg pl-4 pr-10 py-2 focus:outline-none text-gray-800"
                  disabled
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 p-1"
                  tabIndex={-1}
                  type="button"
                  disabled
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </div>
          )}

          {/* Menu */}
          <div className="flex items-center space-x-2">
            {!isAdmin() && (
              <>
                {/* Remove Home button */}
                <Link
                  to="/browse"
                  className={`flex items-center gap-2 font-semibold px-3 py-2 rounded-lg ${
                    activeLink === "/browse" ? "text-[#ECAC00] bg-white/10" : "text-white hover:text-blue-100"
                  } transition-colors`}
                  onClick={() => handleLinkClick("/browse")}
                >
                  <FontAwesomeIcon icon={faBook} className="text-lg" />
                  <span>Browse</span>
                </Link>
                {isLoggedIn && (
                  <>
                   
                    {/* Inventory Dropdown */}
                    <div className="relative">
                      <button
                        onClick={toggleInventoryDropdown}
                        className={`flex items-center gap-2 font-semibold px-3 py-2 rounded-lg ${
                          (activeLink === "/inventory" || activeLink === "/my-listings")
                            ? "text-[#ECAC00] bg-white/10"
                            : "text-white hover:text-blue-100"
                        } transition-colors`}
                      >
                        <FontAwesomeIcon icon={faWarehouse} className="text-lg" />
                        <span>Inventory</span>
                        <FontAwesomeIcon icon="caret-down" className="ml-1 text-xs" />
                      </button>
                      {isInventoryDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                          <Link
                            to="/inventory"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                            onClick={() => handleLinkClick("/inventory")}
                          >
                            <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
                            Inventory
                          </Link>
                          <Link
                            to="/my-listings"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                            onClick={() => handleLinkClick("/my-listings")}
                          >
                            <FontAwesomeIcon icon={faBook} className="mr-2" />
                            My Listing
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={toggleOrdersDropdown}
                        className={`flex items-center gap-2 font-semibold px-3 py-2 rounded-lg ${
                          activeLink === "/my-purchases" || activeLink === "/my-sales"
                            ? "text-[#ECAC00] bg-white/10"
                            : "text-white hover:text-blue-100"
                        } transition-colors`}
                      >
                        <FontAwesomeIcon icon={faShoppingBag} className="text-lg" />
                        <span>Orders</span>
                        <FontAwesomeIcon icon="caret-down" className="ml-1 text-xs" />
                      </button>
                      {isOrdersDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                          <Link
                            to="/my-purchases"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                            onClick={() => handleLinkClick("/my-purchases")}
                          >
                            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                            My Purchases
                          </Link>
                          <Link
                            to="/my-sales"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                            onClick={() => handleLinkClick("/my-sales")}
                          >
                            <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                            My Sales
                          </Link>
                        </div>
                      )}
                    </div>
                    {/* Notifications button outside account */}
                    <div className="relative flex items-center">
                      <button
                        onClick={toggleNotificationsDropdown}
                        className="relative flex items-center justify-center px-3 py-2 rounded-lg text-white hover:text-blue-100 transition-colors"
                        aria-label="Notifications"
                      >
                        <FontAwesomeIcon icon={faBell} className="text-lg" />
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-1">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      {isNotificationsOpen && (
                        <div className="absolute left-0 top-full mt-2 z-50">
                          <NotificationsDropdown onClose={closeAllDropdowns} />
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={toggleDropdown}
                        className="flex items-center gap-2 font-semibold px-3 py-2 rounded-lg text-white hover:text-blue-100 transition-colors"
                        aria-label="User Menu"
                      >
                        <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center text-sm font-semibold">
                          {user.email[0].toUpperCase()}
                        </div>
                        <FontAwesomeIcon icon="caret-down" className="ml-1 text-xs" />
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                          {/* Remove Notifications from dropdown */}
                          <Link
                            to="/profile"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                            onClick={() => handleLinkClick("/profile")}
                          >
                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                            Profile
                          </Link>
                          
                          {/* Only show these links for non-admin users */}
                          {!isAdmin() && (
                            <>
                              <Link
                                to="/statistics"
                                className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                                onClick={() => handleLinkClick("/statistics")}
                              >
                                <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                                My Statistics
                              </Link>
                              
                              <Link
                                to="/reviews"
                                className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                                onClick={() => handleLinkClick("/reviews")}
                              >
                                <FontAwesomeIcon icon={faStar} className="mr-2" />
                                My Reviews
                              </Link>
                            </>
                          )}

                          <button
                            onClick={() => {
                              setIsPasswordModalOpen(true);
                              closeAllDropdowns();
                            }}
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                          >
                            <FontAwesomeIcon icon={faKey} className="mr-2" />
                            Change Password
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                          >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {!isLoggedIn && (
                  <div className="relative">
                    <button
                      onClick={toggleAccountDropdown}
                      className={`flex items-center gap-2 font-semibold px-3 py-2 rounded-lg ${
                        activeLink === "/login" || activeLink === "/signup"
                          ? "text-[#ECAC00] bg-white/10"
                          : "text-white hover:text-blue-100"
                      } transition-colors`}
                    >
                      <FontAwesomeIcon icon={faUser} className="text-lg" />
                      <span>Account</span>
                      <FontAwesomeIcon icon="caret-down" className="ml-1 text-xs" />
                    </button>
                    {isAccountDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                        <Link
                          to="/login"
                          className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                          onClick={() => handleLinkClick("/login")}
                        >
                          <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
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
                  className={`flex items-center gap-2 font-semibold px-3 py-2 rounded-lg ${
                    activeLink === "/admin" ? "text-[#ECAC00] bg-white/10" : "text-white hover:text-blue-100"
                  } transition-colors`}
                  onClick={() => handleLinkClick("/admin")}
                >
                  <FontAwesomeIcon icon={faTachometerAlt} className="text-lg" />
                  <span>Dashboard</span>
                </Link>
                {/* Notifications for admin */}
                <div className="relative flex items-center">
                  <button
                    onClick={toggleNotificationsDropdown}
                    className="relative flex items-center justify-center px-3 py-2 rounded-lg text-white hover:text-blue-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <FontAwesomeIcon icon={faBell} className="text-lg" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-1">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <div className="absolute left-0 top-full mt-2 z-50">
                      <NotificationsDropdown onClose={closeAllDropdowns} />
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 font-semibold px-3 py-2 rounded-lg text-white hover:text-blue-100 transition-colors"
                    aria-label="User Menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center text-sm font-semibold">
                      {user.email[0].toUpperCase()}
                    </div>
                    <FontAwesomeIcon icon="caret-down" className="ml-1 text-xs" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 transition-all duration-200 p-2">
                      {/* Remove Notifications from dropdown */}
                      <Link
                        to="/profile"
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                        onClick={() => handleLinkClick("/profile")}
                      >
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        Profile
                      </Link>
                      
                      {/* Only show these links for non-admin users */}
                      {!isAdmin() && (
                        <>
                          <Link
                            to="/statistics"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                            onClick={() => handleLinkClick("/statistics")}
                          >
                            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                            My Statistics
                          </Link>
                          
                          <Link
                            to="/reviews"
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                            onClick={() => handleLinkClick("/reviews")}
                          >
                            <FontAwesomeIcon icon={faStar} className="mr-2" />
                            My Reviews
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setIsPasswordModalOpen(true);
                          closeAllDropdowns();
                        }}
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                      >
                        <FontAwesomeIcon icon={faKey} className="mr-2" />
                        Change Password
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-blue-100 flex items-center gap-2 rounded"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Logout
                      </button>
                    </div>
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