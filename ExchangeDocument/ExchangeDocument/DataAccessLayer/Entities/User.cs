using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Entities;

[Table("users")]
[Index("Email", Name = "UQ__users__AB6E6164F1F6CF8D", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("userId")]
    public int UserId { get; set; }

    [Column("fullName")]
    [StringLength(255)]
    public string FullName { get; set; } = null!;

    [Column("email")]
    [StringLength(255)]
    public string Email { get; set; } = null!;

    [Column("password")]
    [StringLength(255)]
    public string Password { get; set; } = null!;

    [Column("phone")]
    [StringLength(20)]
    public string? Phone { get; set; }

    [Column("roleId")]
    public int RoleId { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();

    [InverseProperty("User")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [InverseProperty("User")]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    [ForeignKey("RoleId")]
    [InverseProperty("Users")]
    public virtual Role Role { get; set; } = null!;

    [InverseProperty("User")]
    public virtual Userprofile? Userprofile { get; set; }
}
