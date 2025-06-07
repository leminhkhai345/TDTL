import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getReviewsByReviewer, updateReview, deleteUserReview } from '../src/API/api';
import ReviewList from '../Components/ReviewList';
import ReviewDetailModal from '../Components/ReviewDetailModal';
import ReviewForm from '../Components/ReviewForm';

const MyReviewsPage = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editReview, setEditReview] = useState(null);
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const reviewData = await getReviewsByReviewer(user.id, page, 5);
      setReviews(reviewData.items || []);
      setTotalPages(reviewData.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
      toast.error(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Please log in to view your reviews');
      navigate('/login');
      return;
    }
    fetchReviews();
  }, [isLoggedIn, navigate, user.id]);

  const handlePageChange = (page) => {
    fetchReviews(page);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
  };

  const handleEditReview = (review) => {
    setEditReview(review);
  };

  const handleDeleteReview = (reviewId) => {
    setDeleteReviewId(reviewId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteReview = async () => {
    setIsSubmitting(true);
    try {
      const review = reviews.find(r => r.reviewId === deleteReviewId);
      await deleteUserReview(deleteReviewId, review.rowVersion);
      toast.success('Review deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchReviews(currentPage);
    } catch (error) {
      toast.error(error.message || 'Failed to delete review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    setReviews(reviews.map(r => r.reviewId === reviewData.reviewId ? reviewData : r));
    fetchReviews(currentPage);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600 text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-12 text-lg">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">My Reviews</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        {reviews.length === 0 ? (
          <p className="text-gray-600">You have not submitted any reviews yet.</p>
        ) : (
          <>
            <ReviewList
              reviews={reviews}
              onViewReview={handleViewReview}
              onEditReview={handleEditReview}
              onDeleteReview={handleDeleteReview}
              isOwner={true}
            />
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}

      {/* Edit Review Modal */}
      {editReview && (
        <ReviewForm
          isOpen={!!editReview}
          onClose={() => setEditReview(null)}
          order={{ orderId: editReview.orderId }}
          review={editReview}
          onSubmitSuccess={handleReviewSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="delete-modal-title">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Đóng modal xóa"
            >
              <FontAwesomeIcon icon={['fas', 'times']} />
            </button>
            <h2 id="delete-modal-title" className="text-xl font-bold mb-4 text-blue-700">Delete Review</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Confirm Delete"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;