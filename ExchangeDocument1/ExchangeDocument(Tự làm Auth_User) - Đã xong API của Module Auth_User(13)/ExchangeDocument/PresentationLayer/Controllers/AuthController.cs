using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using ExchangeDocument.BusinessLayer.DTOs.Auth;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.BusinessLayer.Models;
using Microsoft.Extensions.Logging;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IJwtBlacklistService _blacklistService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, IJwtBlacklistService blacklistService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _blacklistService = blacklistService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterAsync(request);
            if (!result.IsSuccess)
                return BadRequest(new { result.ErrorMessage });

            return Ok(new { Message = "Registration request received. Please check your email for the OTP to verify your account." });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.VerifyOtpAsync(request);
            if (!result.IsSuccess)
                return BadRequest(new { result.ErrorMessage });

            return Ok(new { Message = "Verification successful. You can now log in." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(request);
            if (!result.IsSuccess)
                return BadRequest(new { result.ErrorMessage });

            return Ok(new { Token = result.Value });
        }

        // Password reset (Forgot Password)
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.ForgotPasswordAsync(request);
            if (!result.IsSuccess)
                return BadRequest(new { result.ErrorMessage });

            return Ok(new { message = "If email exists, instructions to reset password have been sent." });
        }

        // Reset Password
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.ResetPasswordAsync(request);
            if (!result.IsSuccess)
                return BadRequest(new { result.ErrorMessage });

            return Ok(new { message = "Password has been reset successfully." });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var jti = User.FindFirstValue(JwtRegisteredClaimNames.Jti);
            var expClaim = User.FindFirstValue(JwtRegisteredClaimNames.Exp);
            if (string.IsNullOrEmpty(jti) || string.IsNullOrEmpty(expClaim) || !long.TryParse(expClaim, out var expUnixTime))
            {
                return Ok(new { message = "Successfully logged out." });
            }
            var expiryTime = DateTimeOffset.FromUnixTimeSeconds(expUnixTime).UtcDateTime;
            try
            {
                await _blacklistService.AddToBlacklistAsync(jti, expiryTime);
                _logger.LogInformation("Blacklisted token with JTI {Jti} until {Expiry}", jti, expiryTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to blacklist token with JTI {Jti}", jti);
            }
            return Ok(new { message = "Successfully logged out." });
        }
    }
}
