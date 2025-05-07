using System;
using System.Collections.Generic;

namespace ExchangeDocument.DataAccessLayer.Entities;

public partial class Userprofile
{
    public int UserprofileId { get; set; }

    public DateTime? Birth { get; set; }

    public string? Address { get; set; }

    public int UserId { get; set; }

    public virtual User User { get; set; } = null!;
}
