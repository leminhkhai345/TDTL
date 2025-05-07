using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs.Auth
{
    public class ForgotPasswordRequestDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
