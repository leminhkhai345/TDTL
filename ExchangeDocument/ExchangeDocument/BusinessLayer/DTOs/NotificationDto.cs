using System;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? NotificationType { get; set; }
        public int? ReferenceId { get; set; }
        public string? Link { get; set; }
    }
}
