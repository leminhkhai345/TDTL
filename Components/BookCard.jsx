import React from "react";
import { Link } from "react-router-dom";

const BookCard = ({ book, viewMode, onAddToCart, onBuyNow }) => {
  return (
    <div
      className={`border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 ${
        viewMode === "grid" ? "flex flex-col" : "flex gap-4 items-center"
      }`}
    >
      <img
        src={book.image || 'https://via.placeholder.com/150'}
        alt={book.title}
        className={`${
          viewMode === "grid" ? "w-full h-48 object-cover" : "w-24 h-36"
        } rounded`}
        onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
      />
      <div className="flex-1">
        <h3 className="text-lg font-sans font-semibold text-blue-800 truncate">{book.title}</h3>
        <p className="text-sm font-sans text-gray-600">Author: {book.author || 'Unknown'}</p>
        <p className="text-sm font-sans text-gray-600">Genre: {book.genre || 'Unknown'}</p>
        <p className="text-sm font-sans text-blue-600 font-bold">
          Price: ${parseFloat(book.price || 0).toFixed(2)}
        </p>
        {book.description && (
          <p className="text-sm font-sans text-gray-500 mt-2">
            {book.description.slice(0, 100)}...
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onBuyNow(book)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-sans text-sm text-center hover:scale-105"
          >
            Buy Now
          </button>
          <Link
            to={`/books/${book.bookId}`}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-sans text-sm text-center hover:scale-105"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;