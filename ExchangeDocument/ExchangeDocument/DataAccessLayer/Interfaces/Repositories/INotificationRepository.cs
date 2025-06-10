using System.Collections.Generic;
using System.Threading.Tasks;
using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories
{
    public interface INotificationRepository
    {
        Task AddAsync(Notification notification);
        Task<Notification?> GetByIdAsync(int notificationId);
        Task<(List<Notification> Items, int TotalCount)> GetNotificationsForUserAsync(int userId, int pageNumber, int pageSize, bool onlyUnread = false);
        Task<int> GetUnreadNotificationCountAsync(int userId);
    }
}
