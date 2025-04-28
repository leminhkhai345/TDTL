using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces;

namespace ExchangeDocument.BusinessLayer.Interfaces
{
    public interface IDocumentService
    {
        public List<Review> GetAllReviewByDocumentId(int documentId);
        public List<Review> GetAllReviewByUserId(int UserId);
        public ReviewResponse createReview(CreateReviewRequest request, int userId);
        public void DeleteReview(int reviewId, int userId);
        public ReviewResponse UpdateReview(int reviewId, string content, int userId);


    }
}
