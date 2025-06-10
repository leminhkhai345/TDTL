using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ExchangeDocumentContext _context;

        public NotificationRepository(ExchangeDocumentContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Notification notification)
        {
            await _context.Notifications.AddAsync(notification);
        }

        public async Task<Notification?> GetByIdAsync(int notificationId)
        {
            return await _context.Notifications.FindAsync(notificationId);
        }

        public async Task<(List<Notification> Items, int TotalCount)> GetNotificationsForUserAsync(int userId, int pageNumber, int pageSize, bool onlyUnread = false)
        {
            var query = _context.Notifications.AsQueryable().Where(n => n.UserId == userId);
            if (onlyUnread)
                query = query.Where(n => !n.IsRead);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<int> GetUnreadNotificationCountAsync(int userId)
        {
            return await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        }
    }
}
