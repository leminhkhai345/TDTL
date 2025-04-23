using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Entities;

[Table("reviews")]
public partial class Review
{
    [Key]
    [Column("reviewId")]
    public int ReviewId { get; set; }

    [Column("documentId")]
    public int DocumentId { get; set; }

    [Column("userId")]
    public int UserId { get; set; }

    [Column("rating")]
    public int? Rating { get; set; }

    [Column("content")]
    [StringLength(1000)]
    public string? Content { get; set; }

    [Column("reviewDate", TypeName = "datetime")]
    public DateTime ReviewDate { get; set; }

    [ForeignKey("DocumentId")]
    [InverseProperty("Reviews")]
    public virtual Document Document { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("Reviews")]
    public virtual User User { get; set; } = null!;
}
