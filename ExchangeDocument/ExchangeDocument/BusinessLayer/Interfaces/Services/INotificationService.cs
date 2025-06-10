using System.Collections.Generic;
using System.Threading.Tasks;
using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Enums;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    public interface INotificationService
    {
        Task<(NotificationDto dto, string? error)> CreateNotificationAsync(int userId, NotificationCreateDto dto);
        /// <summary>
        /// Tạo thông báo cho nhiều user cùng lúc. Trả về danh sách kết quả (có thể chứa lỗi cho từng user).
        /// </summary>
        Task<List<(NotificationDto dto, string? error)>> CreateNotificationsAsync(IEnumerable<int> userIds, NotificationCreateDto dto);
        /// <summary>
        /// Tạo thông báo dựa trên template (server tự build message/link).
        /// </summary>
        Task<List<(NotificationDto dto, string? error)>> CreateNotificationsByTemplateAsync(IEnumerable<int> userIds, NotificationTemplate template, int referenceId);
        Task<(List<NotificationDto> Items, int TotalCount)> GetNotificationsAsync(int userId, int pageNumber, int pageSize, bool onlyUnread = false);
        Task<int> GetUnreadCountAsync(int userId);
        Task<string?> MarkAsReadAsync(int notificationId, int userId);
        Task MarkAllAsReadAsync(int userId);
    }
}
