// src/Components/BookCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const BookCard = ({ book, viewMode, onAddToCart }) => {
  return (
    <div
      className={`border rounded-lg p-4 shadow-md ${
        viewMode === "grid" ? "flex flex-col" : "flex gap-4 items-center"
      }`}
    >
      <img
        src={book.image}
        alt={book.title}
        className={`${
          viewMode === "grid" ? "w-full h-48 object-cover" : "w-24 h-36"
        } rounded`}
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{book.title}</h3>
        <p className="text-gray-600">Author: {book.author}</p>
        <p className="text-gray-600">Genre: {book.genre}</p>
        <p className="text-gray-600">Price: ${parseFloat(book.price).toFixed(2)}</p>
        {book.description && (
          <p className="text-gray-500 text-sm mt-2">
            {book.description.slice(0, 100)}...
          </p>
        )}
        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/book-details/${book.bookId}`}
            className="text-sm text-blue-500 hover:underline"
          >
            View Details
          </Link>
          <button
            onClick={() => onAddToCart(book)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;