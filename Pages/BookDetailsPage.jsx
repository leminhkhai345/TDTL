import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../src/contexts/CartContext';
import { toast } from 'react-toastify';
import { getReviewsByBookId, createReview } from '../src/API/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

const BookDetailsPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [bookReviews, setBookReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_EXCHANGE_API_URL}/api/Documents/${bookId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch book details: ${response.statusText}`);
      }
      const bookData = await response.json();

      setBook(bookData);

      const reviewsResponse = await getReviewsByBookId(bookId);
      setBookReviews(reviewsResponse.reviews || reviewsResponse);
    } catch (err) {
      setError(err.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const handleSubmitReview = useCallback(async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    const reviewData = {
      userId: user.id,
      bookId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      await createReview(bookId, reviewData);
      await fetchBookDetails();
      setRating(0);
      setHoverRating(0);
      setComment('');
      toast.success('Review submitted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }, [user, rating, comment, bookId]);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleStarHover = (value) => {
    setHoverRating(value);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleAddToCart = () => {
    if (book) {
      const mappedBook = {
        documentId: book.documentId,
        title: book.title || 'Unknown Title',
        author: book.author || 'Unknown Author',
        categoryName: book.categoryName || 'Unknown Category',
        price: book.price !== null ? book.price : (Math.random() * 20 + 5).toFixed(2),
        image: book.imageUrl || 'https://via.placeholder.com/150',
        description: book.description || 'No description available',
      };
      addToCart(mappedBook);
      toast.success(`${mappedBook.title} added to cart!`);
    }
  };

  const renderedReviews = useMemo(() => {
    return bookReviews.map((review) => (
      <div key={review.id} className="border-b py-4">
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, index) => (
            <FontAwesomeIcon
              key={index}
              icon={index < review.rating ? solidStar : regularStar}
              className="text-yellow-400 text-lg mr-1"
            />
          ))}
        </div>
        <p className="text-gray-700">{review.comment}</p>
        <p className="text-sm text-gray-500 mt-1">By User ID: {review.userId}</p>
        <p className="text-sm text-gray-500">
          Posted on: {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>
    ));
  }, [bookReviews]);

  if (loading) return <div className="text-center py-6">Loading...</div>;

  if (error || !book) {
    return <div className="text-center text-red-600 py-6">{error || 'Book not found'}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6 mb-8">
        <div className="w-1/3">
          <img
            src={book.imageUrl || 'https://via.placeholder.com/150'}
            alt={book.title}
            className="w-full h-72 object-cover rounded-lg"
          />
        </div>
        <div className="w-2/3">
          <h2 className="text-3xl font-semibold text-blue-800">{book.title}</h2>
          <p className="text-xl text-gray-600">by {book.author || 'Unknown Author'}</p>
          <p className="text-sm text-gray-600 mt-2">Category: {book.categoryName}</p>
          <p className="mt-4 text-lg">{book.description || 'No description available'}</p>
          <p className="mt-4 text-xl font-bold text-blue-600">
            {book.price !== null ? `$${parseFloat(book.price).toFixed(2)}` : 'Price not available'}
          </p>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
            <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Buy Now
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        {bookReviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review this book!</p>
        ) : (
          renderedReviews
        )}
        <h2 className="text-xl font-semibold mt-6 mb-4">Add a Review</h2>
        <form onSubmit={handleSubmitReview}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Rating</label>
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <FontAwesomeIcon
                    key={starValue}
                    icon={
                      starValue <= (hoverRating || rating) ? solidStar : regularStar
                    }
                    className="text-yellow-400 text-2xl cursor-pointer mr-2 transition-colors"
                    onClick={() => handleStarClick(starValue)}
                    onMouseEnter={() => handleStarHover(starValue)}
                    onMouseLeave={handleStarLeave}
                  />
                );
              })}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm hover:shadow-md"
              rows="4"
              placeholder="What did you think about this book?"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookDetailsPage;