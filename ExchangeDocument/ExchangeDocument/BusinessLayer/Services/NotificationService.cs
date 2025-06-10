using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Enums;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.Extensions.Logging;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepo;
        private readonly ExchangeDocumentContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(INotificationRepository notificationRepo,
                                   ExchangeDocumentContext context,
                                   ILogger<NotificationService> logger)
        {
            _notificationRepo = notificationRepo;
            _context = context;
            _logger = logger;
        }

        public async Task<(NotificationDto dto, string? error)> CreateNotificationAsync(int userId, NotificationCreateDto dto)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Message = dto.Message,
                    NotificationType = dto.NotificationType,
                    ReferenceId = dto.ReferenceId,
                    Link = dto.Link,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                await _notificationRepo.AddAsync(notification);
                await _context.SaveChangesAsync();

                var result = new NotificationDto
                {
                    NotificationId = notification.NotificationId,
                    Message = notification.Message,
                    IsRead = notification.IsRead,
                    CreatedAt = notification.CreatedAt,
                    NotificationType = notification.NotificationType,
                    ReferenceId = notification.ReferenceId,
                    Link = notification.Link
                };

                return (result, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification for user {UserId}", userId);
                return (null!, "An error occurred while creating notification.");
            }
        }

        public async Task<List<(NotificationDto dto, string? error)>> CreateNotificationsAsync(IEnumerable<int> userIds, NotificationCreateDto dto)
        {
            var results = new List<(NotificationDto dto, string? error)>();

            foreach (var id in userIds.Distinct())
            {
                var (created, error) = await CreateNotificationAsync(id, dto);
                results.Add((created, error));
            }

            return results;
        }

        public async Task<List<(NotificationDto dto, string? error)>> CreateNotificationsByTemplateAsync(IEnumerable<int> userIds, NotificationTemplate template, int referenceId)
        {
            var (message, link) = Helpers.NotificationMessageBuilder.Build(template, referenceId);
            var dto = new NotificationCreateDto { Message = message, NotificationType = template.ToString(), ReferenceId = referenceId, Link = link };
            return await CreateNotificationsAsync(userIds, dto);
        }

        public async Task<(List<NotificationDto> Items, int TotalCount)> GetNotificationsAsync(int userId, int pageNumber, int pageSize, bool onlyUnread = false)
        {
            var (entities, totalCount) = await _notificationRepo.GetNotificationsForUserAsync(userId, pageNumber, pageSize, onlyUnread);
            var items = entities.Select(n => new NotificationDto
            {
                NotificationId = n.NotificationId,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                NotificationType = n.NotificationType,
                ReferenceId = n.ReferenceId,
                Link = n.Link
            }).ToList();

            return (items, totalCount);
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _notificationRepo.GetUnreadNotificationCountAsync(userId);
        }

        public async Task<string?> MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _notificationRepo.GetByIdAsync(notificationId);
            if (notification == null) return "NotFound";
            if (notification.UserId != userId) return "Forbidden";

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return null;
        }

        public async Task MarkAllAsReadAsync(int userId)
        {
            var (entities, _) = await _notificationRepo.GetNotificationsForUserAsync(userId, 1, int.MaxValue, true);
            foreach (var notification in entities)
            {
                notification.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }
    }
}
