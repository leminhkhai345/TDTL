using System;
using System.Collections.Generic;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// DTO for public listing summaries.
    /// </summary>
    public class ListingSummaryDto
    {
        public int ListingId { get; set; }
        public int DocumentId { get; set; }
        public string DocumentTitle { get; set; } = string.Empty;
        public decimal? Price { get; set; }
        public int ListingType { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        // Bổ sung thông tin tài liệu
        public string? Author { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public List<PaymentMethodDto>? AcceptedPaymentMethods { get; set; }
    }
}
