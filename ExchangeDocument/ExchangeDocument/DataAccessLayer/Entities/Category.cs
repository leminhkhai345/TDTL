using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Entities;

[Table("categories")]
[Index("CategoryName", Name = "UQ__categori__37077ABDAFCEF167", IsUnique = true)]
public partial class Category
{
    [Key]
    [Column("categoryId")]
    public int CategoryId { get; set; }

    [Column("categoryName")]
    [StringLength(255)]
    public string CategoryName { get; set; } = null!;

    [InverseProperty("Category")]
    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
}
