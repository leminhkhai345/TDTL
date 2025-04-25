import React from "react";
import LoginForm from "../Components/LoginForm"; // Import LoginForm
import Footer from "../Components/Footer";
const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Login</h2>
        <LoginForm />
        
      </div>
    </div>
     
  );
};

export default LoginPage;
