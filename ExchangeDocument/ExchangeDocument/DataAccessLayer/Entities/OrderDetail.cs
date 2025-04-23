using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Entities;

[Table("orderDetails")]
public partial class OrderDetail
{
    [Key]
    [Column("orderDetailId")]
    public int OrderDetailId { get; set; }

    [Column("orderId")]
    public int OrderId { get; set; }

    [Column("documentId")]
    public int DocumentId { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; }

    [Column("priceAtOrderTime", TypeName = "decimal(18, 2)")]
    public decimal PriceAtOrderTime { get; set; }

    [Column("amount", TypeName = "decimal(29, 2)")]
    public decimal? Amount { get; set; }

    [ForeignKey("DocumentId")]
    [InverseProperty("OrderDetails")]
    public virtual Document Document { get; set; } = null!;

    [ForeignKey("OrderId")]
    [InverseProperty("OrderDetails")]
    public virtual Order Order { get; set; } = null!;
}
