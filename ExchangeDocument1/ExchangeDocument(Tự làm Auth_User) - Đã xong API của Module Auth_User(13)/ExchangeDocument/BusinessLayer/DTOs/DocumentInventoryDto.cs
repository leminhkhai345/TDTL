using System;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// DTO for listing a user's inventory (InStock and Listed documents).
    /// </summary>
    public class DocumentInventoryDto
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = null!;
        public decimal? Price { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public int DocumentStatusId { get; set; }
        public string StatusName { get; set; } = null!;
    }
}
