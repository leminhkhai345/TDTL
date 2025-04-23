using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Entities;

[Table("payments")]
[Index("OrderId", Name = "UQ__payments__0809335C1A0B3CB5", IsUnique = true)]
public partial class Payment
{
    [Key]
    [Column("paymentId")]
    public int PaymentId { get; set; }

    [Column("orderId")]
    public int OrderId { get; set; }

    [Column("paymentMethod")]
    [StringLength(100)]
    public string PaymentMethod { get; set; } = null!;

    [Column("paymentDate")]
    public DateTime PaymentDate { get; set; }

    [Column("paymentStatus")]
    [StringLength(50)]
    public string PaymentStatus { get; set; } = null!;

    [Column("transactionId")]
    [StringLength(255)]
    public string? TransactionId { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("Payment")]
    public virtual Order Order { get; set; } = null!;
}
