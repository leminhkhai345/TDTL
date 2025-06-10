using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Models;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    public interface IUserService
    {
        Task<Result<UserProfileDTO>> GetProfileAsync(int userId);
        Task<Result<UserProfileDTO>> UpdateProfileAsync(int userId, UpdateProfileRequestDTO dto);
        Task<Result<bool>> ChangePasswordAsync(int userId, ChangePasswordRequestDTO dto);
        Task<Result<PagedResult<UserProfileDTO>>> GetAllUsersAsync(int pageNumber, int pageSize);
        /// <summary>
        /// Lấy thông tin hồ sơ công khai (giới hạn) của một người dùng để hiển thị cho buyer.
        /// </summary>
        Task<Result<PublicUserProfileDto>> GetPublicProfileAsync(int userId);
        Task<Result<bool>> DeleteUserAsync(int userId, int adminId);
        Task<Result<bool>> UpdateUserAsync(int userId, AdminUpdateUserDTO dto, int adminId);
    }
}
