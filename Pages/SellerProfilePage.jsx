import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getReviewsBySeller, getSellerAverageRating } from '../src/API/api';
//  getPublicUserProfile,
import ReviewList from '../Components/ReviewList';
import ReviewDetailModal from '../Components/ReviewDetailModal';
import StarRating from '../Components/StarRating';
import Footer from '../Components/Footer';

const SellerProfilePage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Please log in to view seller profile');
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy thông tin profile người bán
        // const userData = await getPublicUserProfile(sellerId);
        // setProfile({
        //   fullName: userData.fullName || '',
        //   phone: userData.phone || '',
        //   address: userData.address || '',
        //   birth: userData.birth ? new Date(userData.birth).toISOString().split('T')[0] : '',
        //   email: userData.email || 'Anonymous'
        // });

        // Lấy điểm trung bình
        try {
          const avgRating = await getSellerAverageRating(sellerId);
          setAverageRating(avgRating || 0);
        } catch (err) {
          console.log('No average rating found:', err.message);
          setAverageRating(0);
        }

        // Lấy danh sách đánh giá (mặc định 3 đánh giá)
        try {
          const reviewData = await getReviewsBySeller(sellerId, 1, 3);
          setReviews(reviewData.items || []);
          setTotalPages(reviewData.totalPages || 1);
        } catch (err) {
          console.log('No reviews found:', err.message);
          setReviews([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load seller profile');
        toast.error(err.message || 'Failed to load seller profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [sellerId, isLoggedIn, navigate]);

  const handleShowAllReviews = async () => {
    setShowAllReviews(true);
    try {
      const reviewData = await getReviewsBySeller(sellerId, currentPage, 5);
      setReviews(reviewData.items || []);
      setTotalPages(reviewData.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load reviews');
    }
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    try {
      const reviewData = await getReviewsBySeller(sellerId, page, 5);
      setReviews(reviewData.items || []);
      setTotalPages(reviewData.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load reviews');
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600 text-lg">Loading...</div>;
  }

  if (error || !profile) {
    return (
      <div className="text-center text-red-600 py-12 text-lg">
        {error || 'Seller profile not found'}
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">Seller Profile</h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Seller Profile */}
        <div className="col-span-1 bg-white rounded-xl shadow-lg p-8 border-r-2 border-blue-600 min-h-[500px]">
          <h2 className="text-2xl font-semibold mb-6 text-blue-700">Seller Profile</h2>
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-semibold text-gray-600 border-4 border-gray-200">
              {profile.email[0].toUpperCase()}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Name: </span>
              {profile.fullName || profile.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Email: </span>
              {profile.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Phone: </span>
              {profile.phone || 'Not provided'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Address: </span>
              {profile.address || 'Not provided'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Birthday: </span>
              {profile.birth ? new Date(profile.birth).toLocaleDateString() : 'Not provided'}
            </p>
            {averageRating !== null && (
              <p className="text-gray-600 flex items-center">
                <span className="font-medium text-gray-800">Rating: </span>
                <span className="ml-2 flex items-center">
                  <StarRating rating={averageRating} />
                  <span className="ml-1">({averageRating.toFixed(1)})</span>
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Seller Reviews */}
        <div className="col-span-2 bg-white rounded-xl shadow-lg p-8 min-h-[500px]">
          <h2 className="text-2xl font-semibold mb-6 text-blue-700">Seller Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet for this seller.</p>
          ) : (
            <>
              <ReviewList reviews={reviews} onViewReview={handleViewReview} isOwner={false} />
              {!showAllReviews && reviews.length >= 3 && (
                <button
                  onClick={handleShowAllReviews}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Show All Reviews
                </button>
              )}
              {showAllReviews && (
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
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default SellerProfilePage;