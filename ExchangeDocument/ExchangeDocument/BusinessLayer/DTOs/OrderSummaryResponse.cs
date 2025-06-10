namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class OrderSummaryResponse
    {
        public int OrderId { get; set; }
        public string? Buyer { get; set; }
        public string? Seller { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Status { get; set; }
    }
}
