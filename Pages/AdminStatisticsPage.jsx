// src/pages/AdminReviewsPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { DataContext } from '../src/contexts/DataContext';
import { deleteReview } from '../src/API/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const AdminReviewsPage = () => {
  const { reviews: allReviews, users: allUsers, books: allBooks, refreshData } = useContext(DataContext);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [total, setTotal] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const limit = 10;

  useEffect(() => {
    setTotal(allReviews.length);
    setFilteredTotal(allReviews.length);
  }, [allReviews]);

  const filteredReviews = useMemo(() => {
    let filtered = [...allReviews];

    filtered = filtered.filter((review) => {
      const matchesSearch =
        !search ||
        review.id.toLowerCase().includes(search.toLowerCase()) ||
        review.userId.toLowerCase().includes(search.toLowerCase()) ||
        review.bookId.toLowerCase().includes(search.toLowerCase()) ||
        review.comment.toLowerCase().includes(search.toLowerCase());
      const matchesRating =
        ratingFilter === 'all' || Number(review.rating) === Number(ratingFilter);
      const reviewDate = new Date(review.createdAt);
      const matchesDate =
        (!startDate || reviewDate >= new Date(startDate)) &&
        (!endDate || reviewDate <= new Date(endDate));
      return matchesSearch && matchesRating && matchesDate;
    });

    filtered.sort((a, b) => {
      const valueA = sortBy === 'rating' ? Number(a.rating) : a.id.toLowerCase();
      const valueB = sortBy === 'rating' ? Number(b.rating) : b.id.toLowerCase();
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filtered;
  }, [allReviews, search, ratingFilter, startDate, endDate, sortBy, sortDirection]);

  useEffect(() => {
    setFilteredTotal(filteredReviews.length);

    const maxPage = Math.ceil(filteredReviews.length / limit);
    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    } else if (filteredReviews.length === 0) {
      setPage(1);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);
    setReviews(paginatedReviews);
  }, [filteredReviews, page]);

  const handleDelete = useCallback((reviewId) => {
    setReviewToDelete(reviewId);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await deleteReview(reviewToDelete);
      refreshData(); // Làm mới dữ liệu từ context
      toast.success('Review deleted successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  }, [reviewToDelete, refreshData]);

  const cancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setReviewToDelete(null);
  }, []);

  const handleViewDetails = useCallback((review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedReview(null);
  }, []);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setSearch('');
    setRatingFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('id');
    setSortDirection('asc');
    refreshData();
  }, [refreshData]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Manage Reviews</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faSyncAlt} />
          Refresh
        </button>
      </div>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by ID, user ID, book ID, or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Ratings</option>
          <option value="1">1 Star</option>
          <option value="2">2 Stars</option>
          <option value="3">3 Stars</option>
          <option value="4">4 Stars</option>
          <option value="5">5 Stars</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="id">Sort by ID</option>
          <option value="rating">Sort by Rating</option>
        </select>
        <select
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <p className="mb-6 text-gray-600">Total Reviews: {total} (Filtered: {filteredTotal})</p>
      {reviews.length === 0 ? (
        <p className="text-center text-gray-600">
          {search || ratingFilter !== 'all' || startDate || endDate
            ? 'No reviews match your search.'
            : 'No reviews found.'}
        </p>
      ) : (
        <div>
          <div className="md:hidden">
            {reviews.map((review) => (
              <div key={review.id} className="border-b p-4">
                <p>
                  <strong>ID:</strong>{' '}
                  <button
                    onClick={() => handleViewDetails(review)}
                    className="text-blue-600 hover:underline"
                  >
                    {review.id}
                  </button>
                </p>
                <p><strong>User ID:</strong> {review.userId}</p>
                <p><strong>Book ID:</strong> {review.bookId}</p>
                <p><strong>Rating:</strong> {review.rating} Stars</p>
                <p><strong>Comment:</strong> {review.comment}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Book ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Comment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button
                        onClick={() => handleViewDetails(review)}
                        className="text-blue-600 hover:underline"
                      >
                        {review.id}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{review.userId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{review.bookId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{review.rating} Stars</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{review.comment}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={reviews.length < limit || page * limit >= filteredTotal}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Review Details</h2>
            <p><strong>ID:</strong> {selectedReview.id}</p>
            <p><strong>Rating:</strong> {selectedReview.rating} Stars</p>
            <p><strong>Comment:</strong> {selectedReview.comment}</p>
            <p><strong>Created At:</strong> {new Date(selectedReview.createdAt).toLocaleString()}</p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">User Information</h3>
              {(() => {
                const user = allUsers.find((u) => u.id === selectedReview.userId);
                return user ? (
                  <>
                    <p><strong>Name:</strong> {user.fullName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </>
                ) : (
                  <p className="text-gray-600">User not found</p>
                );
              })()}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">Book Information</h3>
              {(() => {
                const book = allBooks.find((b) => b.id === selectedReview.bookId);
                return book ? (
                  <div className="flex items-center gap-2">
                    {book.coverImage && (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div>
                      <p><strong>Title:</strong> {book.title}</p>
                      <p><strong>Author:</strong> {book.author}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Book not found</p>
                );
              })()}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Confirm Deletion</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete this review?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;