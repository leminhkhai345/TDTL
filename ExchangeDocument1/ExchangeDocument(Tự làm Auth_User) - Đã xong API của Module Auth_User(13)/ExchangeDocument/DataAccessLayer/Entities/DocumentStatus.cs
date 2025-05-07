using System.Collections.Generic;

namespace ExchangeDocument.DataAccessLayer.Entities
{
    public class DocumentStatus
    {
        public int DocumentStatusId { get; set; }
        public string Code { get; set; } = null!;  // e.g., InStock, Listed
        public string Name { get; set; } = null!;  // Display name

        // Navigation
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
    }
}
