using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Entities;

[Table("orders")]
public partial class Order
{
    [Key]
    [Column("orderId")]
    public int OrderId { get; set; }

    [Column("userId")]
    public int UserId { get; set; }

    [Column("orderDate", TypeName = "datetime")]
    public DateTime OrderDate { get; set; }

    [Column("totalAmount", TypeName = "decimal(18, 2)")]
    public decimal TotalAmount { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("shippingAddress")]
    [StringLength(500)]
    public string? ShippingAddress { get; set; }

    [InverseProperty("Order")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [InverseProperty("Order")]
    public virtual Payment? Payment { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Orders")]
    public virtual User User { get; set; } = null!;
}
