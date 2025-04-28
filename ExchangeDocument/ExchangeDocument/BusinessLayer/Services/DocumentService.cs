using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Repositories;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository idocReppo;
        private readonly IUserRepository iuserRepo;
        public DocumentService(IDocumentRepository _idocReppo, UserRepository _iuserRepo)
        {
            idocReppo = _idocReppo;
            iuserRepo = _iuserRepo;
        }

        public List<Review> GetAllReviewByDocumentId(int documentId)
        {
            List<Review> reviews = idocReppo.GetAllReviewByDocunentId(documentId);
            return reviews;
        }

        public ReviewResponse createReview(CreateReviewRequest request, int userId)
        {
            Review review = new Review
            {
                DocumentId = request.DocumentId,
                Content = request.content,
                ReviewDate = DateTime.Now,
                UserId = userId
            };
            idocReppo.AddReview(review);
            idocReppo.SaveChanges();
            ReviewResponse rs = new ReviewResponse
            {
                Content = review.Content,
                Name = iuserRepo.GetUserById(userId).Fullname,
                ReviewDate = review.ReviewDate
            };
            return rs;
        }

        public void DeleteReview(int reviewId, int userId)
        {
            Review rv = idocReppo.GetReviewById(reviewId);
            if(rv != null && rv.UserId == userId)
            {
                idocReppo.RemoveReview(rv);
                idocReppo.SaveChanges();
            }
        }
        
        public ReviewResponse UpdateReview(int reviewId, string content, int userId)
        {
            Review rv = idocReppo.GetReviewById(reviewId);
            if (rv != null)
            {
                rv.Content = content;
                rv.ReviewDate = DateTime.Now;
            }
            idocReppo.SaveChanges();
            ReviewResponse r = new ReviewResponse
            {
                Content = content,
                Name = iuserRepo.GetUserById(userId).Fullname,
                ReviewDate = rv.ReviewDate
            };
            return r;
        }

        public List<Review> GetAllReviewByUserId(int UserId)
        {
            var rs = idocReppo.GetAllReviewByUserId(UserId);
            return rs;
        }
    }
}
