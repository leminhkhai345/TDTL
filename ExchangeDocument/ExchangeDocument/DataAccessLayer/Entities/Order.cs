using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.ModelFromDB;

[Table("orders")]
public partial class Order
{
    [Key]
    [Column("orderId")]
    public int OrderId { get; set; }

    [Column("userId")]
    public int? UserId { get; set; }

    [Column("orderDate", TypeName = "datetime")]
    public DateTime? OrderDate { get; set; }

    [Column("totalAmount")]
    public double? TotalAmount { get; set; }

    [InverseProperty("Order")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [InverseProperty("Order")]
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    [ForeignKey("UserId")]
    [InverseProperty("Orders")]
    public virtual User? User { get; set; }
}
