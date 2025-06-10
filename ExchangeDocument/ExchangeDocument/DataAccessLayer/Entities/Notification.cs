using System;
using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.DataAccessLayer.Entities
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = null!;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string? NotificationType { get; set; }

        public int? ReferenceId { get; set; }

        [MaxLength(255)]
        public string? Link { get; set; }

        // Navigation to User entity
        public virtual User User { get; set; } = null!;
    }
}
