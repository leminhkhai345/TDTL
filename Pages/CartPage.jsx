import React from "react";
import { useCart } from "../src/contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from 'framer-motion';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (bookId, quantity) => {
    if (quantity >= 0) {
      updateQuantity(bookId, quantity);
    }
  };

  const handleRemoveItem = (bookId, title) => {
    removeFromCart(bookId);
    toast.success(`${title} removed from cart!`);
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    navigate("/checkout");
  };

  // Hiệu ứng animation cho section
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.3,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Hiệu ứng cho các hàng trong bảng
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.1,
        ease: "easeOut",
      },
    }),
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-6 bg-gradient-to-b from-gray-50 to-gray-100"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        variants={childVariants}
        className="text-3xl font-bold mb-6 text-blue-800 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent"
      >
        Your Cart
      </motion.h1>

      {cartItems.length === 0 ? (
        <motion.div
          variants={childVariants}
          className="text-center py-6"
        >
          <p className="text-gray-600">Your cart is empty.</p>
          <motion.div variants={childVariants}>
            <Link
              to="/browse"
              className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
              whileHover={{ scale: 1.05, transition: { duration: 0.3, ease: "easeOut" } }}
            >
              Browse Books
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          variants={childVariants}
          className="bg-white rounded-lg shadow-md overflow-x-auto"
        >
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Image</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <motion.tr
                  key={item.bookId}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="border-b"
                >
                  <td className="px-6 py-4">
                    <motion.img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-16 object-cover rounded"
                      whileHover={{ scale: 1.05, transition: { duration: 0.3, ease: "easeOut" } }}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${parseFloat(item.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => handleQuantityChange(item.bookId, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        disabled={item.quantity <= 1}
                        whileHover={{ scale: 1.05, transition: { duration: 0.3, ease: "easeOut" } }}
                      >
                        -
                      </motion.button>
                      <motion.input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.bookId, parseInt(e.target.value) || 1)
                        }
                        className="w-16 p-1 border rounded text-center"
                        min="1"
                        whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }}
                      />
                      <motion.button
                        onClick={() => handleQuantityChange(item.bookId, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        whileHover={{ scale: 1.05, transition: { duration: 0.3, ease: "easeOut" } }}
                      >
                        +
                      </motion.button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <motion.button
                      onClick={() => handleRemoveItem(item.bookId, item.title)}
                      className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-700 text-white rounded hover:from-red-600 hover:to-red-800 transition-all duration-300"
                      whileHover={{ scale: 1.05, transition: { duration: 0.3, ease: "easeOut" } }}
                    >
                      Remove
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          <motion.div
            variants={childVariants}
            className="flex justify-between items-center mt-6 p-6"
          >
            <h2 className="text-xl font-semibold">
              Total: <span className="text-blue-600">${calculateTotal()}</span>
            </h2>
            <motion.button
              onClick={handleCheckout}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg hover:from-green-700 hover:to-green-900 transition-all duration-300"
              whileHover={{ scale: 1.05, transition: { duration: 0.3, ease: "easeOut" } }}
            >
              Proceed to Checkout
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CartPage;