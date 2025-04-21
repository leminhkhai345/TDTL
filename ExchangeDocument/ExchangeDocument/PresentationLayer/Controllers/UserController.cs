using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using ExchangeDocument.BusinessLayer.Services;
using ExchangeDocument.DataAccessLayer.ModelFromDB;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    public class UserController : Controller
    {
        private readonly IUserService iUserService;

        public UserController(IUserService _iUserService)
        {
            iUserService = _iUserService;
        }
        [HttpPost]
        [Route("api/register")]
        public async Task<IActionResult> Register([FromBody]RegisterDTO request)
        {
            if (request == null) return BadRequest("Request is null!!!!");
            bool check = iUserService.Register(request);
            if (check) return Ok("Đã gửi OTP về email.");
            else return BadRequest("Email đã được đăng ký");
        }

        [HttpPost]
        [Route("/api/verifyotp")]
        public async Task<IActionResult> VerifyOtp([FromBody]VerifyOtpRequest request)
        {
            string result = iUserService.VerifyOtp(request);
            if (result == "Đăng ký thành công.") return Ok(result);
            else return BadRequest(result);
        }

        [HttpPost]
        [Route("/api/Login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            bool check = iUserService.Login(request);
            if (check) return Ok("Đăng nhập thành công!");
            else return BadRequest("Đăng nhập thất bại");
        }
        [HttpPost]
        [Route("/api/logout")]
        public async Task<IActionResult> Logout()
        {
            iUserService.Logout();
            return Ok("Đăng xuất thành công");
        }

        [HttpPost]
        [Route("/api/changePassword")]
        public async Task<IActionResult> ChangePassword([FromBody]ChangePasswordRequest request)
        {
            bool check = iUserService.ChangePassword(request);
            if (check) return Ok("Đổi mật khẩu thành công");
            else return BadRequest("Đổi mật khẩu thất bại");
        }
        [HttpPost]
        [Route("/api/editprofile")]
        public async Task<IActionResult> EditProfile([FromBody]ProfileRequest request)
        {
            iUserService.EditProfile(request);
            return Ok("Đã cập nhật thông tin cá nhân!!");
        }
    }
}
