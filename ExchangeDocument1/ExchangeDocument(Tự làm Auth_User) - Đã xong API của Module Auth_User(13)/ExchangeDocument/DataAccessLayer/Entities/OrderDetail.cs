using System;
using System.Collections.Generic;

namespace ExchangeDocument.DataAccessLayer.Entities;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int OrderId { get; set; }

    public int DocumentId { get; set; }

    public int Quantity { get; set; }

    public decimal PriceAtOrderTime { get; set; }

    public decimal? Amount { get; set; }

    public virtual Document Document { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;
}
