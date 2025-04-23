using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Entities;

[Table("userprofiles")]
[Index("UserId", Name = "UQ__userprof__CB9A1CFE232306E5", IsUnique = true)]
public partial class Userprofile
{
    [Key]
    [Column("userprofileId")]
    public int UserprofileId { get; set; }

    [Column("birth", TypeName = "datetime")]
    public DateTime? Birth { get; set; }

    [Column("address")]
    [StringLength(500)]
    public string? Address { get; set; }

    [Column("userId")]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Userprofile")]
    public virtual User User { get; set; } = null!;
}
