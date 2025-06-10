import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import StarRating from './StarRating';
import { useNavigate } from 'react-router-dom';

const ReviewList = ({ reviews, onViewReview, onEditReview, onDeleteReview, isOwner, user }) => {
  const navigate = useNavigate();

  const handleReviewClick = (review) => {
      console.log('user', user, 'review', review);
    // Nếu user là chủ listing hoặc là reviewer thì đều được click để xem chi tiết đơn hàng
    if (
      (user && review.reviewerId && String(review.reviewerId) === String(user.id)) ||
      (user && review.reviewedSellerId && String(review.reviewedSellerId) === String(user.id))
    ) {
      navigate(`/orders/${review.orderId}`);
    }
    // Nếu muốn, có thể gọi onViewReview ở đây cho các trường hợp khác
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div 
          key={review.reviewId} 
          className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleReviewClick(review)}
        >
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} />
            <span className="text-sm text-gray-600">
              {new Date(review.reviewDate).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 mb-2">{review.comment}</p>
          <p className="text-sm text-gray-600">
            <strong>Reviewer:</strong> {review.reviewerName || 'Anonymous'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Type:</strong> {review.reviewType === 'Constructive' ? 'Positive Feedback' : 'Report Violation'}
          </p>
          {review.evidences?.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600"><strong>Evidence:</strong></p>
              <div className="flex gap-2 flex-wrap">
                {review.evidences.map((evidence, index) => (
                  <div key={index} onClick={(e) => e.stopPropagation()}>
                    {evidence.fileType.includes('video') ? (
                      <video src={evidence.fileUrl} className="w-20 h-20 object-cover rounded" controls />
                    ) : (
                      <img src={evidence.fileUrl} alt="Evidence" className="w-20 h-20 object-cover rounded" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {review.documentTitle || review.bookTitle || review.title ? (
            <span className="text-sm text-gray-700 font-semibold">
              {`Sách: ${review.documentTitle || review.bookTitle || review.title}`}
            </span>
          ) : null}
          {isOwner && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditReview(review);
                }}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteReview(review.reviewId);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
