using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExchangeDocument.DataAccessLayer.Entities;

public partial class Review
{
    public int ReviewId { get; set; }

    public int OrderId { get; set; }

    public int ReviewerId { get; set; }

    // Unified rating and comment per order
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    public string Comment { get; set; } = string.Empty;

    // Type of review: constructive feedback or report violation
    public ReviewType ReviewType { get; set; } = ReviewType.Constructive;

    // Evidences (images / videos) attached for report violation reviews
    public virtual ICollection<ReviewEvidence> Evidences { get; set; } = new List<ReviewEvidence>();

    public DateTime ReviewDate { get; set; } = DateTime.UtcNow;

    public bool IsEdited { get; set; } = false;

    public DateTime? LastEditedDate { get; set; }

    public bool IsDeleted { get; set; } = false;

    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;

    // Navigation properties
    public virtual Order Order { get; set; } = null!;

    public virtual User Reviewer { get; set; } = null!;
}

public enum ReviewType
{
    Constructive,
    ReportViolation
}
