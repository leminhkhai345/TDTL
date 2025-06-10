using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.DataAccessLayer.Entities;

public partial class Userprofile
{
    public int UserprofileId { get; set; }

    public DateTime? Birth { get; set; }

    public string? Address { get; set; }

    public int UserId { get; set; }

    // Bank Account Information
    [MaxLength(50)]
    public string? BankAccountNumber { get; set; }

    [MaxLength(100)]
    public string? BankAccountName { get; set; }

    [MaxLength(100)]
    public string? BankName { get; set; }

    [MaxLength(100)]
    public string? BankBranch { get; set; }

    public virtual User User { get; set; } = null!;
}
