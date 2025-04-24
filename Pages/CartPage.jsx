import React from "react";
import { useCart } from "../src/contexts/CartContext";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  const handleQuantityChange = (id, e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity)) {
      updateQuantity(id, newQuantity);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Shopping Cart</h2>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty!</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Danh sách giỏ hàng */}
              {cart.map((book) => (
                <tr key={book.id} className="border-b">
                  <td className="px-6 py-4 flex items-center space-x-4">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(book.id, book.quantity - 1)}
                        className="px-2 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={book.quantity}
                        onChange={(e) => handleQuantityChange(book.id, e)}
                        className="w-12 text-center border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => updateQuantity(book.id, book.quantity + 1)}
                        className="px-2 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${book.price}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ${book.price * book.quantity}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => removeFromCart(book.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tổng giá trị giỏ hàng */}
          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Total</h3>
            <p className="text-xl font-bold text-blue-600">${getTotalPrice()}</p>
          </div>

          {/* Tiến hành thanh toán */}
          <div className="mt-4 flex justify-end space-x-4">
            <Link
              to="/browse"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Continue Shopping
            </Link>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
