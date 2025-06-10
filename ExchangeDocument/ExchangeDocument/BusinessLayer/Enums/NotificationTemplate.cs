namespace ExchangeDocument.BusinessLayer.Enums;

/// <summary>
/// Danh sách template thông báo chuẩn cho luồng Orders (và có thể mở rộng sau này).
/// Giá trị enum đồng thời được dùng làm <see cref="Notification.NotificationType"/>.
/// </summary>
public enum NotificationTemplate
{
    OrderCreated,
    OrderAccepted,
    OrderRejected,
    OrderCancelled,
    PaymentConfirmed,
    OrderShipped,
    OrderDelivered,
    OrderCompleted,
    ReviewCreated,
    ReviewReplied
}
