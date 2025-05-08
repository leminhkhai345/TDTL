// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../API/api'; // Đảm bảo import từ api.js

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedLogin = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedLogin && storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await loginUser(email, password);
      const userWithRole = { ...userData, role: userData.role || 'user' }; // Thêm role, mặc định là 'user'
      setIsLoggedIn(true);
      setUser(userWithRole);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userWithRole));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (fullName, email, phone, password) => {
    try {
      const response = await fetch('https://680d2126c47cb8074d8fa188.mockapi.io/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          role: 'user', // Người dùng mới luôn là 'user'
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const userData = await response.json();
      const userWithRole = { ...userData, role: 'user' };
      setIsLoggedIn(true);
      setUser(userWithRole);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userWithRole));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);