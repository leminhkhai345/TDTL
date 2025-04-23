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
    }
}
