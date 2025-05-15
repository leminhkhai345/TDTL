import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../API/api';

const AuthContext = createContext();

// Hàm giải mã JWT để tái sử dụng
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

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
      setUser({
        ...storedUser,
        role: storedUser.role ? storedUser.role.toLowerCase() : 'user',
      });
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      const userData = await loginUser(email, password);
      console.log('Login userData:', userData);

      // Xóa localStorage cũ
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');

      // Giải mã token để lấy thông tin
      const decodedToken = decodeJwt(userData.Token);
      if (!decodedToken) {
        throw new Error('Không thể giải mã token JWT');
      }

      // Lấy id từ token (claim nameidentifier hoặc sub)
      const userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decodedToken.sub;
      if (!userId) {
        console.warn('Không tìm thấy userId trong token');
      }

      // Chuẩn hóa role thành viết thường
      const role = userData.role ? userData.role.toLowerCase() : 'user';
      if (!userData.role) {
        console.warn('No role found in token, defaulting to "user"');
      }

      // Cập nhật trạng thái
      setIsLoggedIn(true);
      setUser({
        id: userId, // Lưu userId vào user
        email: userData.email,
        role: role,
      });
      setToken(userData.Token);

      // Lưu vào localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify({
        id: userId, // Lưu userId vào localStorage
        email: userData.email,
        role: role,
      }));
      localStorage.setItem('token', userData.Token);

      return { success: true, role: role };
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
    localStorage.clear();
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, register, logout, isAdmin, loading, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);