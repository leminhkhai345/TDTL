import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getListingById, getReviewsBySeller, getSellerAverageRating } from '../src/API/api';
import ReviewList from '../Components/ReviewList';
import ReviewDetailModal from '../Components/ReviewDetailModal';
import StarRating from '../Components/StarRating';

const BookDetailsPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasOrdered, setHasOrdered] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!listingId || listingId === 'undefined' || isNaN(parseInt(listingId))) {
        throw new Error('Invalid listing ID. Please check the link or try another book.');
      }
      const listingData = await getListingById(listingId);
      if (!listingData) {
        throw new Error('Book not found or not approved for display.');
      }
      const validPaymentMethods = listingData.acceptedPaymentMethods?.filter(method => method.isEnabled) || [];
      setListing({
        ...listingData,
        acceptedPaymentMethods: validPaymentMethods
      });

      // Lấy điểm trung bình
      try {
        const avgRating = await getSellerAverageRating(listingData.ownerId);
        const ratingValue = typeof avgRating === 'number' && !isNaN(avgRating) ? avgRating : 0;
        console.log('Average rating for seller:', { sellerId: listingData.ownerId, avgRating, ratingValue });
        setAverageRating(ratingValue);
      } catch (err) {
        console.log('No average rating found:', err.message);
        setAverageRating(0);
      }

      // Lấy danh sách đánh giá
      try {
        const reviewData = await getReviewsBySeller(listingData.ownerId, currentPage, 5);
        setReviews(reviewData.items || []);
        setTotalPages(reviewData.totalPages || 1);
      } catch (err) {
        console.log('No reviews found:', err.message);
        setReviews([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load book details');
      toast.error(err.message || 'Failed to load book details');
      if (err.message.includes('Unauthorized') || err.message.includes('No authentication token')) {
        toast.info('Your session has expired. Please log in again.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info('Please log in to view book details');
      navigate('/login');
      return;
    }
    fetchListingDetails();
  }, [listingId, isLoggedIn, navigate, currentPage]);

  const handleBuyNow = () => {
    console.log('Handle Buy Now:', { listingId: listing.listingId, statusName: listing.statusName });
    if (!isLoggedIn) {
      toast.info('Please log in to purchase');
      navigate('/login');
      return;
    }
    if (listing.statusName !== 'Active') {
      toast.error(`This book cannot be purchased because ${listing.statusName ? `its status is ${listing.statusName}` : 'status information is missing. Please contact admin.'}`);
      return;
    }
    if (!listing.acceptedPaymentMethods || listing.acceptedPaymentMethods.length === 0) {
      toast.error('No payment methods are available for this book.');
      return;
    }
    navigate('/order', { state: { listing } });
  };

  const handleViewProfile = () => {
    navigate(`/seller/${listing.ownerId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">{error || 'Book not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Book Image */}
          <div className="lg:w-1/3 p-6 flex justify-center">
            <img
              src={listing.imageUrl || 'https://via.placeholder.com/300'}
              alt={listing.title}
              className="w-full max-w-md h-96 object-cover rounded-xl shadow-md transition-transform transform hover:scale-105"
            />
          </div>

          {/* Book Details */}
          <div className="lg:w-2/3 p-6 lg:p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-5xl font-extrabold text-gray-900 mb-4">{listing.title}</h1>
              <p className="text-4xl font-bold text-blue-600 mb-4">
                {listing.price !== null ? `$${parseFloat(listing.price).toFixed(2)}` : 'Price not available'}
              </p>
              <p className="text-lg text-gray-600 mb-2">
                <span className="font-semibold">Author:</span> {listing.author || 'Unknown Author'}
              </p>
              <p className="text-md text-gray-600 mb-2">
                <span className="font-semibold">Category:</span> {listing.categoryName || 'Uncategorized'}
              </p>
              <div className="flex items-center text-md text-gray-600 mb-2">
                <span className="font-semibold">Seller:</span>
                <span className="ml-1">{listing.ownerName || 'Anonymous'}</span>
                {typeof averageRating === 'number' && !isNaN(averageRating) && averageRating > 0 && (
                  <span className="ml-2 flex items-center">
                    <StarRating rating={averageRating} />
                    <span className="ml-1 text-sm">({averageRating.toFixed(1)})</span>
                  </span>
                )}
              </div>
              <p className="text-md text-gray-600 mb-2">
                <span className="font-semibold">Type:</span> {listing.listingType === 0 ? 'For Sale' : 'For Exchange'}
              </p>
              {listing.listingType === 1 && listing.desiredDocumentIds && listing.desiredDocumentIds.length > 0 && (
                <p className="text-md text-gray-600 mb-2">
                  <span className="font-semibold">Desired Book IDs:</span> {listing.desiredDocumentIds.join(', ')}
                </p>
              )}
              {listing.acceptedPaymentMethods && listing.acceptedPaymentMethods.length > 0 && (
                <p className="text-md text-gray-600 mb-4">
                  <span className="font-semibold">Payment Methods:</span>{' '}
                  {listing.acceptedPaymentMethods.map(method => method.name).join(', ')}
                </p>
              )}
              <p className="text-gray-700 leading-relaxed mb-6">
                {listing.description || 'No description available.'}
              </p>
              <p className="text-md text-gray-600">
                <span className="font-semibold">Status:</span> {listing.statusName}
              </p>
              {listing.statusName !== 'Active' && (
                <p className="text-sm text-red-600 mt-2">
                  This book cannot be purchased as it is not approved.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleBuyNow}
                className={`w-full sm:w-auto px-8 py-3 rounded-lg text-white font-semibold transition-transform transform hover:scale-105 ${
                  listing.statusName !== 'Active' || hasOrdered
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                disabled={listing.statusName !== 'Active' || hasOrdered}
              >
                {hasOrdered ? 'Ordered' : 'Buy Now'}
              </button>
              <button
                onClick={handleViewProfile}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="p-6 lg:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Reviews For Seller</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet for this seller.</p>
          ) : (
            <>
              <ReviewList reviews={reviews} onViewReview={handleViewReview} isOwner={false} />
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
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BookDetailsPage;