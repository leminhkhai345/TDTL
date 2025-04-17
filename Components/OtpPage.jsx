import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate to redirect

const OtpPage = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);  // State to hold the OTP values in each input box
  const navigate = useNavigate();  // Initialize navigate

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Focus on the next input when a value is entered
      if (index < otp.length - 1 && value !== "") {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combine the OTP digits and log it to the console for now
    const otpCode = otp.join('');
    console.log('OTP Submitted:', otpCode);

    // Simulating OTP verification (can replace this with API call)
    if (otpCode === "1234") {  // Example of a correct OTP, replace with real verification logic
      alert("OTP verified successfully!");
      // Navigate back to HomePage after successful OTP verification
      navigate('/');  // Redirect to Home page
    } else {
      alert("Invalid OTP. Please try again.");
      // Clear OTP inputs on failure
      setOtp(["", "", "", ""]);
    }
  };

  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col justify-center items-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl text-yellow-500">Email Verification</h2>
        <p className="text-white">
          We've sent a verification to <span className="font-semibold">ThangPham+test10@gmail.com</span> to verify your email address and activate your account.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleOtpChange(e, index)}
            maxLength="1"
            className="w-12 h-12 text-center text-xl bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        ))}
      </form>

      <button
        type="submit"
        onClick={handleSubmit}
        className="mt-6 bg-yellow-500 text-gray-800 px-6 py-2 rounded-md text-xl hover:bg-yellow-600"
      >
        Verify My Account
      </button>

      <div className="mt-4">
        <p className="text-white">
          Didn't receive any code? <button className="text-yellow-500 hover:underline">Resend</button>
        </p>
      </div>
    </div>
  );
};

export default OtpPage;
