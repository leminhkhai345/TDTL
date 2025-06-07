import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import StarRating from './StarRating';

const ReviewList = ({ reviews, onViewReview, onEditReview, onDeleteReview, isOwner }) => {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.reviewId} className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} />
            <span className="text-sm text-gray-600">
              {new Date(review.reviewDate).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 mb-2">{review.comment}</p>
          <p className="text-sm text-gray-600">
            <strong>Type:</strong> {review.reviewType === 'Constructive' ? 'Positive Feedback' : 'Report Violation'}
          </p>
          {review.evidences?.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600"><strong>Evidence:</strong></p>
              <div className="flex gap-2 flex-wrap">
                {review.evidences.map((evidence, index) => (
                  <div key={index}>
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
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onViewReview(review)}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              View Details
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => onEditReview(review)}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteReview(review.reviewId)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;