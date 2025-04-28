import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyOtp } from "../src/API/api";

const OtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Debug
  console.log("OtpPage: location.state =", location.state);
  console.log("OtpPage: email =", email);

  // Xử lý xác minh OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
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
        // Lưu token nếu BE trả về (hiện tại BE không trả token)
        navigate(location.state?.redirect || "/login");
      } else {
        setError("Mã OTP không đúng. Vui lòng thử lại.");
        toast.error("Mã OTP không đúng.");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Xác Nhận OTP</h1>
      <p className="text-center mb-4">
        Một mã OTP đã được gửi đến email: <strong>{email || "Không xác định"}</strong>. Vui lòng nhập mã để xác nhận.
      </p>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Mã OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? "border-red-500" : ""
            }`}
            placeholder="Nhập mã OTP 6 chữ số"
            maxLength={6}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang xử lý..." : "Xác Nhận"}
        </button>
        {!email && (
          <p className="text-center text-red-500 mt-4">
            Không tìm thấy email. Nếu không nhận được OTP, vui lòng{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 underline"
            >
              đăng ký lại
            </button>.
          </p>
        )}
      </form>
    </div>
  );
};

export default OtpPage;