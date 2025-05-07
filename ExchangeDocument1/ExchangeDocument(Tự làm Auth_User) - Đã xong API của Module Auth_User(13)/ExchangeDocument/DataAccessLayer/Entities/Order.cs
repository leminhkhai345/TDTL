using System;
using System.Collections.Generic;

namespace ExchangeDocument.DataAccessLayer.Entities;

public partial class Order
{
    public int OrderId { get; set; }

    public int UserId { get; set; }

    public DateTime OrderDate { get; set; }

    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = null!;

    public string? ShippingAddress { get; set; }

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual Payment? Payment { get; set; }

    public virtual User User { get; set; } = null!;
}
