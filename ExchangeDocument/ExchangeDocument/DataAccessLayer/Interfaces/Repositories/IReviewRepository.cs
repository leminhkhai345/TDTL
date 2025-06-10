using ExchangeDocument.DataAccessLayer.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories;

public interface IReviewRepository
{
    Task<Review> AddAsync(Review review);
    Task<Review> UpdateAsync(Review review);
    Task DeleteAsync(int id);

    Task<Review?> GetByIdAsync(int id);
    Task<Review?> GetByOrderIdAsync(int orderId);

    Task<IEnumerable<Review>> GetByReviewerIdAsync(int reviewerId, int page, int size);
    Task<IEnumerable<Review>> GetReviewsByReviewedSellerIdAsync(int sellerId, int page, int size);

    Task AddReviewEvidenceRangeAsync(IEnumerable<ReviewEvidence> evidences);
    Task<IEnumerable<ReviewEvidence>> GetEvidencesByReviewIdAsync(int reviewId);
    Task RemoveReviewEvidencesAsync(IEnumerable<ReviewEvidence> evidences);
}
