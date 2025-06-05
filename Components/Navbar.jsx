import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { useNotifications } from '../src/contexts/NotificationContext';
import ChangePasswordModal from '../Pages/ChangePasswordModal';
import NotificationsDropdown from '../Components/NotificationsDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBook,
  // faExchangeAlt,
  // faShoppingCart,
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faTachometerAlt,
  faWarehouse,
  faShoppingBag,
  faBars,
  faTimes,
  faKey,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSellDropdownOpen, setIsSellDropdownOpen] = useState(false);
  const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationsOpen(false);
  };

  const toggleSellDropdown = () => {
    setIsSellDropdownOpen(!isSellDropdownOpen);
  };

  const toggleOrdersDropdown = () => {
    setIsOrdersDropdownOpen(!isOrdersDropdownOpen);
  };

  const toggleNotificationsDropdown = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-wide hover:text-blue-200 transition-colors">
              BookStore
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
              <FontAwesomeIcon icon={faHome} />
              <span>Home</span>
            </Link>

            {isLoggedIn && isAdmin() ? (
              <>
                <Link to="/admin" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                  <FontAwesomeIcon icon={faTachometerAlt} />
                  <span>Dashboard</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/browse" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                  <FontAwesomeIcon icon={faBook} />
                  <span>Browse</span>
                </Link>
                {isLoggedIn && (
                  <>
                    {/* <Link to="/exchange" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                      <FontAwesomeIcon icon={faExchangeAlt} />
                      <span>Exchange</span>
                    </Link> */}
                    <div className="relative">
                      <button
                        onClick={toggleSellDropdown}
                        className="flex items-center space-x-2 focus:outline-none"
                      >
                        <FontAwesomeIcon icon={faBook} />
                        <span>Sell</span>
                      </button>
                      {isSellDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50">
                          <Link
                            to="/sell"
                            className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-100 rounded-t-lg"
                            onClick={() => setIsSellDropdownOpen(false)}
                          >
                            <FontAwesomeIcon icon={faBook} />
                            <span>Sell a Book</span>
                          </Link>
                          <Link
                            to="/sell-history"
                            className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-100 rounded-b-lg"
                            onClick={() => setIsSellDropdownOpen(false)}
                          >
                            {/* <FontAwesomeIcon icon={faBook} />
                            <span>Sell History</span> */}
                          </Link>
                        </div>
                      )}
                    </div>
                    <Link to="/inventory" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                      <FontAwesomeIcon icon={faWarehouse} />
                      <span>Inventory</span>
                    </Link>
                    {/* <Link to="/cart" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                      <FontAwesomeIcon icon={faShoppingCart} />
                      <span>Cart</span>
                    </Link> */}
                    <div className="relative">
                      <button
                        onClick={toggleOrdersDropdown}
                        className="flex items-center space-x-2 focus:outline-none"
                      >
                        <FontAwesomeIcon icon={faShoppingBag} />
                        <span>Orders</span>
                      </button>
                      {isOrdersDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50">
                          <Link
                            to="/my-purchases"
                            className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-100 rounded-t-lg"
                            onClick={() => setIsOrdersDropdownOpen(false)}
                          >
                            <FontAwesomeIcon icon={faShoppingBag} />
                            <span>My Purchases</span>
                          </Link>
                          <Link
                            to="/my-sales"
                            className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-100 rounded-b-lg"
                            onClick={() => setIsOrdersDropdownOpen(false)}
                          >
                            <FontAwesomeIcon icon={faShoppingBag} />
                            <span>My Sales</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-lg font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50">
                    <button
                      onClick={toggleNotificationsDropdown}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-100 rounded-t-lg w-full text-left"
                    >
                      <FontAwesomeIcon icon={faBell} />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FontAwesomeIcon icon={faUser} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsPasswordModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-100 w-full text-left"
                    >
                      <FontAwesomeIcon icon={faKey} />
                      <span>Change Password</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-100 rounded-b-lg w-full text-left"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
                {isNotificationsOpen && (
                  <NotificationsDropdown onClose={() => setIsNotificationsOpen(false)} />
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                  <FontAwesomeIcon icon={faSignInAlt} />
                  <span>Login</span>
                </Link>
                <Link to="/signup" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                  <FontAwesomeIcon icon={faSignInAlt} />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} size="lg" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-blue-700 rounded-b-lg shadow-lg">
            <div className="flex flex-col space-y-2 py-4 px-4">
              <Link to="/" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
              </Link>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    toggleNotificationsDropdown();
                    toggleMenu();
                  }}
                  className="flex items-center space-x-2 hover:text-blue-200 transition-colors text-left"
                >
                  <FontAwesomeIcon icon={faBell} />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {isLoggedIn && isAdmin() ? (
                <>
                  <Link to="/admin" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faTachometerAlt} />
                    <span>Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/browse" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faBook} />
                    <span>Browse</span>
                  </Link>
                  {isLoggedIn && (
                    <>
                      {/* <Link to="/exchange" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faExchangeAlt} />
                        <span>Exchange</span>
                      </Link> */}
                      <Link to="/sell" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBook} />
                        <span>Sell a Book</span>
                      </Link>
                      {/* <Link to="/sell-history" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBook} />
                        <span>Sell History</span>
                      </Link> */}
                      <Link to="/inventory" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faWarehouse} />
                        <span>Inventory</span>
                      </Link>
                      {/* <Link to="/cart" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faShoppingCart} />
                        <span>Cart</span>
                      </Link> */}
                      <Link to="/my-purchases" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faShoppingBag} />
                        <span>My Purchases</span>
                      </Link>
                      <Link to="/my-sales" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faShoppingBag} />
                        <span>My Sales</span>
                      </Link>
                    </>
                  )}
                </>
              )}

              {isLoggedIn && (
                <>
                  <Link to="/profile" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsPasswordModalOpen(true);
                      toggleMenu();
                    }}
                    className="flex items-center space-x-2 hover:text-blue-200 transition-colors text-left"
                  >
                    <FontAwesomeIcon icon={faKey} />
                    <span>Change Password</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="flex items-center space-x-2 hover:text-blue-200 transition-colors text-left"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Logout</span>
                  </button>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <Link to="/login" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span>Login</span>
                  </Link>
                  <Link to="/signup" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;