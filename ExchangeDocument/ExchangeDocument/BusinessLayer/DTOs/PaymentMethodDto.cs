namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class PaymentMethodDto
    {
        public int PaymentMethodId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
    }
}
