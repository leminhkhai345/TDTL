import React from "react";
import { useCart } from "../src/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CartPage = () => {
  const navigate = useNavigate();
  const context = useCart();

  // Kiểm tra nếu context không tồn tại
  if (!context) {
    console.error("CartPage must be used within a CartProvider");
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-red-600">Error: Cart context not available.</p>
      </div>
    );
  }

  const { cartItems, removeFromCart, updateQuantity } = context;

  // Kiểm tra an toàn cho cartItems
  const items = Array.isArray(cartItems) ? cartItems : [];

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-600">Your cart is empty.</p>
        <button
          onClick={() => navigate("/browse")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Browse Books
        </button>
      </div>
    );
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const price = typeof item.price === "number" ? item.price : 0;
      const quantity = typeof item.quantity === "number" ? item.quantity : 0;
      return total + price * quantity;
    }, 0);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {items.map((item) => {
          // Kiểm tra an toàn cho price và quantity
          const price = typeof item.price === "number" ? item.price : 0;
          const quantity = typeof item.quantity === "number" ? item.quantity : 0;
          const subtotal = price * quantity;

          return (
            <div key={item.bookId} className="flex items-center justify-between border-b py-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.title || "Unknown Title"}</h3>
                <p className="text-gray-600">by {item.author || "Unknown Author"}</p>
                <p className="text-gray-600">Price: ${price.toFixed(2)}</p>
                <div className="flex items-center mt-2">
                  <button
                    onClick={() => updateQuantity(item.bookId, quantity - 1)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="mx-2">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.bookId, quantity + 1)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-medium">${subtotal.toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item.bookId)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
        <div className="flex justify-between font-bold text-lg mt-6">
          <p>Total</p>
          <p>${calculateTotal().toFixed(2)}</p>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartPage;