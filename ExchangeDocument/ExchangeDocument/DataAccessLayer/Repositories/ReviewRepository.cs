using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly ExchangeDocumentContext _context;

    public ReviewRepository(ExchangeDocumentContext context)
    {
        _context = context;
    }

    public async Task<Review> AddAsync(Review review)
    {
        var entry = await _context.Reviews.AddAsync(review);
        return entry.Entity;
    }

    public async Task<Review> UpdateAsync(Review review)
    {
        _context.Reviews.Update(review);
        return review;
    }

    public async Task DeleteAsync(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review != null)
        {
            review.IsDeleted = true;
        }
    }

    public async Task<Review?> GetByIdAsync(int id)
    {
        return await _context.Reviews
            .Include(r => r.Order)
                .ThenInclude(o => o.Seller)
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderDetails)
                    .ThenInclude(od => od.Document)
            .Include(r => r.Reviewer)
            .FirstOrDefaultAsync(r => r.ReviewId == id && !r.IsDeleted);
    }

    public async Task<Review?> GetByOrderIdAsync(int orderId)
    {
        return await _context.Reviews
            .Include(r => r.Order)
            .Include(r => r.Reviewer)
            .FirstOrDefaultAsync(r => r.OrderId == orderId && !r.IsDeleted);
    }

    public async Task<IEnumerable<Review>> GetByReviewerIdAsync(int reviewerId, int page, int size)
    {
        return await _context.Reviews
            .Include(r => r.Order)
            .Where(r => r.ReviewerId == reviewerId && !r.IsDeleted)
            .OrderByDescending(r => r.ReviewDate)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetReviewsByReviewedSellerIdAsync(int sellerId, int page, int size)
    {
        return await _context.Reviews
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderDetails)
            .Include(r => r.Reviewer)
            .Where(r => r.Order.SellerId == sellerId && !r.IsDeleted)
            .OrderByDescending(r => r.ReviewDate)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();
    }

    // Evidence helpers
    public async Task AddReviewEvidenceRangeAsync(IEnumerable<ReviewEvidence> evidences)
    {
        await _context.ReviewEvidences.AddRangeAsync(evidences);
    }

    public async Task<IEnumerable<ReviewEvidence>> GetEvidencesByReviewIdAsync(int reviewId)
    {
        return await _context.ReviewEvidences.Where(e => e.ReviewId == reviewId && !e.IsDeleted).ToListAsync();
    }

    public async Task RemoveReviewEvidencesAsync(IEnumerable<ReviewEvidence> evidences)
    {
        foreach (var ev in evidences)
        {
            ev.IsDeleted = true;
        }
    }
}
