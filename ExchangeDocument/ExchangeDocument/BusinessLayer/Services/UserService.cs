using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;


namespace ExchangeDocument.BusinessLayer.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository IUserRepo;
        private readonly IMemoryCache cache;
        private readonly IEmailService emailService;
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
            Console.WriteLine($"[OTP] {otp} đã gửi đến {request.Email}\n");

            // Lưu thông tin đăng ký tạm thời (trừ OTP)
            cache.Set($"pending_user_{request.Email}", request, TimeSpan.FromMinutes(10));

            // Lưu OTP tạm thời
            cache.Set($"otp_{request.Email}", otp, TimeSpan.FromMinutes(10));

            emailService.SendOtpAsync(request.Email, otp);

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
                RoleId = 1
            };

            IUserRepo.AddUser(user);
            IUserRepo.SaveChanges();

            cache.Remove($"otp_{request.Email}");
            cache.Remove($"pending_user_{request.Email}");

            return ("Đăng ký thành công.");
        }

        public User Login(DTOs.LoginRequest request)
        {
            User user = IUserRepo.GetUserByEmail(request.Email);
            if (user == null) return null;
            var passwordHasher = new PasswordHasher<object>();
            var result = passwordHasher.VerifyHashedPassword(null, user.Password, request.Password);

            if (result == PasswordVerificationResult.Success)
            {
                return IUserRepo.GetUserById(user.UserId);
            }
            return null;
        }
        public void Logout()
        {
        }

        public bool ChangePassword(ChangePasswordRequest request, string userId)
        {
            User user = IUserRepo.GetUserByEmail(userId);
            var passwordHasher = new PasswordHasher<object>();
            var result = passwordHasher.VerifyHashedPassword(null, user.Password, request.olePassword);
            string hashedPassword = passwordHasher.HashPassword(null, request.newPassword);
            if (user != null && request.newPassword == request.confirmPassword && result == PasswordVerificationResult.Success)
            {
                user.Password = hashedPassword;
                IUserRepo.SaveChanges();
                return true;
            }
            else return false;
        }



        public Userprofile GetProfile(int id)
        {
            Userprofile profile = IUserRepo.GetProfileById(id);
            return profile;
        }

        public List<Userprofile> GetAllUserProfile()
        {
            List<Userprofile> li = IUserRepo.GetAllUSerProfile();
            return li;
        }


        public void EditProfile(ProfileRequest request, int loginId)
        {
            Userprofile profile = IUserRepo.GetProfileById(loginId);
            if(profile == null)
            {
                profile = new Userprofile
                {
                    Address = request.address,
                    Birth = request.birth,
                    UserId = loginId
                };
                IUserRepo.AddUserprofile(profile);
            }
            else
            {
                profile.Address = request.address;
                profile.Birth = request.birth;
            }
            IUserRepo.SaveChanges();
        }

        public List<User> GetAllUser()
        {
            List<User> users = IUserRepo.GetAllUser();
            return users;
        }

        public void DeleteUser(int id)
        {    
            User user = IUserRepo.GetUserById(id);
            IUserRepo.DeleteUser(user);
            IUserRepo.SaveChanges();
            
        }
    }
}
