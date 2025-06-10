using System;
using System.Collections.Generic;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class ListingDetailDto
    {
        public int ListingId { get; set; }
        public int DocumentId { get; set; }
        /// <summary>Title of the document being listed.</summary>
        public string DocumentTitle { get; set; } = string.Empty;
        /// <summary>Full name of the listing owner.</summary>
        public string OwnerName { get; set; } = string.Empty;
        public int OwnerId { get; set; }
        public int ListingType { get; set; }
        public decimal? Price { get; set; }
        public string? Description { get; set; }
        // Bổ sung thông tin tài liệu
        public string? Author { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int ListingStatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<int>? DesiredDocumentIds { get; set; }
        public List<PaymentMethodDto>? AcceptedPaymentMethods { get; set; }
        public byte[] RowVersion { get; set; } = null!;
    }
}
