using System;
using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.DataAccessLayer.Entities;

public class ReviewEvidence
{
    public int ReviewEvidenceId { get; set; }

    public int ReviewId { get; set; }

    public string FileUrl { get; set; } = null!;

    public string FileType { get; set; } = null!; // image / video (mime or enum string)

    public DateTime UploadedDate { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; } = false;

    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;

    // Navigation
    public virtual Review Review { get; set; } = null!;
}
