using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ExchangeDocumentContext _context;

        public UserRepository(ExchangeDocumentContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserByResetTokenAsync(string token)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.PasswordResetToken == token);
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Userprofile)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task AddUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        // Count total users for paging
        public async Task<int> CountUsersAsync()
        {
            return await _context.Users.CountAsync();
        }

        // Query all users with related data
        public IQueryable<User> GetAllUsers()
        {
            return _context.Users
                .Include(u => u.Role)
                .Include(u => u.Userprofile);
        }

        // Soft-delete user by setting flag
        public async Task<bool> SoftDeleteAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;
            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
