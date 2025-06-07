// src/Components/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faStar } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { createReview, updateReview } from '../src/API/api';

const ReviewForm = ({ isOpen, onClose, order, review, onSubmitSuccess }) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || '');
  const [reviewType, setReviewType] = useState(review?.reviewType || 'Constructive');
  const [evidences, setEvidences] = useState([]);
  const [previews, setPreviews] = useState(review?.evidences?.map(e => e.fileUrl) || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
      setReviewType(review.reviewType);
      setPreviews(review.evidences?.map(e => e.fileUrl) || []);
    }
  }, [review]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'video/mp4'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isValidType) toast.error(`${file.name} không phải ảnh hoặc video hợp lệ`);
      if (!isValidSize) toast.error(`${file.name} vượt quá 10MB`);
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
    if (!rating) return toast.error('Vui lòng chọn điểm số');
    if (!comment.trim()) return toast.error('Vui lòng nhập bình luận');
    if (comment.length > 500) return toast.error('Bình luận không được vượt quá 500 ký tự');
    if (reviewType === 'ReportViolation' && evidences.length === 0) {
      return toast.error('Vui lòng tải lên bằng chứng cho báo cáo vi phạm');
    }

    setIsSubmitting(true);
    try {
      const reviewData = { orderId: order.orderId, rating, comment, reviewType, evidences };
      let response;
      if (review) {
        response = await updateReview(review.reviewId, reviewData);
      } else {
        response = await createReview(reviewData);
      }
      toast.success(review ? 'Đánh giá đã được cập nhật!' : 'Đánh giá đã được gửi!');
      onSubmitSuccess(response);
      onClose();
    } catch (error) {
      console.error('Submit review error:', error);
      toast.error(error.message || 'Không thể gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="review-modal-title">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          aria-label="Đóng modal đánh giá"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 id="review-modal-title" className="text-xl font-bold mb-4 text-blue-700">
          {review ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Điểm số</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                  key={star}
                  icon={faStar}
                  className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setRating(star)}
                  aria-label={`Chọn ${star} sao`}
                />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-600">Bình luận</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none"
              rows="4"
              placeholder="Nhập bình luận của bạn..."
              maxLength={500}
              aria-required="true"
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/500 ký tự</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Loại đánh giá</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Constructive"
                  checked={reviewType === 'Constructive'}
                  onChange={() => setReviewType('Constructive')}
                  className="mr-2"
                />
                Phản hồi tích cực
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ReportViolation"
                  checked={reviewType === 'ReportViolation'}
                  onChange={() => setReviewType('ReportViolation')}
                  className="mr-2"
                />
                Báo cáo vi phạm
              </label>
            </div>
          </div>
          {reviewType === 'ReportViolation' && (
            <div className="mb-4">
              <label htmlFor="evidences" className="block text-sm font-medium text-gray-600">Tải lên bằng chứng</label>
              <input
                id="evidences"
                type="file"
                accept="image/jpeg,image/png,video/mp4"
                multiple
                onChange={handleFileChange}
                className="w-full p-2 border rounded-lg"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    {preview.endsWith('.mp4') ? (
                      <video src={preview} className="w-20 h-20 object-cover rounded" controls />
                    ) : (
                      <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeEvidence(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      aria-label="Xóa bằng chứng"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              aria-label="Hủy"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              aria-label={review ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
            >
              {isSubmitting ? 'Đang xử lý...' : review ? 'Cập nhật' : 'Gửi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;