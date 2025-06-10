using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    /// <summary>
    /// Service for sending emails such as OTP verification.
    /// </summary>
    public interface IEmailService
    {
        Task SendOtpAsync(string email, string fullName, string otp);
        // Sends a password reset link/token to the user's email
        Task SendPasswordResetAsync(string email, string fullName, string resetToken);
    }
}
