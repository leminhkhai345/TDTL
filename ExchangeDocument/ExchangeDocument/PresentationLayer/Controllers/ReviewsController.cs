using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ExchangeDocument.PresentationLayer.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;
    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    // ---------------- Buyer actions ----------------
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> Create([FromForm] CreateReviewDto dto)
    {
        var buyerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var created = await _reviewService.CreateReviewAsync(buyerId, dto);
        return CreatedAtAction(nameof(GetById), new { id = created.ReviewId }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ReviewDto>> Update(int id, [FromForm] UpdateReviewDto dto)
    {
        var buyerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var updated = await _reviewService.UpdateReviewAsync(id, buyerId, dto);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, [FromBody] DeleteReviewDto dto)
    {
        var buyerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _reviewService.DeleteReviewAsync(id, buyerId, dto.RowVersion);
        return NoContent();
    }

    // ---------------- Query ----------------
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<ReviewDto?>> GetById(int id)
    {
        var review = await _reviewService.GetByIdAsync(id); 
        if (review == null) return NotFound();
        return Ok(review);
    }

    [AllowAnonymous]
    [HttpGet("seller/{sellerId}")]
    public async Task<IEnumerable<ReviewDto>> GetBySeller(int sellerId, int page = 1, int size = 10)
        => await _reviewService.GetReviewsReceivedBySellerAsync(sellerId, page, size);

    [AllowAnonymous]
    [HttpGet("reviewer/{reviewerId}")]
    public async Task<IEnumerable<ReviewDto>> GetByReviewer(int reviewerId, int page = 1, int size = 10)
        => await _reviewService.GetReviewsByReviewerAsync(reviewerId, page, size);

    [AllowAnonymous]
    [HttpGet("seller/{sellerId}/avg-rating")]
    public async Task<double?> GetSellerAverage(int sellerId)
        => await _reviewService.GetAverageRatingForSellerAsync(sellerId);
}
