using System;
using System.Collections.Generic;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// DTO for admin listing view
    /// </summary>
    public class AdminListingViewDto
    {
        public int ListingId { get; set; }
        public int DocumentId { get; set; }
        public string DocumentTitle { get; set; } = string.Empty;
        public int OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public int ListingType { get; set; }
        public decimal? Price { get; set; }
        public string? Description { get; set; }
        // Thông tin thêm của tài liệu
        public string? Author { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int ListingStatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string StatusCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? RejectionReason { get; set; }
        public byte[] RowVersion { get; set; } = null!;
        /// <summary>Desired documents for exchange listings</summary>
        public List<DesiredDocumentDto>? DesiredDocuments { get; set; }
        public List<PaymentMethodDto>? AcceptedPaymentMethods { get; set; }
    }
}
