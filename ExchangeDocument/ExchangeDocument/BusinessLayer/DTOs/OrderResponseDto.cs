namespace ExchangeDocument.BusinessLayer.DTOs;

public class OrderResponseDto
{
    public int OrderId { get; set; }
    public int BuyerId { get; set; }
    public int SellerId { get; set; }
    public int ListingId { get; set; }
    public decimal TotalAmount { get; set; }
    public string OrderStatus { get; set; } = null!;
    public DateTime OrderDate { get; set; }
    public string? ShippingAddress { get; set; }
    public string? Notes { get; set; }
    public string? RejectionReason { get; set; }
    public int PaymentMethodId { get; set; }
    public string? PaymentMethodName { get; set; }
    public string? ProofImageUrl { get; set; }
    public string? CancellationReason { get; set; }
    public string? ShippingProvider { get; set; }
    public string? TrackingNumber { get; set; }
    /// <summary>
    /// RowVersion của Order (Base-64), dùng cho kiểm tra concurrency khi seller accept/reject.
    /// </summary>
    public byte[] RowVersion { get; set; } = null!;
}
