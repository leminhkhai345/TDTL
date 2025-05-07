using System.Collections.Generic;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; } // Total number of items matching the query (before pagination)
        public int Page { get; set; } // Current page number
        public int PageSize { get; set; } // Number of items per page
        public int TotalPages => (int)System.Math.Ceiling((double)TotalCount / PageSize); // Calculated total pages
    }
}
