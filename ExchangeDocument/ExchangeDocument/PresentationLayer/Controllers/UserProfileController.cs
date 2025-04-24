using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Entities;
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

        [HttpGet]
        [Route("me")]
        public IActionResult GetProfile()
        {
            Userprofile profile = iuserService.GetProfile();
            return Ok(new { profile });
        }

        [HttpPut]
        [Route("me")]
        public IActionResult EditProfile(ProfileRequest request)
        {
            iuserService.EditProfile(request);
            return Ok("thay đổi thông tin thành công");
        }

        [HttpGet]
        [Route("{userId}")]
        public IActionResult GetUserProfile(int userId)
        {
            Userprofile profile = iuserService.GetProfile(userId);
            return Ok(new { profile });
        }

        [HttpGet]
        [Route("admin/getallprofile")]
        public IActionResult GetAllUserProfile()
        {
            var profiles = iuserService.GetAllUserProfile();
            return Ok(new { profiles });
        }
    }
}
