using System.Security.Claims;
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
            var userId = Convert.ToInt32(HttpContext.User.FindFirstValue("UserId"));
            ReviewResponse rs = idocService.createReview(request, userId);
            return Ok(new { rs });
        }

        [HttpDelete]
        [Route("delete/{reviewId}")]
        public IActionResult DeleteReview(int reviewId)
        {
            var userId = Convert.ToInt32(HttpContext.User.FindFirstValue("UserId"));
            idocService.DeleteReview(reviewId, userId);
            return Ok("Đã xoá review");
        }

        [HttpPut]
        [Route("update/{reviewId}")]
        public IActionResult UpdateReview(int reviewId, string content)
        {
            var userId = Convert.ToInt32(HttpContext.User.FindFirstValue("UserId"));
            var rv = idocService.UpdateReview(reviewId, content, userId);
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
