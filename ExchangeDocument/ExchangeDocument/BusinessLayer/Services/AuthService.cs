using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using ExchangeDocument.BusinessLayer.DTOs.Auth;
using BCrypt.Net;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ExchangeDocument.BusinessLayer.Models;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Data;
using System;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;
        private readonly ExchangeDocumentContext _context;
        private readonly OtpSettings _otpSettings;
        private readonly JwtSettings _jwtSettings;
        private readonly PasswordResetSettings _passwordResetSettings;

        public AuthService(
            IUserRepository userRepository,
            IMemoryCache cache,
            IEmailService emailService,
            ExchangeDocumentContext context,
            IOptions<OtpSettings> otpSettings,
            IOptions<JwtSettings> jwtSettings,
            IOptions<PasswordResetSettings> passwordResetSettings,
            ILogger<AuthService> logger
        )
        {
            _userRepository = userRepository;
            _cache = cache;
            _emailService = emailService;
            _context = context;
            _logger = logger;
            _otpSettings = otpSettings.Value;
            _jwtSettings = jwtSettings.Value;
            _passwordResetSettings = passwordResetSettings.Value;
        }

        public async Task<Result<string>> RegisterAsync(RegisterRequestDTO request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var existingUser = await _userRepository.GetUserByEmailAsync(email);
            if (existingUser != null)
            {
                if (existingUser.IsEmailVerified)
                    return Result<string>.Fail("Email already registered and verified.");
                // Already registered but not verified: optionally allow resend OTP
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
            // Create user record if not exists
            if (existingUser == null)
            {
                var user = new User
                {
                    FullName = request.FullName,
                    Email = email,
                    Password = hashedPassword,
                    IsEmailVerified = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _userRepository.AddUserAsync(user);
                await _context.SaveChangesAsync();
            }
            var otp = new Random().Next(100000, 999999).ToString();

            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(_otpSettings.ExpiryMinutes));
            _cache.Set($"otp_{email}", otp, cacheOptions);

            _logger.LogInformation("Generated OTP for {Email}", email);
            await _emailService.SendOtpAsync(email, request.FullName, otp);

            return Result<string>.Ok(otp);
        }

        public async Task<Result<bool>> VerifyOtpAsync(VerifyOtpRequestDTO request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            // 1) Check user existence and verification status
            var user = await _userRepository.GetUserByEmailAsync(email);
            if (user == null)
                return Result<bool>.Fail("User not found.");
            if (user.IsEmailVerified)
                return Result<bool>.Fail("Email already verified.");

            // 2) Validate OTP from cache
            if (!_cache.TryGetValue($"otp_{email}", out string storedOtp) || storedOtp != request.Otp)
                return Result<bool>.Fail("Invalid or expired OTP.");

            user.IsEmailVerified = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.SaveChangesAsync();
            await _context.SaveChangesAsync();
            _cache.Remove($"otp_{email}");
            _logger.LogInformation("User {Email} verified successfully", email);
            return Result<bool>.Ok(true);
        }

        public async Task<Result<string>> LoginAsync(LoginRequestDTO request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var user = await _userRepository.GetUserByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("Login failed: user {Email} not found", email);
                return Result<string>.Fail("Invalid credentials.");
            }
            if (!user.IsEmailVerified)
                return Result<string>.Fail("Email not verified.");
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                _logger.LogWarning("Login failed: invalid password for {Email}", email);
                return Result<string>.Fail("Invalid credentials.");
            }
            var jti = Guid.NewGuid().ToString();
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.RoleName),
                new Claim(JwtRegisteredClaimNames.Jti, jti)
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes);
            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );
            var tokenStr = new JwtSecurityTokenHandler().WriteToken(token);
            _logger.LogInformation("User {Email} logged in successfully", email);
            return Result<string>.Ok(tokenStr);
        }

        public async Task<Result<bool>> ForgotPasswordAsync(ForgotPasswordRequestDTO request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var user = await _userRepository.GetUserByEmailAsync(email);
            if (user != null)
            {
                var resetToken = Guid.NewGuid().ToString();
                user.PasswordResetToken = resetToken;
                user.ResetTokenExpires = DateTime.UtcNow.AddMinutes(_passwordResetSettings.ExpiryMinutes);
                await _userRepository.SaveChangesAsync();
                await _context.SaveChangesAsync();
                _logger.LogInformation("Generated password reset token for {Email}", email);
                await _emailService.SendPasswordResetAsync(user.Email, user.FullName, resetToken);
            }
            return Result<bool>.Ok(true);
        }

        // Reset user password using reset token
        public async Task<Result<bool>> ResetPasswordAsync(ResetPasswordRequestDTO request)
        {
            var token = request.Token.Trim();
            var user = await _userRepository.GetUserByResetTokenAsync(token);
            if (user == null || user.ResetTokenExpires == null || user.ResetTokenExpires < DateTime.UtcNow)
                return Result<bool>.Fail("Invalid or expired reset token.");

            // Update password
            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            // Invalidate token
            user.PasswordResetToken = null;
            user.ResetTokenExpires = null;
            await _userRepository.SaveChangesAsync();
            await _context.SaveChangesAsync();
            _logger.LogInformation("Password reset successfully for {Email}", user.Email);
            return Result<bool>.Ok(true);
        }
    }
}
