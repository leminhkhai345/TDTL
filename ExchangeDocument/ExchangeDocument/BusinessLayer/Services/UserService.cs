using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.Interfaces;
using ExchangeDocument.DataAccessLayer.ModelFromDB;
using Microsoft.AspNetCore.Identity;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository IUserRepo;
        public UserService(IUserRepository _IUserRepo)
        {
            IUserRepo = _IUserRepo;
        }
        public bool Register(RegisterRequest request)
        {
            User u = IUserRepo.GetUserByEmail(request.Email);
            if (u != null) return false;

            var passwordHasher = new PasswordHasher<object>();
            string hashedPassword = passwordHasher.HashPassword(null, request.Password);
            User user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = hashedPassword,
                Phone = request.Phone
            };
            IUserRepo.AddUser(user);
            IUserRepo.SaveChanges();
            return true;
        }
    }
}
