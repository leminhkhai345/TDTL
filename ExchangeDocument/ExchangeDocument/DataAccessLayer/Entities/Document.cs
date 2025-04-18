using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.ModelFromDB;

[Table("document")]
public partial class Document
{
    [Key]
    [Column("documentId")]
    public int DocumentId { get; set; }

    [Column("userId")]
    public int? UserId { get; set; }

    [Column("title")]
    [StringLength(255)]
    public string? Title { get; set; }

    [Column("price")]
    public double? Price { get; set; }

    [Column("author")]
    [StringLength(255)]
    public string? Author { get; set; }

    [Column("category")]
    [StringLength(255)]
    public string? Category { get; set; }

    [Column("img")]
    [StringLength(255)]
    public string? Img { get; set; }

    [InverseProperty("Document")]
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    [InverseProperty("Document")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [ForeignKey("UserId")]
    [InverseProperty("Documents")]
    public virtual User? User { get; set; }
}
