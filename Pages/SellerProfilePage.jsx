import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getReviewsBySeller, getSellerAverageRating, getPublicUserProfile } from '../src/API/api';
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

        // Fetch seller public profile
        const userData = await getPublicUserProfile(sellerId);
        setProfile({
          fullName: userData.fullName || '',
          phone: userData.phone || '',
          address: userData.address || '',
          birth: userData.birth ? new Date(userData.birth).toISOString().split('T')[0] : '',
          email: userData.email || 'Anonymous',
          avatarUrl: userData.avatarUrl || '',
          joinDate: userData.createdAt || userData.joinDate || '',
        });

        // Fetch average rating
        try {
          const avgRating = await getSellerAverageRating(sellerId);
          setAverageRating(avgRating || 0);
        } catch {
          setAverageRating(0);
        }

        // Fetch reviews (default 3)
        try {
          const reviewData = await getReviewsBySeller(sellerId, 1, 3);
          const reviewsArr = Array.isArray(reviewData) ? reviewData : (reviewData.items || []);
          setReviews(reviewsArr);
          setTotalPages(reviewData.totalPages || 1);
        } catch {
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
      const reviewsArr = Array.isArray(reviewData) ? reviewData : (reviewData.items || []);
      setReviews(reviewsArr);
      setTotalPages(reviewData.totalPages || 1);
    } catch {
      toast.error('Failed to load reviews');
    }
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    try {
      const reviewData = await getReviewsBySeller(sellerId, page, 5);
      const reviewsArr = Array.isArray(reviewData) ? reviewData : (reviewData.items || []);
      setReviews(reviewsArr);
      setTotalPages(reviewData.totalPages || 1);
    } catch {
      toast.error('Failed to load reviews');
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-lg animate-pulse">Loading seller profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          {error || 'Seller profile not found'}
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100">
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-0">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-blue-100 mb-10">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-semibold text-gray-600 border-4 border-blue-200 overflow-hidden mb-4 shadow">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName || profile.email} className="w-full h-full object-cover" />
            ) : (
              profile.email[0].toUpperCase()
            )}
          </div>
          <h2 className="text-3xl font-bold text-blue-800 mb-2">{profile.fullName || profile.email}</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <div className="text-gray-600"><span className="font-medium">Email:</span> {profile.email}</div>
            <div className="text-gray-600"><span className="font-medium">Phone:</span> {profile.phone || 'Not provided'}</div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <div className="text-gray-600"><span className="font-medium">Address:</span> {profile.address || 'Not provided'}</div>
            <div className="text-gray-600"><span className="font-medium">Birthday:</span> {profile.birth ? new Date(profile.birth).toLocaleDateString() : 'Not provided'}</div>
          </div>
          <div className="text-gray-600 mb-2"><span className="font-medium">Joined:</span> {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'Not provided'}</div>
          {averageRating !== null && (
            <div className="flex items-center mt-3">
              <StarRating rating={averageRating} />
              <span className="ml-2 text-blue-700 font-semibold">({averageRating.toFixed(1)})</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
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

        {selectedReview && (
          <ReviewDetailModal
            review={selectedReview}
            isOpen={!!selectedReview}
            onClose={() => setSelectedReview(null)}
          />
        )}

        <Footer />
      </div>
    </div>
  );
};

export default SellerProfilePage;