using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.BusinessLayer.Interfaces
{
    public interface IUserService
    {
        public  bool Register(RegisterDTO request);
        public string VerifyOtp(VerifyOtpRequest request);
        public UserResponse Login(DTOs.LoginRequest request);
        public void Logout();
        public bool ChangePassword(ChangePasswordRequest request, string email);
        public void EditProfile(ProfileRequest request, int loginId);
        public Userprofile GetProfile(int id);
        public List<Userprofile> GetAllUserProfile();
        public List<UserResponse> GetAllUser();
        public UserResponse GetUserById(int userId);
        public void DeleteUser(string Email);
    }
}
