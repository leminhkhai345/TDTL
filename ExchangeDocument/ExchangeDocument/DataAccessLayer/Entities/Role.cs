using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Entities;

[Table("roles")]
[Index("RoleName", Name = "UQ__roles__B19478610B0CF352", IsUnique = true)]
public partial class Role
{
    [Key]
    [Column("roleId")]
    public int RoleId { get; set; }

    [Column("roleName")]
    [StringLength(50)]
    public string RoleName { get; set; } = null!;

    [InverseProperty("Role")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
