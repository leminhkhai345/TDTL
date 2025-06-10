using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class AdminUpdateUserDTO
    {
        [Required]
        [MaxLength(255)]
        public string FullName { get; set; }

        [Phone]
        public string? Phone { get; set; }

        [Required]
        public int RoleId { get; set; }

        [Required]
        public bool IsLocked { get; set; }
    }
}
