import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { getListedDocuments } from "../src/API/api";
import { useAuth } from "../src/contexts/AuthContext";

const BookCarousel = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const booksPerPage = 4;
  const transitionDuration = 0.6;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const mappedBooks = await getListedDocuments(1, 20);
        setBooks(mappedBooks);
      } catch (err) {
        setError(err.message || "Failed to fetch books.");
        toast.error(err.message || "Failed to fetch books.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const totalSlides = Math.ceil(books.length / booksPerPage);

  const displayedBooks = useMemo(() => {
    const startIndex = currentIndex * booksPerPage;
    return books.slice(startIndex, startIndex + booksPerPage);
  }, [currentIndex, books, booksPerPage]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const handleLoginRedirect = (bookId) => {
    navigate("/login", {
      state: { from: `/books/${bookId}` }
    });
  };

  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-6">{error}</div>;
  }

  if (books.length === 0) {
    return <div className="text-center text-gray-600 py-6">No books available.</div>;
  }

  return (
    <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: transitionDuration, ease: "easeInOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {displayedBooks.map((book) => (
              <div
                key={book.listingId}
                className="group relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative">
                  <img
                    src={book.imageUrl || "https://via.placeholder.com/150"}
                    alt={book.title}
                    className="w-full h-48 object-cover transition-opacity duration-300 group-hover:opacity-80"
                    loading="lazy"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isLoggedIn ? (
                      <div className="space-x-2">
                        <Link
                          to={`/books/${book.listingId}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleLoginRedirect(book.listingId)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                      >
                        Sign in to Purchase
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{book.categoryName || 'Unknown'}</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    ${parseFloat(book.price || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Previous Slide"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Next Slide"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? "bg-blue-600" : "bg-gray-300"
            } transition-colors`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BookCarousel;