// src/Components/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faStar } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { createReview, updateReview, getReviewsBySeller } from '../src/API/api';
import { useAuth } from '../src/contexts/AuthContext';

const ReviewForm = ({ isOpen, onClose, order, review, onSubmitSuccess, listingData }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || '');
  const [reviewType, setReviewType] = useState(review?.reviewType || 'Constructive');
  const [evidences, setEvidences] = useState([]);
  const [previews, setPreviews] = useState(review?.evidences?.map(e => e.fileUrl) || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
      setReviewType(review.reviewType);
      setPreviews(review.evidences?.map(e => e.fileUrl) || []);
    }
  }, [review]);

  // Chỉ fetch reviews khi có listingData
  useEffect(() => {
    if (listingData?.ownerId) {
      const fetchReviews = async () => {
        try {
          const reviewData = await getReviewsBySeller(listingData.ownerId, currentPage, 5);
          const reviewsArr = Array.isArray(reviewData) ? reviewData : (reviewData.items || []);
          setReviews(reviewsArr);
          setTotalPages(reviewData.totalPages || 1);
        } catch (err) {
          console.log('Failed to fetch reviews:', err.message); 
          setReviews([]);
        }
      };
      fetchReviews();
    }
  }, [listingData?.ownerId, currentPage]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'video/mp4'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isValidType) toast.error(`${file.name} is not a valid image or video file`);
      if (!isValidSize) toast.error(`${file.name} exceeds 10MB size limit`);
      return isValidType && isValidSize;
    });

    setEvidences([...evidences, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeEvidence = (index) => {
    setEvidences(evidences.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter your review comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (review) {
        // Update existing review
        response = await updateReview(review.reviewId, {
          rating,
          comment,
          reviewType,
          evidences,
          rowVersion: review.rowVersion
        });
      } else {
        try {
          // Create new review
          response = await createReview({
            orderId: order.orderId,
            rating,
            comment,
            reviewType,
            evidences
          });
        } catch (error) {
          if (error.response?.status === 500 && 
              (error.response?.data?.detail?.includes('duplicate key') ||
               error.response?.data?.detail?.includes('IX_reviews_orderId'))) {
            toast.error('This order has already been reviewed');
            setIsSubmitting(false);
            return;
          }
          throw error;
        }
      }
      onSubmitSuccess(response);
    } catch (error) {
      console.error('Review submission error:', error);
      if (error.response?.status === 500 && 
          (error.response?.data?.detail?.includes('duplicate key') ||
           error.response?.data?.detail?.includes('IX_reviews_orderId'))) {
        toast.error('This order has already been reviewed');
      } else if (error.response?.data?.detail?.includes('Rating must be between 1 and 5')) {
        toast.error('Please select a rating between 1 and 5 stars');
      } else {
        toast.error(error.message || 'Failed to submit review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-white/30 backdrop-blur-[6px] flex items-center justify-center z-50" 
      role="dialog" 
      aria-labelledby="review-modal-title"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="Close review modal"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 id="review-modal-title" className="text-2xl font-bold mb-6 text-blue-700">
          {review ? 'Edit Review' : 'Write a Review'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                  key={star}
                  icon={faStar}
                  className={`cursor-pointer text-2xl transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                />
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              rows="4"
              placeholder="Write your review here..."
              maxLength={500}
              aria-required="true"
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Review Type</label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Constructive"
                  checked={reviewType === 'Constructive'}
                  onChange={() => setReviewType('Constructive')}
                  className="mr-2"
                />
                Constructive Feedback
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ReportViolation"
                  checked={reviewType === 'ReportViolation'}
                  onChange={() => setReviewType('ReportViolation')}
                  className="mr-2"
                />
                Report Violation
              </label>
            </div>
          </div>
          {reviewType === 'ReportViolation' && (
            <div className="mb-6">
              <label htmlFor="evidences" className="block text-sm font-medium text-gray-700">Upload Evidence</label>
              <input
                id="evidences"
                type="file"
                accept="image/jpeg,image/png,video/mp4"
                multiple
                onChange={handleFileChange}
                className="w-full p-4 mt-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-wrap gap-3 mt-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    {preview.endsWith('.mp4') ? (
                      <video src={preview} className="w-24 h-24 object-cover rounded-lg" controls />
                    ) : (
                      <img src={preview} alt="Evidence preview" className="w-24 h-24 object-cover rounded-lg" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeEvidence(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      aria-label="Remove evidence"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting}
              aria-label={review ? 'Update review' : 'Submit review'}
            >
              {isSubmitting ? 'Processing...' : review ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;