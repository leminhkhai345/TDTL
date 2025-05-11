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
      if (!storedUser.role) {
        storedUser.role = 'user';
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
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
      setIsLoggedIn(true);
      setUser({
        email: userData.email,
        role: userData.role || 'user',
      });
      setToken(userData.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify({
        email: userData.email,
        role: userData.role || 'user',
      }));
      localStorage.setItem('token', userData.token);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (fullName, email, phone, password, confirmPassword) => {
    try {
      setAuthLoading(true);
      const response = await registerUser({ fullName, email, phone, password, confirmPassword });
      if (response.status !== "success") {
        throw new Error(response.message || "Registration failed");
      }
      localStorage.setItem("userEmail", email);
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
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
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