using System.Security.Claims;
using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using ExchangeDocument.BusinessLayer.Services;
using ExchangeDocument.DataAccessLayer.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [Route("api")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService iuserService;
        private readonly JwtService jwtService;

        public UserController(IUserService _iuserService, JwtService _jwtService)
        {
            iuserService = _iuserService;
            jwtService = _jwtService;

        }

        [HttpPost]
        [Route("user/register")]
        public IActionResult Register([FromBody]RegisterDTO request)
        {
            bool check = iuserService.Register(request);
            if (check == true) return Ok("OTP sent to email");
            else return BadRequest("Fail register");
        }

        [HttpPost]
        [Route("user/verify")]
        public IActionResult Verify([FromBody]VerifyOtpRequest request)
        {
            String s = iuserService.VerifyOtp(request);
            if (s == "Đăng ký thành công.") return Ok(new { status = "success", message = "Verified successfully" });
            else return BadRequest(new { status = "failed", message = " Verification failed" });
        }
       
        [HttpPost]
        [Route("user/login")]
        public IActionResult Login([FromBody]LoginRequest request)
        {

            var user = iuserService.Login(request);
            if (user != null && user.RoleId == 1)
            {
                var token = jwtService.GenerateToken(user, "Admin");
                Response.Headers.Add("Authorization", $"Bearer {token}");
                return Ok(new { status = "success", message = "login successfully", data = user});
            }
            else if (user != null && user.RoleId == 2) 
            {
                var token = jwtService.GenerateToken(user, "User");
                Response.Headers.Add("Authorization", $"Bearer {token}");
                return Ok(new {status = "success", message = "login successfully", data = user});
            }
            else return Unauthorized(new { status = "success", message = "Wrong account or password" });
        }

        [HttpPost]
        [Route("userlogout")]
        public IActionResult Logout()
        {
            return Ok(new { status = "success", message = "Logout successful" });
        }

        [Authorize]
        [HttpPost]
        [Route("user/me/changepassword")]
        public IActionResult ChangPassword([FromBody]ChangePasswordRequest request)
        {
            var email = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = HttpContext.User.FindFirstValue("UserId");
            bool check = iuserService.ChangePassword(request, userId);
            if (check) return Ok(new { status = "success", message = "Password changed successfully!" });
            else return BadRequest(new { status = "error", message = "Password change failed!" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        [Route("admin/getallusers")]
        public IActionResult GetAllUser()
        {
            var users = iuserService.GetAllUser();
            return Ok(new { status = "success", data = users });
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete]
        [Route("admin/{userId}")]
        public IActionResult DeleteUser(string Email)
        {
            iuserService.DeleteUser(Email);
            return Ok(new {status = "success", message = "Deleted Successfully" });
        }

        [Authorize]
        [HttpGet]
        [Route("user/{userId}")]
        public IActionResult GetUser(int userId)
        {
            var user = iuserService.GetUserById(userId);
            if(user != null) return Ok(new { status = "success", data = user });
            return BadRequest(new { status = "success", message = "Not found!" });
        }
    }
}
