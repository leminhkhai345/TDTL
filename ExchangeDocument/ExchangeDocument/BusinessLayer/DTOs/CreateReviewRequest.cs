using Microsoft.CodeAnalysis;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class CreateReviewRequest
    {
        public int DocumentId { get; set; }
        public string content { get; set; }
    }
}
