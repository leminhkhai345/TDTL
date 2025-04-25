using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.DataAccessLayer.Interfaces
{
    public interface IDocumentRepository
    {
        public void SaveChanges();
        public Document GetDocumentById(int id);
        public List<Review> GetAllReviewByDocunentId(int DocumentId);
        public List<Review> GetAllReviewByUserId(int UserId);
        public void AddReview(Review review);
        public Review GetReviewById(int reviewId);

        public void RemoveReview(Review review);
    }
}
