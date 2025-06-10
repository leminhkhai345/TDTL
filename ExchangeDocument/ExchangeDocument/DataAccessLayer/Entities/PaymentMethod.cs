using System;
using System.Collections.Generic;

namespace ExchangeDocument.DataAccessLayer.Entities
{
    public class PaymentMethod
    {
        public int PaymentMethodId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual ICollection<ListingPaymentMethod> ListingPaymentMethods { get; set; } = new List<ListingPaymentMethod>();
    }
}
