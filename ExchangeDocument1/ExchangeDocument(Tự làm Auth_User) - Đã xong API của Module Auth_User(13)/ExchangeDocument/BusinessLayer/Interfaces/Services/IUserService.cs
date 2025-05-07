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
        Task<Result<PagedResponseDTO<UserProfileDTO>>> GetAllUsersAsync(int pageNumber, int pageSize);
        Task<Result<bool>> DeleteUserAsync(int userId, int adminId);
        Task<Result<bool>> UpdateUserAsync(int userId, AdminUpdateUserDTO dto, int adminId);
    }
}
