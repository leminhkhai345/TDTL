import React, { createContext, useContext, useState, useEffect } from "react";

// Tạo context
const AuthContext = createContext();

// Tạo Provider
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn") === "true";
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedLogin && storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    }
  }, []);

  // ✅ Hàm login gọi API thật
  const login = async (email, password) => {
    try {
      //thêm API thật vào
      const response = await fetch("https://your-api.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("Response:", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      setIsLoggedIn(true);
      setUser(data.user);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ✅ Hàm register 
  const register = async (name, email, phone, password) => {
    try {

      //thêm API thật vào đây
      const response = await fetch("https://your-api.com/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      console.log("Response:", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      setIsLoggedIn(true);
      setUser(data.user);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Đăng xuất
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để dùng context dễ hơn
export const useAuth = () => useContext(AuthContext);
