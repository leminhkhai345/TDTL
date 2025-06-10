import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from './StarRating';

const ReviewDetailModal = ({ review, isOpen, onClose }) => {
  if (!isOpen || !review) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        style={{ backdropFilter: 'blur(6px)' }}
      >
        <motion.div
          key="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            aria-label="Close review detail modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <h2 id="review-detail-modal-title" className="text-xl font-bold mb-4 text-blue-700">Review Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} />
              <span className="text-sm text-gray-600">
                {new Date(review.reviewDate).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
            <p className="text-sm text-gray-600">
              <strong>Type:</strong> {review.reviewType === 'Constructive' ? 'Positive Feedback' : 'Report Violation'}
            </p>
            {review.evidences?.length > 0 && (
              <div>
                <p className="text-sm text-gray-600"><strong>Evidence:</strong></p>
                <div className="flex gap-2 flex-wrap">
                  {review.evidences.map((evidence, index) => (
                    <div key={index}>
                      {evidence.fileType.includes('video') ? (
                        <video src={evidence.fileUrl} className="w-32 h-32 object-cover rounded" controls />
                      ) : (
                        <img src={evidence.fileUrl} alt="Evidence" className="w-32 h-32 object-cover rounded" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600">
              <strong>By:</strong> {review.reviewerName || 'Anonymous'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Order ID:</strong> #{review.orderId}
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewDetailModal;