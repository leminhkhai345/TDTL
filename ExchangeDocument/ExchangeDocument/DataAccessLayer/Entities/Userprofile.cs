using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.ModelFromDB;

[Table("userprofiles")]
public partial class Userprofile
{
    [Key]
    [Column("userprofileId")]
    public int UserprofileId { get; set; }

    [Column("birth", TypeName = "datetime")]
    public DateTime? Birth { get; set; }

    [Column("address")]
    [StringLength(255)]
    public string? Address { get; set; }

    [Column("userId")]
    public int? UserId { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Userprofiles")]
    public virtual User? User { get; set; }
}
