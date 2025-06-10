using System.Collections.Generic;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class ListingCreateDto
    {
        public int DocumentId { get; set; }
        // 0 = Sell, 1 = Exchange
        public int ListingType { get; set; }
        // Khi Sell: bắt buộc, >0; Exchange: null
        public decimal? Price { get; set; }
        public string? Description { get; set; }
        // Chỉ dùng khi ListingType == 1
        public List<int>? DesiredDocumentIds { get; set; }
        // Accepted payment method IDs (nullable => default COD)
        public List<int>? PaymentMethodIds { get; set; }
    }
}
