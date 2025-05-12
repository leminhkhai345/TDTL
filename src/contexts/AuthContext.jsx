import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../API/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const storedLogin = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');
    if (storedLogin && storedUser && storedToken) {
      setIsLoggedIn(true);
      setUser(storedUser);
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      const userData = await loginUser(email, password);
      console.log('Login role:', userData.role); // Debug vai trò

      // Xóa localStorage cũ
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');

      // Cập nhật trạng thái
      setIsLoggedIn(true);
      setUser({
        email: userData.email,
        role: userData.role || 'User', // Fallback nếu role không có
      });
      setToken(userData.Token);

      // Lưu vào localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify({
        email: userData.email,
        role: userData.role || 'User',
      }));
      localStorage.setItem('token', userData.Token);

      return { success: true, role: userData.role };
    } catch (err) {
      let errorMessage = err.message;
      if (errorMessage.includes('Invalid credentials')) {
        errorMessage = 'Email hoặc mật khẩu không đúng.';
      } else if (errorMessage.includes('Email not verified')) {
        errorMessage = 'Email chưa được xác minh. Vui lòng kiểm tra email của bạn.';
      } else if (errorMessage.includes('Failed to decode')) {
        errorMessage = 'Lỗi xác thực. Vui lòng thử lại.';
      }

      return { success: false, message: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (fullName, email, phone, password, confirmPassword) => {
    try {
      setAuthLoading(true);
      const response = await registerUser({ fullName, email, phone, password, confirmPassword });
      if (response.status !== 'success') {
        throw new Error(response.message || 'Registration failed');
      }
      localStorage.setItem('userEmail', email);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    localStorage.clear(); // Xóa toàn bộ localStorage để tránh dữ liệu cũ
  };

  const isAdmin = () => {
    return user?.role === 'Admin' || user?.role?.toLowerCase() === 'admin';
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, register, logout, isAdmin, loading, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);