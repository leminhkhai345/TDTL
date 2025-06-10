using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.DataAccessLayer.Entities;

public partial class Document
{
    public int DocumentId { get; set; }

    public int UserId { get; set; }

    public int CategoryId { get; set; }

    public string Title { get; set; } = null!;

    public string? Author { get; set; }

    public string? Isbn { get; set; }

    public string? Edition { get; set; }

    public int? PublicationYear { get; set; }

    public string? Condition { get; set; }

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public decimal? Price { get; set; }

    // --- Thời gian tạo & cập nhật ---
    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int StatusId { get; set; }

    public virtual SystemStatus SystemStatus { get; set; } = null!;

    public bool IsDeleted { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual User User { get; set; } = null!;

    /// Add concurrency token
    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
}
