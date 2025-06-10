using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.DataAccessLayer.Entities;

public partial class Order
{
    public int OrderId { get; set; }

    public int BuyerId { get; set; }

    public DateTime OrderDate { get; set; }

    public decimal TotalAmount { get; set; }

    public int OrderStatusId { get; set; }

    public string? ShippingAddress { get; set; }

    public int SellerId { get; set; }

    public string? Notes { get; set; }

    public string? RejectionReason { get; set; }

    // NEW: selected payment method
    public int PaymentMethodId { get; set; }

    // NEW: buyer upload proof for offline payment (BankTransfer)
    public string? ProofImageUrl { get; set; }

    // NEW: reason when order cancelled after confirmation
    public string? CancellationReason { get; set; }

    public string? ShippingProvider { get; set; }

    public string? TrackingNumber { get; set; }

    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual Payment? Payment { get; set; }

    public virtual SystemStatus OrderStatus { get; set; } = null!;

    public virtual User Buyer { get; set; } = null!;

    public virtual User Seller { get; set; } = null!;

    public virtual PaymentMethod PaymentMethod { get; set; } = null!;

    // 1-1 navigation to Review (buyer rates seller + item)
    public virtual Review? Review { get; set; }
}
