using System;
using System.Collections.Generic;

namespace ExchangeDocument.DataAccessLayer.Entities;

public partial class Review
{
    public int ReviewId { get; set; }

    public int DocumentId { get; set; }

    public int UserId { get; set; }

    public int? Rating { get; set; }

    public string? Content { get; set; }

    public DateTime ReviewDate { get; set; }

    public virtual Document Document { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
