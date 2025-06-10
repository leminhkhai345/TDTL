using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NotificationCreateDto dto)
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (!int.TryParse(sub, out var userId))
                return Unauthorized();

            var (result, error) = await _notificationService.CreateNotificationAsync(userId, dto);
            if (error != null)
                return BadRequest(new { message = error });

            return CreatedAtAction(nameof(Get), new { }, result);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (!int.TryParse(sub, out var userId))
                return Unauthorized();

            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }

        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery, Range(1, int.MaxValue)] int pageNumber = 1,
            [FromQuery, Range(1, 50)] int pageSize = 10,
            [FromQuery] bool onlyUnread = false)
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (!int.TryParse(sub, out var userId))
                return Unauthorized();

            var (items, total) = await _notificationService.GetNotificationsAsync(userId, pageNumber, pageSize, onlyUnread);
            return Ok(new { items, total });
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (!int.TryParse(sub, out var userId))
                return Unauthorized();

            var error = await _notificationService.MarkAsReadAsync(id, userId);
            if (error != null)
                return error switch
                {
                    "NotFound" => NotFound(),
                    "Forbidden" => Forbid(),
                    _ => BadRequest(new { message = error })
                };

            return NoContent();
        }

        [HttpPut("mark-all-as-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (!int.TryParse(sub, out var userId))
                return Unauthorized();

            await _notificationService.MarkAllAsReadAsync(userId);
            return NoContent();
        }
    }
}
