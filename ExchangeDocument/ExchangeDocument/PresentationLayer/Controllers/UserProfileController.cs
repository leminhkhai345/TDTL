using System.Security.Claims;
using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [Route("api/userprofile")]
    [ApiController]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserService iuserService;
        public UserProfileController(IUserService _iuserService)
        {
            iuserService = _iuserService;
        }
        [Authorize]
        [HttpGet]
        [Route("me")]
        public IActionResult GetProfile()
        {
            var loginId = Convert.ToInt32(HttpContext.User.FindFirstValue("UserId"));
            Userprofile profile = iuserService.GetProfile(loginId);
            return Ok(new { profile });
        }
        [Authorize]
        [HttpPut]
        [Route("me")]
        public IActionResult EditProfile(ProfileRequest request)
        {
            var loginId = Convert.ToInt32(HttpContext.User.FindFirstValue("UserId"));
            iuserService.EditProfile(request, loginId);
            return Ok("thay đổi thông tin thành công");
        }
        [Authorize]
        [HttpGet]
        [Route("me/{userId}")]
        public IActionResult GetUserProfile(int userId)
        {
            Userprofile profile = iuserService.GetProfile(userId);
            return Ok(new { profile });
        }
        [Authorize(Roles = "Admin")]
        [HttpGet]
        [Route("admin/all")]
        public IActionResult GetAllUserProfile()
        {
            var profiles = iuserService.GetAllUserProfile();
            return Ok(new { profiles });
        }
    }
}
