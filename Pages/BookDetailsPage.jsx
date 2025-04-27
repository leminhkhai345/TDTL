// src/pages/BookDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../src/contexts/CartContext";
import { toast } from "react-toastify";

const BookDetailsPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  const API_KEY = "AIzaSyD-HCLvX01x57PU6rKtLJSFjiCKsf-Ldfk"; // Thay bằng API key của bạn

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${API_KEY}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch book details");
        }
        const data = await response.json();

        const mappedBook = {
          bookId: data.id,
          title: data.volumeInfo.title || "Unknown Title",
          author: data.volumeInfo.authors?.join(", ") || "Unknown Author",
          genre: data.volumeInfo.categories?.[0] || "Unknown Genre",
          price: data.saleInfo?.listPrice?.amount || (Math.random() * 20 + 5).toFixed(2),
          image: data.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150",
          description: data.volumeInfo.description || "No description available",
        };

        setBook(mappedBook);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleAddToCart = () => {
    if (book) {
      addToCart(book);
      toast.success(`${book.title} added to cart!`);
    }
  };

  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  if (error || !book) {
    return <div className="text-center text-red-600 py-6">{error || "Book not found"}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="w-1/3">
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-72 object-cover rounded-lg"
          />
        </div>
        <div className="w-2/3">
          <h2 className="text-3xl font-semibold text-blue-800">{book.title}</h2>
          <p className="text-xl text-gray-600">by {book.author}</p>
          <p className="text-sm text-gray-500">{book.genre}</p>
          <p className="mt-4 text-lg">{book.description}</p>
          <p className="mt-4 text-xl font-bold text-blue-600">${parseFloat(book.price).toFixed(2)}</p>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Add to Cart
            </button>
            <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;