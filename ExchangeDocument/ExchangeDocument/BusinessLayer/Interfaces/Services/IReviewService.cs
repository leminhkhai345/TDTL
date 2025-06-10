using ExchangeDocument.BusinessLayer.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services;

public interface IReviewService
{
    Task<ReviewDto> CreateReviewAsync(int buyerUserId, CreateReviewDto dto);
    Task<ReviewDto> UpdateReviewAsync(int reviewId, int buyerUserId, UpdateReviewDto dto);
    Task<bool> DeleteReviewAsync(int reviewId, int buyerUserId, byte[] rowVersion);

    Task<ReviewDto?> GetByIdAsync(int reviewId);
    Task<ReviewDto?> GetReviewByOrderIdAsync(int orderId);

    Task<IEnumerable<ReviewDto>> GetReviewsByReviewerAsync(int reviewerId, int page, int size);
    Task<IEnumerable<ReviewDto>> GetReviewsReceivedBySellerAsync(int sellerId, int page, int size);

    Task<double?> GetAverageRatingForSellerAsync(int sellerId);
}
