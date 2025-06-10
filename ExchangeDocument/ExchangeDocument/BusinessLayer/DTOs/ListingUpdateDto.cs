using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class ListingUpdateDto
    {
        /// <summary>Price for sell listings (null for exchange)</summary>
        public decimal? Price { get; set; }

        public string? Description { get; set; }
        /// <summary>IDs of desired documents for exchange listings</summary>
        public List<int>? DesiredDocumentIds { get; set; }
        // Accepted payment method ids (optional)
        public List<int>? PaymentMethodIds { get; set; }
        [Required]
        public byte[] RowVersion { get; set; } = null!;
    }
}
