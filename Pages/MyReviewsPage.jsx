import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getReviewsByReviewer, getReviewsBySeller, updateReview, deleteUserReview } from '../src/API/api';
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
  const [sellerReviews, setSellerReviews] = useState([]);
  const [sellerReviewsLoading, setSellerReviewsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-reviews'); // New state for active tab

  const fetchReviews = async (page = 1) => {
    if (!user || !user.id) return; // Thêm kiểm tra này
    try {
      setLoading(true);
      setError(null);
      const reviewData = await getReviewsByReviewer(user.id, page, 5);
      // Sửa đoạn này:
      let reviewsArr = [];
      let total = 1;
      if (Array.isArray(reviewData)) {
        reviewsArr = reviewData;
        total = 1;
      } else {
        reviewsArr = reviewData.items || [];
        total = reviewData.totalPages || 1;
      }
      setReviews(reviewsArr);
      setTotalPages(total);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
      toast.error(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews where user is seller (người mua đánh giá mình)
  const fetchSellerReviews = async (page = 1) => {
    if (!user?.id) return;
    try {
      setSellerReviewsLoading(true);
      const reviewData = await getReviewsBySeller(user.id, page, 5);
      let reviewsArr = [];
      let total = 1;

      if (Array.isArray(reviewData)) {
        reviewsArr = reviewData;
        total = 1;
      } else {
        reviewsArr = reviewData.items || [];
        total = reviewData.totalPages || 1;
      }

      setSellerReviews(reviewsArr);
      setTotalPages(total); // Use common totalPages state
      setCurrentPage(page); // Use common currentPage state
    } catch (err) {
      setSellerReviews([]);
    } finally {
      setSellerReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user && user.id) { // Thêm kiểm tra user
      fetchReviews();
      fetchSellerReviews();
    }
  }, [isLoggedIn, navigate, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset page when changing tabs
    if (tab === 'my-reviews') {
      fetchReviews(1);
    } else {
      fetchSellerReviews(1);
    }
  };

  const handlePageChange = (page) => {
    if (activeTab === 'my-reviews') {
      fetchReviews(page);
    } else {
      fetchSellerReviews(page);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-blue-800 text-center mb-8">Review Management</h1>

          {/* Tab Navigation */}
          <div className="flex border-b mb-8">
            <button
              className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 ${
                activeTab === 'my-reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('my-reviews')}
            >
              My Reviews
            </button>
            <button
              className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 ${
                activeTab === 'buyer-reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('buyer-reviews')}
            >
              Reviews From Buyers
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'my-reviews' ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">Reviews I've Written</h2>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : reviews.length === 0 ? (
                <p className="text-gray-600">You haven't written any reviews yet.</p>
              ) : (
                <>
                  <ReviewList
                    reviews={reviews}
                    onViewReview={handleViewReview}
                    onEditReview={handleEditReview}
                    onDeleteReview={handleDeleteReview}
                    isOwner={false}
                    user={user}
                  />
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      
                      <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-lg ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">Reviews From Buyers</h2>
              {sellerReviewsLoading ? (
                <p className="text-gray-600">Loading...</p>
              ) : sellerReviews.length === 0 ? (
                <p className="text-gray-600">No reviews from buyers yet.</p>
              ) : (
                <>
                  <ReviewList
                    reviews={sellerReviews}
                    isOwner={false}
                    user={user}
                  />
                  {sellerReviews.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-lg ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {selectedReview && (
          <ReviewDetailModal
            review={selectedReview}
            isOpen={!!selectedReview}
            onClose={() => setSelectedReview(null)}
          />
        )}

        {editReview && (
          <ReviewForm
            isOpen={!!editReview}
            onClose={() => setEditReview(null)}
            order={{ orderId: editReview.orderId }}
            review={editReview}
            onSubmitSuccess={handleReviewSubmit}
          />
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
              <h2 className="text-xl font-bold mb-4 text-blue-700">Delete Review</h2>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteReview}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviewsPage;