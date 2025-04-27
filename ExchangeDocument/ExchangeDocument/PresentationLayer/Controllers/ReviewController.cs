using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [Route("api/review")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IDocumentService idocService;
        public ReviewController(IDocumentService _idocService)
        {
            idocService = _idocService;
        }

        [HttpGet]
        [Route("all/{documentId}")]
        public IActionResult GetAllReviewByDocumentId(int documentId)
        {
            List<Review> reviews = idocService.GetAllReviewByDocumentId(documentId);
            return Ok(new { reviews });
        }

        [HttpPost]
        [Route("")]
        public IActionResult CreateNewReview([FromBody] CreateReviewRequest request)
        {
            ReviewResponse rs = idocService.createReview(request);
            return Ok(new { rs });
        }

        [HttpDelete]
        [Route("delete/{reviewId}")]
        public IActionResult DeleteReview(int reviewId)
        {
            idocService.DeleteReview(reviewId);
            return Ok("Đã xoá review");
        }

        [HttpPut]
        [Route("update/{reviewId}")]
        public IActionResult UpdateReview(int reviewId, string content)
        {
            var rv = idocService.UpdateReview(reviewId, content);
            return Ok(new { rv });
        }

        [HttpGet]
        [Route("all/{UserId}")]
        public IActionResult GetAllReviewByUserId(int UserId)
        {
            var rs = idocService.GetAllReviewByUserId(UserId);
            return Ok(new { rs });
        }
    }
}
