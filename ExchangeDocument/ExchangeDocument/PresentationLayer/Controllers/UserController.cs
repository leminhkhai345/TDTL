using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService iuserService;
        public UserController(IUserService _iuserService)
        {
            iuserService = _iuserService;
        }

        [HttpPost]
        [Route("register")]
        public IActionResult Register([FromBody]RegisterDTO request)
        {
            bool check = iuserService.Register(request);
            if (check == true) return Ok("Đẵ đăng ký");
            else return BadRequest("Đăng ký thất bại!!!");
        }

        [HttpPost]
        [Route("verify")]
        public IActionResult Verify([FromBody]VerifyOtpRequest request)
        {
            String s = iuserService.VerifyOtp(request);
            if (s == "Đăng ký thành công.") return Ok("Đăng ký thành công");
            else return BadRequest("Đăng ký thất bại");
        }

        [HttpPost]
        [Route("login")]
        public IActionResult Login([FromBody]LoginRequest request)
        {
            bool check = iuserService.Login(request);
            if (check == true) return Ok("Đăng nhập thành công");
            else return BadRequest("Đăng nhập thất bại");
        }

        [HttpPost]
        [Route("logout")]
        public IActionResult Logout()
        {
            return Ok("Đăng xuất thành công");
        }

        [HttpPost]
        [Route("me/changepassword")]
        public IActionResult ChangPassword([FromBody]ChangePasswordRequest request)
        {
            bool check = iuserService.ChangePassword(request);
            if (check == true) return Ok("Đổi mật khẩu thành công!!");
            else return BadRequest("Đổi mật khẩu thất bại!!");
        }

        [HttpPost]
        [Route("admin/getallusers")]
        public IActionResult GetAllUser()
        {
            var users = iuserService.GetAllUser();
            return Ok(new { users });
        }

        [HttpDelete]
        [Route("admin/{userId}")]
        public IActionResult DeleteUser(int userId)
        {
            iuserService.DeleteUser(userId);
            return Ok("Đã xoá thành công");
        }
    }
}
