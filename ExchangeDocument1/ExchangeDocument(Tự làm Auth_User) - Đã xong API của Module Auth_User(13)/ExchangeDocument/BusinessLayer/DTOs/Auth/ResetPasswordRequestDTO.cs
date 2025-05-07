using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs.Auth
{
    public class ResetPasswordRequestDTO
    {
        [Required]
        public string Token { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
        [RegularExpression("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$", ErrorMessage = "Password must include uppercase, lowercase, digit and special character.")]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; }
    }
}
