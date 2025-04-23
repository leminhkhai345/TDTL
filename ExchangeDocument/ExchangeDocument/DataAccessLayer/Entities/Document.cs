using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Entities;

[Table("document")]
public partial class Document
{
    [Key]
    [Column("documentId")]
    public int DocumentId { get; set; }

    [Column("userId")]
    public int UserId { get; set; }

    [Column("categoryId")]
    public int CategoryId { get; set; }

    [Column("title")]
    [StringLength(255)]
    public string Title { get; set; } = null!;

    [Column("author")]
    [StringLength(255)]
    public string? Author { get; set; }

    [Column("ISBN")]
    [StringLength(20)]
    public string? Isbn { get; set; }

    [Column("edition")]
    [StringLength(100)]
    public string? Edition { get; set; }

    [Column("publicationYear")]
    public int? PublicationYear { get; set; }

    [Column("condition")]
    [StringLength(255)]
    public string? Condition { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("imageUrl")]
    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [Column("price", TypeName = "decimal(18, 2)")]
    public decimal Price { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [ForeignKey("CategoryId")]
    [InverseProperty("Documents")]
    public virtual Category Category { get; set; } = null!;

    [InverseProperty("Document")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [InverseProperty("Document")]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    [ForeignKey("UserId")]
    [InverseProperty("Documents")]
    public virtual User User { get; set; } = null!;
}
