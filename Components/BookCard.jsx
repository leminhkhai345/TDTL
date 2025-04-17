// src/components/BookCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  return (
    <div className="border rounded-lg p-4">
      <img src={book.image} alt={book.title} className="w-full h-48 object-cover mb-4 rounded" />
      <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
      <p className="text-sm text-gray-600">{book.author}</p>
      <div className="mt-4">
        <Link
          to={`/book/${book.id}`}
          className="inline-block py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
