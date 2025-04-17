import React, { useState } from "react";
import OtpForm from "../Components/OtpForm";
import { useNavigate } from "react-router-dom";

const OtpPage = () => {
  const [otp, setOtp] = useState("123456"); // Giả lập OTP gửi qua email
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  const handleVerifyOtp = (inputOtp) => {
    if (inputOtp === otp) {
      setIsVerified(true);
      console.log("OTP verified successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else {
      console.log("Invalid OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Verify OTP</h2>
        <OtpForm onVerifyOtp={handleVerifyOtp} isVerified={isVerified} />
      </div>
    </div>
  );
};

export default OtpPage;