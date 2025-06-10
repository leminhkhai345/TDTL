import React, { useState } from "react";

const OtpForm = ({ onVerifyOtp, isVerified }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value.length <= 1 && /^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Tự động chuyển đến ô tiếp theo nếu có
      if (index < otp.length - 1 && value) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerifyOtp(otp.join("")); // Gửi OTP đã nhập (kết hợp thành chuỗi)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
          Enter the OTP sent to your email
        </label>
        <div className="grid grid-cols-6 gap-2 mt-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              maxLength={1}
              className="w-full h-12 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Verify OTP
      </button>
      {isVerified && (
        <p className="text-green-600 text-sm text-center mt-2">OTP verified successfully! Redirecting...</p>
      )}
    </form>
  );
};

export default OtpForm;
