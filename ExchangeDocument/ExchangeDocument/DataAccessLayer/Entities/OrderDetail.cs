using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.ModelFromDB;

[Table("orderDetails")]
public partial class OrderDetail
{
    [Key]
    [Column("orderDetailId")]
    public int OrderDetailId { get; set; }

    [Column("orderId")]
    public int? OrderId { get; set; }

    [Column("documentId")]
    public int? DocumentId { get; set; }

    [Column("quatity")]
    public int? Quatity { get; set; }

    [Column("amount")]
    public double? Amount { get; set; }

    [ForeignKey("DocumentId")]
    [InverseProperty("OrderDetails")]
    public virtual Document? Document { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("OrderDetails")]
    public virtual Order? Order { get; set; }
}
