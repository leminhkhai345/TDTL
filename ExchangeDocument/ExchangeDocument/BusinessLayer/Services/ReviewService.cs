using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.Common.Exceptions;
using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Serilog;
using ILogger = Serilog.ILogger;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace ExchangeDocument.BusinessLayer.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _repo;
    private readonly IOrderRepository _orderRepo;
    private readonly IDocumentRepository _docRepo;
    private readonly IUserRepository _userRepo;
    private readonly ExchangeDocumentContext _ctx;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger _logger = Log.ForContext<ReviewService>();

    public ReviewService(IReviewRepository repo,
                         IOrderRepository orderRepo,
                         IDocumentRepository docRepo,
                         IUserRepository userRepo,
                         IFileStorageService fileStorage,
                         ExchangeDocumentContext ctx)
    {
        _repo = repo;
        _orderRepo = orderRepo;
        _docRepo = docRepo;
        _userRepo = userRepo;
        _fileStorage = fileStorage;
        _ctx = ctx;
    }

    #region Create
    public async Task<ReviewDto> CreateReviewAsync(int buyerUserId, CreateReviewDto dto)
    {
        var order = await _orderRepo.GetByIdWithDetailsAsync(dto.OrderId) ?? throw new NotFoundException("Order not found");
        if (order.BuyerId != buyerUserId)
            throw new ValidationException("Bạn không thể đánh giá đơn hàng của người khác");
        if (order.Review != null)
            throw new ValidationException("Đơn hàng đã được đánh giá");

        var review = new Review
        {
            OrderId = order.OrderId,
            ReviewerId = buyerUserId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            ReviewType = dto.ReviewType
        };

        await using var tx = await _ctx.Database.BeginTransactionAsync();
        try
        {
            await _repo.AddAsync(review);

            // Xử lý upload evidence
            var evidenceEntities = new List<ReviewEvidence>();
            if (dto.EvidenceFiles != null && dto.EvidenceFiles.Any())
            {
                foreach (var file in dto.EvidenceFiles)
                {
                    var url = await _fileStorage.SaveFileAsync(file, $"reviews/{order.OrderId}");
                    evidenceEntities.Add(new ReviewEvidence
                    {
                        FileUrl = url,
                        FileType = file.ContentType,
                        Review = review
                    });
                }
                await _repo.AddReviewEvidenceRangeAsync(evidenceEntities);
            }

            await _ctx.SaveChangesAsync();
            await tx.CommitAsync();
            return await MapToDto(review.ReviewId);
        }
        catch (DbUpdateConcurrencyException)
        {
            await tx.RollbackAsync();
            throw new ValidationException("Xung đột dữ liệu, vui lòng thử lại");
        }
    }
    #endregion

    public async Task<ReviewDto?> GetReviewByOrderIdAsync(int orderId)
    {
        var review = await _repo.GetByOrderIdAsync(orderId);
        return review == null ? null : await MapToDto(review.ReviewId);
    }

    public Task<ReviewDto?> GetByIdAsync(int reviewId) => MapToDto(reviewId);

    #region Update
    public async Task<ReviewDto> UpdateReviewAsync(int reviewId, int buyerUserId, UpdateReviewDto dto)
    {
        var review = await _ctx.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId && !r.IsDeleted) ?? throw new NotFoundException("Review not found");
        if (review.ReviewerId != buyerUserId)
            throw new ValidationException("Bạn không thể sửa review của người khác");
        if (!review.RowVersion.SequenceEqual(dto.RowVersion))
            throw new ValidationException("Review đã được chỉnh sửa, vui lòng tải lại");

        review.Rating = dto.Rating;
        review.Comment = dto.Comment;
        review.ReviewType = dto.ReviewType;
        review.IsEdited = true;
        review.LastEditedDate = DateTime.UtcNow;
        await _repo.UpdateAsync(review);

        // Handle evidence updates
        if (dto.EvidenceIdsToDelete?.Any() == true)
        {
            var toDelete = await _repo.GetEvidencesByReviewIdAsync(reviewId);
            var deleteList = toDelete.Where(e => dto.EvidenceIdsToDelete.Contains(e.ReviewEvidenceId)).ToList();
            await _repo.RemoveReviewEvidencesAsync(deleteList);
            foreach (var ev in deleteList)
                await _fileStorage.DeleteFileAsync(ev.FileUrl);
        }

        if (dto.NewEvidenceFiles?.Any() == true)
        {
            var newEvs = new List<ReviewEvidence>();
            foreach (var file in dto.NewEvidenceFiles)
            {
                var url = await _fileStorage.SaveFileAsync(file, $"reviews/{review.OrderId}");
                newEvs.Add(new ReviewEvidence
                {
                    ReviewId = reviewId,
                    FileUrl = url,
                    FileType = file.ContentType
                });
            }
            await _repo.AddReviewEvidenceRangeAsync(newEvs);
        }

        await _ctx.SaveChangesAsync();
        return await MapToDto(review.ReviewId);
    }
    #endregion

    #region Delete
    public async Task<bool> DeleteReviewAsync(int reviewId, int buyerUserId, byte[] rowVersion)
    {
        var review = await _ctx.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId && !r.IsDeleted) ?? throw new NotFoundException("Review not found");
        if (review.ReviewerId != buyerUserId)
            throw new ValidationException("Bạn không thể xoá review của người khác");
        if (!review.RowVersion.SequenceEqual(rowVersion))
            throw new ValidationException("Review đã được chỉnh sửa, vui lòng tải lại");
        review.IsDeleted = true;

        var evidences = await _repo.GetEvidencesByReviewIdAsync(reviewId);
        foreach (var ev in evidences)
        {
            ev.IsDeleted = true;
            await _fileStorage.DeleteFileAsync(ev.FileUrl);
        }

        await _ctx.SaveChangesAsync();
        return true;
    }
    #endregion

    #region Query
    public async Task<IEnumerable<ReviewDto>> GetReviewsByReviewerAsync(int reviewerId, int page, int size)
        => await Query(r => r.ReviewerId == reviewerId, page, size);

    public async Task<IEnumerable<ReviewDto>> GetReviewsReceivedBySellerAsync(int sellerId, int page, int size)
        => await Query(r => r.Order.SellerId == sellerId, page, size);

    public async Task<double?> GetAverageRatingForSellerAsync(int sellerId)
    {
        var ratings = await _ctx.Reviews.Where(r => r.Order.SellerId == sellerId && !r.IsDeleted).Select(r => r.Rating).ToListAsync();
        return ratings.Any() ? ratings.Average() : null;
    }

    private async Task<IEnumerable<ReviewDto>> Query(System.Linq.Expressions.Expression<Func<Review, bool>> predicate, int page, int size)
    {
        var reviews = await _ctx.Reviews.Include(r => r.Order).Where(predicate).Where(r => !r.IsDeleted).OrderByDescending(r => r.ReviewDate).Skip((page - 1) * size).Take(size).ToListAsync();
        var list = new List<ReviewDto>();
        foreach (var r in reviews)
            list.Add(await MapToDto(r.ReviewId));
        return list;
    }
    #endregion

    private async Task<ReviewDto> MapToDto(int reviewId)
    {
        var review = await _ctx.Reviews
            .Include(r => r.Order)
                .ThenInclude(o => o.Seller)
            .Include(r => r.Order)
                .ThenInclude(o => o.OrderDetails)
                    .ThenInclude(od => od.Document)
            .Include(r => r.Reviewer)
            .Include(r => r.Evidences)
            .FirstAsync(r => r.ReviewId == reviewId);
        return new ReviewDto
        {
            ReviewId = review.ReviewId,
            OrderId = review.OrderId,
            ReviewerId = review.ReviewerId,
            ReviewerName = review.Reviewer.FullName,
            ReviewedSellerId = review.Order.SellerId,
            ReviewedSellerName = review.Order.Seller.FullName,
            DocumentTitle = review.Order.OrderDetails.First().Document.Title,
            Rating = review.Rating,
            Comment = review.Comment,
            ReviewType = review.ReviewType,
            Evidences = review.Evidences.Select(e => new ReviewEvidenceDto { Id = e.ReviewEvidenceId, FileUrl = e.FileUrl, FileType = e.FileType, UploadedDate = e.UploadedDate }).ToList(),
            ReviewDate = review.ReviewDate,
            RowVersion = review.RowVersion
        };
    }
}
