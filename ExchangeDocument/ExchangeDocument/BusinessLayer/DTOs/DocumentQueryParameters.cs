namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// Basic query parameters for pagination.
    /// </summary>
    public class DocumentQueryParameters
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10; // Default page size

        public int Page { get; set; } = 1; // Current page number (default: 1)

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value; // Ensure page size doesn't exceed max
        }
    }
}
