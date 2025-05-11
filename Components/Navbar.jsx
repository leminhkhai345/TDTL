import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBook,
  faExchangeAlt,
  faShoppingCart,
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faUserShield,
  faBars,
  faTimes,
  faKey,
  faTachometerAlt, // Icon cho Dashboard
} from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`https://your-mockapi-id.mockapi.io/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      alert('Password changed successfully!');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'An error occurred while changing password.');
    }
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
                {/* Chỉ hiển thị Dashboard khi là Admin */}
                <Link to="/admin" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                  <FontAwesomeIcon icon={faTachometerAlt} />
                  <span>Dashboard</span>
                </Link>
              </>
            ) : (
              <>
                {/* Hiển thị các liên kết khác khi không phải Admin */}
                <Link to="/browse" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                  <FontAwesomeIcon icon={faBook} />
                  <span>Browse</span>
                </Link>
                {isLoggedIn && (
                  <>
                    <Link to="/exchange" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                      <FontAwesomeIcon icon={faExchangeAlt} />
                      <span>Exchange</span>
                    </Link>
                    <Link to="/sell" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                      <FontAwesomeIcon icon={faBook} />
                      <span>Sell</span>
                    </Link>
                    <Link to="/cart" className="flex items-center space-x-2 hover:text-blue-200 transition-colors">
                      <FontAwesomeIcon icon={faShoppingCart} />
                      <span>Cart</span>
                    </Link>
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
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-100 rounded-t-lg"
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

              {isLoggedIn && isAdmin() ? (
                <>
                  {/* Chỉ hiển thị Dashboard khi là Admin */}
                  <Link to="/admin" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faTachometerAlt} />
                    <span>Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Hiển thị các liên kết khác khi không phải Admin */}
                  <Link to="/browse" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faBook} />
                    <span>Browse</span>
                  </Link>
                  {isLoggedIn && (
                    <>
                      <Link to="/exchange" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faExchangeAlt} />
                        <span>Exchange</span>
                      </Link>
                      <Link to="/sell" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBook} />
                        <span>Sell</span>
                      </Link>
                      <Link to="/cart" className="flex items-center space-x-2 hover:text-blue-200 transition-colors" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faShoppingCart} />
                        <span>Cart</span>
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

      {/* Modal đổi mật khẩu */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-blue-800">Change Password</h2>
            {passwordError && <p className="text-red-500 text-center mb-4">{passwordError}</p>}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;