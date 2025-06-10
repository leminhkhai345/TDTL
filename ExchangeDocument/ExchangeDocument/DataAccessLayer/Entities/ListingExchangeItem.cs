namespace ExchangeDocument.DataAccessLayer.Entities
{
    public class ListingExchangeItem
    {
        public int ExchangeItemId { get; set; }
        public int ListingId { get; set; }
        public int DesiredDocumentId { get; set; }
        
        // Navigation
        public virtual Listing Listing { get; set; } = null!;
        public virtual Document DesiredDocument { get; set; } = null!;
    }
}
