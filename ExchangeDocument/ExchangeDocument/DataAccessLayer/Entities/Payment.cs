using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.ModelFromDB;

[Table("payments")]
public partial class Payment
{
    [Key]
    [Column("paymentId")]
    public int PaymentId { get; set; }

    [Column("paymentMethod")]
    [StringLength(255)]
    public string? PaymentMethod { get; set; }

    [Column("paymentDate", TypeName = "datetime")]
    public DateTime? PaymentDate { get; set; }

    [Column("orderId")]
    public int? OrderId { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("Payments")]
    public virtual Order? Order { get; set; }
}
