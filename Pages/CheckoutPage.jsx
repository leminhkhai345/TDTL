import React, { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useCart } from "../src/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.info("Please log in to checkout!");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://680d2126c47cb8074d8fa188.mockapi.io/users/${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const userData = await response.json();
        setShippingInfo({
          fullName: userData.fullName || "",
          address: userData.address || "",
          phoneNumber: userData.phoneNumber || "",
          notes: "",
        });
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!shippingInfo.fullName) newErrors.fullName = "Full name is required";
    if (!shippingInfo.address) newErrors.address = "Address is required";
    if (!shippingInfo.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(shippingInfo.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }
    if (!paymentMethod) newErrors.paymentMethod = "Please select a payment method";
    return newErrors;
  };

  const calculateTotal = () => {
    const items = Array.isArray(cartItems) ? cartItems : [];
    return items.reduce((total, item) => {
      const price = typeof item.price === "number" ? item.price : 0;
      const quantity = typeof item.quantity === "number" ? item.quantity : 0;
      return total + price * quantity;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const items = Array.isArray(cartItems) ? cartItems : [];
      const orderItems = items.map((item) => ({
        bookId: item.bookId,
        title: item.title || "Unknown Title",
        author: item.author || "Unknown Author",
        price: typeof item.price === "number" ? item.price : 0,
        quantity: typeof item.quantity === "number" ? item.quantity : 0,
      }));

      const response = await fetch("https://680d2126c47cb8074d8fa188.mockapi.io/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items: orderItems,
          shippingInfo,
          paymentMethod,
          total: calculateTotal(),
          status: "Pending",
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to create order");

      clearCart();
      toast.success("Order placed successfully!");
      navigate("/order-history"); // Hoặc /profile nếu chưa có /order-history
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const items = Array.isArray(cartItems) ? cartItems : [];
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-600">Your cart is empty.</p>
        <button
          onClick={() => navigate("/sell")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Browse Books
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tóm tắt giỏ hàng */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => {
              const price = typeof item.price === "number" ? item.price : 0;
              const quantity = typeof item.quantity === "number" ? item.quantity : 0;
              return (
                <div key={item.bookId} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.title || "Unknown Title"}</p>
                    <p className="text-gray-600">by {item.author || "Unknown Author"}</p>
                    <p className="text-gray-600">Quantity: {quantity}</p>
                  </div>
                  <p className="font-medium">${(price * quantity).toFixed(2)}</p>
                </div>
              );
            })}
            <div className="flex justify-between font-bold text-lg pt-4">
              <p>Total</p>
              <p>${calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Form thanh toán */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping & Payment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={shippingInfo.fullName}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Address</label>
              <input
                type="text"
                value={shippingInfo.address}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, address: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={shippingInfo.phoneNumber}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, phoneNumber: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.phoneNumber && <p className="text-red-600 text-sm">{errors.phoneNumber}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Notes (Optional)</label>
              <textarea
                value={shippingInfo.notes}
                onChange={(e) =>
                  setShippingInfo({ ...shippingInfo, notes: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="BankTransfer">Bank Transfer</option>
              </select>
              {errors.paymentMethod && (
                <p className="text-red-600 text-sm">{errors.paymentMethod}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;