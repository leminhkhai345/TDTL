using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository IUserRepo;
        private readonly IMemoryCache cache;
        private readonly IEmailService emailService;
        public static int LoginId = 0;
        public UserService(IUserRepository _IUserRepo, IMemoryCache _cache, IEmailService _emailService)
        {
            IUserRepo = _IUserRepo;
            cache = _cache;
            emailService = _emailService;
        }
        public bool Register(RegisterDTO request)
        {
            User u = IUserRepo.GetUserByEmail(request.Email);
            if (u != null) return false;

            var otp = new Random().Next(100000, 999999).ToString();

            // Lưu thông tin đăng ký tạm thời (trừ OTP)
            cache.Set($"pending_user_{request.Email}", request, TimeSpan.FromMinutes(10));

            // Lưu OTP tạm thời
            cache.Set($"otp_{request.Email}", otp, TimeSpan.FromMinutes(10));

            emailService.SendEmailAsync(
                request.Email,
                "Xác minh tài khoản",
                $"Mã OTP của bạn là: <b>{otp}</b>");
            return true;
        }

        public string VerifyOtp(VerifyOtpRequest request)
        {
            if (!cache.TryGetValue($"otp_{request.Email}", out string otp) || otp != request.OtpCode)
                return ("OTP không hợp lệ.");

            if (!cache.TryGetValue($"pending_user_{request.Email}", out RegisterDTO userData))
                return ("Thông tin đăng ký không hợp lệ hoặc đã hết hạn.");

            var passwordHasher = new PasswordHasher<object>();
            string hashedPassword = passwordHasher.HashPassword(null, userData.Password);
            User user = new User
            {
                FullName = userData.FullName,
                Email = userData.Email,
                Password = hashedPassword,
                Phone = userData.Phone,
                Role = "user",
                IsVerify = true
            };

            IUserRepo.AddUser(user);
            IUserRepo.SaveChanges();

            cache.Remove($"otp_{request.Email}");
            cache.Remove($"pending_user_{request.Email}");

            return ("Đăng ký thành công.");
        }

        public bool Login(DTOs.LoginRequest request)
        {
            User user = IUserRepo.GetUserByEmail(request.Email);
            if (user == null) return false;
            var passwordHasher = new PasswordHasher<object>();
            var result = passwordHasher.VerifyHashedPassword(null, user.Password, request.Password);

            if (result == PasswordVerificationResult.Success)
            {
                LoginId = user.UserId;
                return true;
            }
            return false;
        }
        public void Logout()
        {
            LoginId = 0;
        }

        public bool ChangePassword(ChangePasswordRequest request)
        {
            User user = IUserRepo.GetUserById(LoginId);
            var passwordHasher = new PasswordHasher<object>();
            string hashedPassword = passwordHasher.HashPassword(null, request.newPassword);
            if (user != null && request.newPassword == request.confirmPassword)
            {
                user.Password = hashedPassword;
                IUserRepo.SaveChanges();
                return true;
            }
            else return false;
        }

        public void EditProfile(ProfileRequest request)
        {
            Userprofile profile = IUserRepo.GetProfileById(LoginId);
            if (profile == null)
            {
                profile = new Userprofile
                {
                    UserId = LoginId,
                    Address = request.address,
                    Birth = request.birth
                };
                IUserRepo.AddUserprofile(profile);
                IUserRepo.SaveChanges();
            }
            else
            {
                profile.Address = request.address;
                profile.Birth = request.birth;
                IUserRepo.SaveChanges();
            }
        }
    }
}
