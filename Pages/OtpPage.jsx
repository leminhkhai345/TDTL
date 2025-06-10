import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyOtp, sendOtp } from "../src/API/api";

const OtpPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(300); // 5 phút
  const email = state?.email || localStorage.getItem("userEmail");

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpExpiry((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Không tìm thấy email. Vui lòng đăng ký lại.");
      toast.error("Không tìm thấy email. Vui lòng đăng ký lại.");
      navigate("/signup");
      return;
    }
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Vui lòng nhập mã OTP 6 chữ số.");
      toast.error("Vui lòng nhập mã OTP 6 chữ số.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await verifyOtp(otp);
      if (response.status === "success") {
        toast.success("Xác nhận OTP thành công!");
        localStorage.removeItem("userEmail");
        navigate("/login");
      } else {
        setError("Mã OTP không đúng. Vui lòng thử lại.");
        toast.error("Mã OTP không đúng.");
      }
    } catch (err) {
      let errorMessage = err.message || "Lỗi khi xác minh OTP. Vui lòng thử lại.";
      if (err.message.includes("Email")) {
        errorMessage = "Email không hợp lệ hoặc không tìm thấy.";
      } else if (err.message.includes("OTP")) {
        errorMessage = "Mã OTP không đúng hoặc đã hết hạn.";
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("No email provided. Please sign up again.");
      navigate("/signup");
      return;
    }
    try {
      setLoading(true);
      await sendOtp(email);
      toast.success("OTP resent successfully!");
      setOtpExpiry(300); // Reset expiry
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Confirm OTP</h1>
      <p className="text-center mb-4">
        An OTP code has been sent to the email.: <strong>{email || "Không xác định"}</strong>.Please enter the code to confirm.
      </p>
      <p className="text-center mb-4">
        OTP expires in: {Math.floor(otpExpiry / 60)}:{(otpExpiry % 60).toString().padStart(2, '0')}
      </p>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600"> OTP code</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : ""}`}
            placeholder="Nhập mã OTP 6 chữ số"
            maxLength={6}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Đang xử lý..." : "Xác Nhận"}
        </button>
        <button
          type="button"
          onClick={handleResendOtp}
          className="w-full text-blue-600 hover:underline mt-4"
          disabled={loading || !email}
        >
          Resend OTP
        </button>
        {!email && (
          <p className="text-center text-red-500 mt-4">
            Email not found. Please{" "}
            <Link to="/signup" className="text-blue-600 underline">
              re-register
            </Link>.
          </p>
        )}
      </form>
    </div>
  );
};

export default OtpPage;