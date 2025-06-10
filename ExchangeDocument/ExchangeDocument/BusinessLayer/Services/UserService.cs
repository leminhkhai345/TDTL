using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.BusinessLayer.Models;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using ExchangeDocument.DataAccessLayer.Data;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly ExchangeDocumentContext _context;
        private readonly ILogger<UserService> _logger;

        public UserService(IUserRepository userRepository, IRoleRepository roleRepository, ExchangeDocumentContext context, ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _context = context;
            _logger = logger;
        }

        public async Task<Result<UserProfileDTO>> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found for id {UserId}", userId);
                return Result<UserProfileDTO>.Fail("User not found.");
            }

            var profile = new UserProfileDTO
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                IsEmailVerified = user.IsEmailVerified,
                Role = user.Role.RoleName,
                Phone = user.Phone,
                Address = user.Userprofile?.Address,
                Birth = user.Userprofile?.Birth,
                CreatedAt = user.CreatedAt,
                BankAccountNumber = user.Userprofile?.BankAccountNumber,
                BankAccountName = user.Userprofile?.BankAccountName,
                BankName = user.Userprofile?.BankName,
                BankBranch = user.Userprofile?.BankBranch
            };

            return Result<UserProfileDTO>.Ok(profile);
        }

        public async Task<Result<UserProfileDTO>> UpdateProfileAsync(int userId, UpdateProfileRequestDTO dto)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("UpdateProfile failed: user {UserId} not found", userId);
                return Result<UserProfileDTO>.Fail("User not found.");
            }
            // Update core fields
            user.FullName = dto.FullName;
            user.Phone = dto.Phone;
            user.UpdatedAt = DateTime.UtcNow;
            // Update or create profile
            if (user.Userprofile == null)
            {
                user.Userprofile = new Userprofile
                {
                    UserId = userId,
                    Address = dto.Address,
                    Birth = dto.Birth,
                    BankAccountNumber = dto.BankAccountNumber,
                    BankAccountName = dto.BankAccountName,
                    BankName = dto.BankName,
                    BankBranch = dto.BankBranch
                };
            }
            else
            {
                user.Userprofile.Address = dto.Address;
                user.Userprofile.Birth = dto.Birth;
                user.Userprofile.BankAccountNumber = dto.BankAccountNumber;
                user.Userprofile.BankAccountName = dto.BankAccountName;
                user.Userprofile.BankName = dto.BankName;
                user.Userprofile.BankBranch = dto.BankBranch;
            }
            await _context.SaveChangesAsync();
            _logger.LogInformation("User {UserId} updated profile at {Time}", userId, user.UpdatedAt);
            // Map to DTO
            var updated = new UserProfileDTO
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                IsEmailVerified = user.IsEmailVerified,
                Role = user.Role.RoleName,
                Phone = user.Phone,
                Address = user.Userprofile?.Address,
                Birth = user.Userprofile?.Birth,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                BankAccountNumber = user.Userprofile?.BankAccountNumber,
                BankAccountName = user.Userprofile?.BankAccountName,
                BankName = user.Userprofile?.BankName,
                BankBranch = user.Userprofile?.BankBranch
            };
            return Result<UserProfileDTO>.Ok(updated);
        }

        public async Task<Result<bool>> ChangePasswordAsync(int userId, ChangePasswordRequestDTO dto)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("ChangePassword failed: user {UserId} not found", userId);
                return Result<bool>.Fail("User not found.");
            }
            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
            {
                _logger.LogWarning("ChangePassword failed: incorrect old password for user {UserId}", userId);
                return Result<bool>.Fail("Current password is incorrect.");
            }
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _logger.LogInformation("User {UserId} changed password at {Time}", userId, user.UpdatedAt);
            return Result<bool>.Ok(true);
        }

        public async Task<Result<PagedResult<UserProfileDTO>>> GetAllUsersAsync(int pageNumber, int pageSize)
        {
            var totalCount = await _userRepository.CountUsersAsync();
            var users = await _userRepository.GetAllUsers()
                .OrderBy(u => u.UserId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = users.Select(user => new UserProfileDTO
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                IsEmailVerified = user.IsEmailVerified,
                Role = user.Role.RoleName,
                Phone = user.Phone,
                Address = user.Userprofile?.Address,
                Birth = user.Userprofile?.Birth,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                BankAccountNumber = user.Userprofile?.BankAccountNumber,
                BankAccountName = user.Userprofile?.BankAccountName,
                BankName = user.Userprofile?.BankName,
                BankBranch = user.Userprofile?.BankBranch
            }).ToList();

            var response = new PagedResult<UserProfileDTO>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };

            _logger.LogInformation("Admin fetched users page {PageNumber} with size {PageSize}", pageNumber, pageSize);

            return Result<PagedResult<UserProfileDTO>>.Ok(response);
        }

        public async Task<Result<bool>> DeleteUserAsync(int userId, int adminId)
        {
            if (userId < 1)
                return Result<bool>.Fail("Invalid userId.");
            if (userId == adminId)
                return Result<bool>.Fail("Cannot delete yourself.");
            var success = await _userRepository.SoftDeleteAsync(userId);
            if (!success)
                return Result<bool>.Fail("User not found.");
            await _context.SaveChangesAsync();
            _logger.LogInformation("User {UserId} soft-deleted by Admin {AdminId}", userId, adminId);
            return Result<bool>.Ok(true);
        }

        public async Task<Result<bool>> UpdateUserAsync(int userId, AdminUpdateUserDTO dto, int adminId)
        {
            if (userId < 1)
                return Result<bool>.Fail("Invalid userId.");
            if (userId == adminId)
                return Result<bool>.Fail("Cannot update yourself.");
            if (!await _roleRepository.ExistsAsync(dto.RoleId))
                return Result<bool>.Fail("Role not found.");
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
                return Result<bool>.Fail("User not found.");
            user.FullName = dto.FullName;
            user.Phone = dto.Phone;
            user.RoleId = dto.RoleId;
            user.IsLocked = dto.IsLocked;
            user.UpdatedAt = DateTime.UtcNow;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Concurrency error updating user {UserId}", userId);
                return Result<bool>.Fail("Concurrent update error.");
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error updating user {UserId}", userId);
                return Result<bool>.Fail("Database update error.");
            }
            _logger.LogInformation("Admin {AdminId} updated user {UserId}: RoleId={RoleId}, IsLocked={IsLocked}", adminId, userId, dto.RoleId, dto.IsLocked);
            return Result<bool>.Ok(true);
        }

        public async Task<Result<PublicUserProfileDto>> GetPublicProfileAsync(int userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Public profile: user {UserId} not found", userId);
                return Result<PublicUserProfileDto>.Fail("User not found.");
            }

            // Đếm số tin đang active của seller (có thể giúp buyer đánh giá)
            var activeCount = await _context.Listings
                .Where(l => l.OwnerId == userId && !l.IsDeleted && l.SystemStatus.Domain == "Listing" && l.SystemStatus.Code == "Active")
                .CountAsync();

            var dto = new PublicUserProfileDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                JoinedAt = user.CreatedAt,
                ActiveListings = activeCount,
                Phone = user.Phone,
                Address = user.Userprofile?.Address,
                BankAccountNumber = user.Userprofile?.BankAccountNumber,
                BankAccountName = user.Userprofile?.BankAccountName,
                BankName = user.Userprofile?.BankName,
                BankBranch = user.Userprofile?.BankBranch
            };

            return Result<PublicUserProfileDto>.Ok(dto);
        }
    }
}
