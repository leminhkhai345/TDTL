using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces;

namespace ExchangeDocument.BusinessLayer.Interfaces
{
    public interface IDocumentService
    {
        public List<Review> GetAllReviewByDocumentId(int documentId);
        public List<Review> GetAllReviewByUserId(int UserId);
        public ReviewResponse createReview(CreateReviewRequest request);
        public void DeleteReview(int reviewId);
        public ReviewResponse UpdateReview(int reviewId, string content);


    }
}
