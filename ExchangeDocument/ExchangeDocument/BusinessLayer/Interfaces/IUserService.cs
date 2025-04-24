using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.BusinessLayer.Interfaces
{
    public interface IUserService
    {
        public  bool Register(RegisterDTO request);
        public string VerifyOtp(VerifyOtpRequest request);
        public bool Login(DTOs.LoginRequest request);
        public void Logout();
        public bool ChangePassword(ChangePasswordRequest request);
        public void EditProfile(ProfileRequest request);
        public Userprofile GetProfile();
        public Userprofile GetProfile(int id);
        public List<Userprofile> GetAllUserProfile();
        public List<User> GetAllUser();
        public void DeleteUser(int id);
    }
}
