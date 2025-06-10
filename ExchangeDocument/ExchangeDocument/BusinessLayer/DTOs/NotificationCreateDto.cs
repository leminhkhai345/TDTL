using System;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class NotificationCreateDto
    {
        public string Message { get; set; } = null!;
        public string? NotificationType { get; set; }
        public int? ReferenceId { get; set; }
        public string? Link { get; set; }
    }
}
