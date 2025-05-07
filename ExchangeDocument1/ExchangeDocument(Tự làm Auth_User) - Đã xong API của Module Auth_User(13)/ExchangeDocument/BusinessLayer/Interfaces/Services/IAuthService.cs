using ExchangeDocument.BusinessLayer.DTOs.Auth;
using ExchangeDocument.BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc; // For IActionResult or specific result types
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    public interface IAuthService
    {
        Task<Result<string>> RegisterAsync(RegisterRequestDTO request);

        Task<Result<bool>> VerifyOtpAsync(VerifyOtpRequestDTO request);

        Task<Result<string>> LoginAsync(LoginRequestDTO request);

        Task<Result<bool>> ForgotPasswordAsync(ForgotPasswordRequestDTO request);

        // Add other methods later like:
        Task<Result<bool>> ResetPasswordAsync(ResetPasswordRequestDTO request);
    }
}
