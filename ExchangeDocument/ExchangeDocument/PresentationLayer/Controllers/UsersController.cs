using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.BusinessLayer.DTOs;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IListingService _listingService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService,
                               IListingService listingService,
                                ILogger<UsersController> logger)
        {
            _userService = userService;
            _listingService = listingService;
            _logger = logger;
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var subValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(subValue, out var userId))
            {
                _logger.LogWarning("GetMe called without valid NameIdentifier or sub claim");
                return Unauthorized();
            }

            var result = await _userService.GetProfileAsync(userId);
            if (!result.IsSuccess)
            {
                _logger.LogWarning("GetMe failed: {Message}", result.ErrorMessage);
                return NotFound(new { message = result.ErrorMessage });
            }

            return Ok(result.Value);
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequestDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var subValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(subValue, out var userId))
            {
                _logger.LogWarning("UpdateMe called without valid NameIdentifier or sub claim");
                return Unauthorized();
            }

            var result = await _userService.UpdateProfileAsync(userId, dto);
            if (!result.IsSuccess)
            {
                _logger.LogWarning("UpdateMe failed: {Message}", result.ErrorMessage);
                if (result.ErrorMessage == "User not found.")
                    return NotFound(new { message = result.ErrorMessage });
                return BadRequest(new { message = result.ErrorMessage });
            }

            return Ok(result.Value);
        }

        [HttpPut("me/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var subValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(subValue, out var userId))
            {
                _logger.LogWarning("ChangePassword called without valid NameIdentifier or sub claim");
                return Unauthorized();
            }

            var result = await _userService.ChangePasswordAsync(userId, dto);
            if (!result.IsSuccess)
            {
                _logger.LogWarning("ChangePassword failed: {Message}", result.ErrorMessage);
                if (result.ErrorMessage == "User not found.")
                    return NotFound(new { message = result.ErrorMessage });
                return BadRequest(new { message = result.ErrorMessage });
            }

            return Ok(new { message = "Password changed successfully" });
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1 || pageSize < 1 || pageSize > 50)
                return BadRequest(new { message = "Invalid paging parameters." });

            var subValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(subValue, out var adminId))
            {
                _logger.LogWarning("GetAll called without valid NameIdentifier or sub claim");
                return Unauthorized();
            }

            var result = await _userService.GetAllUsersAsync(pageNumber, pageSize);
            if (!result.IsSuccess)
                return StatusCode(500, new { message = result.ErrorMessage });

            return Ok(result.Value);
        }

        [HttpGet("{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById([FromRoute] int userId)
        {
            if (userId < 1)
                return BadRequest(new { message = "Invalid userId." });

            var subValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(subValue, out var adminId))
            {
                _logger.LogWarning("GetById called without valid NameIdentifier or sub claim");
                return Unauthorized();
            }

            var result = await _userService.GetProfileAsync(userId);
            if (!result.IsSuccess)
            {
                _logger.LogWarning("GetById failed: {Message}", result.ErrorMessage);
                return result.ErrorMessage == "User not found."
                    ? NotFound(new { message = result.ErrorMessage })
                    : StatusCode(500, new { message = result.ErrorMessage });
            }

            return Ok(result.Value);
        }

        [HttpPut("{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromRoute] int userId, [FromBody] AdminUpdateUserDTO dto)
        {
            if (userId < 1)
                return BadRequest(new { message = "Invalid userId." });
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var subValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(subValue, out var adminId))
            {
                _logger.LogWarning("Update called without valid NameIdentifier or sub claim");
                return Unauthorized();
            }

            var result = await _userService.UpdateUserAsync(userId, dto, adminId);
            if (!result.IsSuccess)
            {
                if (result.ErrorMessage == "User not found.")
                    return NotFound(new { message = result.ErrorMessage });
                if (result.ErrorMessage == "Role not found." ||
                    result.ErrorMessage == "Cannot update yourself.")
                    return BadRequest(new { message = result.ErrorMessage });
                return StatusCode(500, new { message = result.ErrorMessage });
            }

            return NoContent();
        }

        [HttpDelete("{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete([FromRoute] int userId)
        {
            if (userId < 1)
                return BadRequest(new { message = "Invalid userId." });

            var subValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(subValue, out var adminId))
            {
                _logger.LogWarning("Delete called without valid NameIdentifier or sub claim");
                return Unauthorized();
            }

            var result = await _userService.DeleteUserAsync(userId, adminId);
            if (!result.IsSuccess)
            {
                return result.ErrorMessage == "User not found."
                    ? NotFound(new { message = result.ErrorMessage })
                    : BadRequest(new { message = result.ErrorMessage });
            }

            return NoContent();
        }

        /// <summary>
        /// Retrieves current user's listings with pagination.
        /// </summary>
        [HttpGet("me/listings")]
        [Authorize]
        public async Task<IActionResult> GetMyListings(
            [FromQuery, Range(1, int.MaxValue)] int pageNumber = 1,
            [FromQuery, Range(1, 50)] int pageSize = 10)
        {
            if (pageNumber < 1)
                return BadRequest(new { message = "pageNumber must be >= 1." });
            if (pageSize < 1 || pageSize > 50)
                return BadRequest(new { message = "pageSize must be between 1 and 50." });

            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!int.TryParse(sub, out var userId))
                return Unauthorized();

            var result = await _listingService.GetMyListingsAsync(userId, pageNumber, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Public: Lấy hồ sơ công khai của một user (seller) để hiển thị trong trang chi tiết tin đăng.
        /// </summary>
        [HttpGet("{userId}/public-profile")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicProfile(int userId)
        {
            if (userId < 1)
                return BadRequest(new { message = "Invalid userId." });

            var result = await _userService.GetPublicProfileAsync(userId);
            if (!result.IsSuccess)
            {
                if (result.ErrorMessage == "User not found.")
                    return NotFound(new { message = result.ErrorMessage });
                return StatusCode(500, new { message = result.ErrorMessage });
            }

            return Ok(result.Value);
        }
    }
}
