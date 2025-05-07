using ExchangeDocument.DataAccessLayer.Entities;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task AddUserAsync(User user);
        Task SaveChangesAsync();
        // Find a user by password reset token
        Task<User?> GetUserByResetTokenAsync(string token);
        // Retrieve user by ID, including related data
        Task<User?> GetUserByIdAsync(int userId);
        Task<int> CountUsersAsync();
        IQueryable<User> GetAllUsers();
        Task<bool> SoftDeleteAsync(int userId);
    }
}
