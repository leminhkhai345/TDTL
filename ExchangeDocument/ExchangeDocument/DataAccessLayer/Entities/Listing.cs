using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.DataAccessLayer.Entities
{
    public class Listing
    {
        public int ListingId { get; set; }
        public int DocumentId { get; set; }
        public int OwnerId { get; set; }
        public int ListingType { get; set; } // 0=Sell,1=Exchange
        public decimal? Price { get; set; }
        public string? Description { get; set; }
        public int ListingStatusId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public string? RejectionReason { get; set; }

        // Navigation
        public virtual SystemStatus SystemStatus { get; set; } = null!;
        public virtual Document Document { get; set; } = null!;
        public virtual User Owner { get; set; } = null!;
        public virtual ICollection<ListingExchangeItem> ExchangeItems { get; set; } = new List<ListingExchangeItem>();
        public virtual ICollection<ListingPaymentMethod> ListingPaymentMethods { get; set; } = new List<ListingPaymentMethod>();
        [Timestamp]
        public byte[] RowVersion { get; set; } = null!;
    }
}
