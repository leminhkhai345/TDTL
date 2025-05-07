using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs.Auth
{
    public class VerifyOtpRequestDTO
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "OTP is required.")]
        public string Otp { get; set; } = string.Empty;
    }
}
