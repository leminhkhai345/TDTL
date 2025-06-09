import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../src/contexts/AuthContext";
import { toast } from "react-toastify";

const BookCard = ({ book, viewMode, onBuyNow }) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login", {
      state: { from: `/books/${book.bookId}` },
    });
  };

  return (
    <div
      className={`border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 ${
        viewMode === "grid" ? "flex flex-col" : "flex gap-4 items-center"
      }`}
    >
      <img
        src={book.image || "https://via.placeholder.com/150"}
        alt={book.title}
        className={`${
          viewMode === "grid" ? "w-full h-48 object-cover" : "w-24 h-36"
        } rounded`}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/150";
          toast.info("Unable to load book image");
        }}
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-blue-800 truncate">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600">
          Author: {book.author || "Unknown"}
        </p>
        <p className="text-sm text-gray-600">
          Genre: {book.genre || "Unknown"}
        </p>
        <p className="text-sm font-bold text-blue-600">
          Price: ${parseFloat(book.price || 0).toFixed(2)}
        </p>
        {/* Only show description if it exists */}
        {book.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {book.description}
          </p>
        )}
        {/* Show fallback text if no description */}
        {!book.description && (
          <p className="text-gray-500">
            No description available for this book
          </p>
        )}
        <div className="mt-4 flex gap-2">
          {isLoggedIn ? (
            // Khi đã đăng nhập
            <>
              <button
                onClick={() => onBuyNow(book)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all hover:scale-105"
              >
                Buy Now
              </button>
              <Link
                to={`/books/${book.bookId}`}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all hover:scale-105 text-center"
              >
                View Details
              </Link>
            </>
          ) : (
            // Khi chưa đăng nhập
            <button
              onClick={handleLoginRedirect}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
            >
              Sign in to Purchase
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;