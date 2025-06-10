using System.ComponentModel;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class OrderSummaryRequest
    {
        [Description("Mã đơn hàng")] public int OrderId { get; set; }
    }
}
    