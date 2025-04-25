using System.Runtime.InteropServices;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class ReviewResponse
    {
        public string Name { get; set; }
        public string Content { get; set; }
        public DateTime ReviewDate { get; set; }

    }
}
