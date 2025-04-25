using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly exchangeDocument exDoc;
        public DocumentRepository(exchangeDocument _exDoc)
        {
            exDoc = _exDoc;
        }
        public Document GetDocumentById(int id)
        {
            Document doc = exDoc.Documents.FirstOrDefault(s => s.DocumentId == id);
            return doc;
        }

        public void AddDocument(Document doc)
        {
            exDoc.Documents.Add(doc);
        }
        public void SaveChanges()
        {
            exDoc.SaveChanges();
        }

        public List<Review> GetAllReviewByDocunentId(int DocumentId)
        {
            List<Review> reviews = exDoc.Reviews.Where(s => s.UserId == DocumentId).Select(s => s).ToList();
            return reviews;
        }

        public void AddReview(Review review)
        {
            exDoc.Reviews.Add(review);
        }

        public void RemoveReview(Review review)
        {
            exDoc.Reviews.Remove(review);
        }

        public Review GetReviewById(int reviewId)
        {
            Review rv = exDoc.Reviews.FirstOrDefault(s => s.ReviewId == reviewId);
            return rv;
        }

        public List<Review> GetAllReviewByUserId(int UserId)
        {
            List<Review> reviews = exDoc.Reviews.Where(s => s.UserId == UserId).Select(s => s).ToList();
            return reviews;
        }
    }
}
