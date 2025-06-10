using ExchangeDocument.BusinessLayer.Enums;

namespace ExchangeDocument.BusinessLayer.Helpers;

/// <summary>
/// Helper tạo Message + Link cho thông báo dựa vào template và tham số.
/// </summary>
public static class NotificationMessageBuilder
{
    public static (string message, string? link) Build(NotificationTemplate template, int referenceId)
        => template switch
        {
            NotificationTemplate.OrderCreated   => ($"Đơn hàng #{referenceId} vừa được tạo.", $"/orders/{referenceId}"),
            NotificationTemplate.OrderAccepted  => ($"Người bán đã xác nhận đơn #{referenceId}.", $"/orders/{referenceId}"),
            NotificationTemplate.OrderRejected  => ($"Đơn #{referenceId} đã bị người bán từ chối.", $"/orders/{referenceId}"),
            NotificationTemplate.OrderCancelled => ($"Đơn #{referenceId} đã bị hủy.", $"/orders/{referenceId}"),
            NotificationTemplate.PaymentConfirmed => ($"Đã nhận thanh toán cho đơn #{referenceId}.", $"/orders/{referenceId}"),
            NotificationTemplate.OrderShipped   => ($"Đơn #{referenceId} đang được giao.", $"/orders/{referenceId}"),
            NotificationTemplate.OrderDelivered => ($"Đơn #{referenceId} đã giao đến bạn.", $"/orders/{referenceId}"),
            NotificationTemplate.OrderCompleted => ($"Đơn #{referenceId} đã hoàn tất.", $"/orders/{referenceId}"),
            NotificationTemplate.ReviewCreated  => ($"Bạn nhận được một đánh giá mới.", $"/reviews/{referenceId}"),
            NotificationTemplate.ReviewReplied  => ($"Người bán đã phản hồi đánh giá của bạn.", $"/reviews/{referenceId}"),
            _                                   => ($"Có cập nhật mới cho đơn #{referenceId}.", $"/orders/{referenceId}")
        };
}
