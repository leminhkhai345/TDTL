import React, { useState } from "react";
import { Link } from "react-router-dom";
import SignUpForm from "../Components/SignUpForm";

const SignUpPage = () => {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUpSubmit = (name, email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // Xử lý đăng ký, có thể gửi dữ liệu lên server ở đây
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);

    // Reset form fields sau khi đăng ký
    setErrorMessage("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Sign Up</h2>

        <SignUpForm onSubmit={handleSignUpSubmit} errorMessage={errorMessage} />

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
