using System;
using System.Collections.Generic;
using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.BusinessLayer.DTOs;

public class ReviewDto
{
    public int ReviewId { get; set; }
    public int OrderId { get; set; }
    public int ReviewerId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public int ReviewedSellerId { get; set; }
    public string ReviewedSellerName { get; set; } = string.Empty;

    public string DocumentTitle { get; set; } = string.Empty;

    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public ReviewType ReviewType { get; set; }

    public List<ReviewEvidenceDto> Evidences { get; set; } = new();

    public DateTime ReviewDate { get; set; }

    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
