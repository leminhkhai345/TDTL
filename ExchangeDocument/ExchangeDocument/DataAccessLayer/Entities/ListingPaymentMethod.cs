namespace ExchangeDocument.DataAccessLayer.Entities
{
    public class ListingPaymentMethod
    {
        public int ListingId { get; set; }
        public int PaymentMethodId { get; set; }

        // Navigation
        public virtual Listing Listing { get; set; } = null!;
        public virtual PaymentMethod PaymentMethod { get; set; } = null!;
    }
}
