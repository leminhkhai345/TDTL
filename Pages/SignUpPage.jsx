import React from "react";
import { useNavigate, Link } from "react-router-dom";
import SignUpForm from "../Components/SignUpForm"; // Đúng với cấu trúc thư mục

const SignUpPage = () => {
  const navigate = useNavigate();

  const handleSignUpSuccess = (email) => {
    // Điều hướng đến OtpPage, truyền email qua state
    navigate("/otp", { state: { email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Sign Up</h2>
        <SignUpForm onSubmit={handleSignUpSuccess} />
        <p className="text-center mt-4">
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