using System.Collections.Generic;

namespace ExchangeDocument.DataAccessLayer.Entities
{
    public class SystemStatus
    {
        public int StatusId { get; set; }
        public string Domain { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public int SortOrder { get; set; }

        public ICollection<Listing> Listings { get; set; } = new List<Listing>();
        // Navigation for related documents
        public ICollection<Document> Documents { get; set; } = new List<Document>();
        
        // Future: Orders, Payments can reference SystemStatus as well
    }
}
