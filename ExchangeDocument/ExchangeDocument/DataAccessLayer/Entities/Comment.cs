using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.ModelFromDB;

[Table("comment")]
public partial class Comment
{
    [Key]
    [Column("commentId")]
    public int CommentId { get; set; }

    [Column("documentId")]
    public int? DocumentId { get; set; }

    [Column("content")]
    [StringLength(500)]
    public string? Content { get; set; }

    [Column("commentDate", TypeName = "datetime")]
    public DateTime? CommentDate { get; set; }

    [ForeignKey("DocumentId")]
    [InverseProperty("Comments")]
    public virtual Document? Document { get; set; }
}
