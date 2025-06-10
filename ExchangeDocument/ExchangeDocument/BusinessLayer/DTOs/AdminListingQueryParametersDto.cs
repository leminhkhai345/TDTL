using System;
using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// Query parameters for admin listing retrieval
    /// </summary>
    public class AdminListingQueryParametersDto
    {
        /// <summary>Page number (1-based)</summary>
        [Range(1, int.MaxValue, ErrorMessage = "PageNumber must be at least 1")]
        public int PageNumber { get; set; } = 1;
        /// <summary>Items per page</summary>
        // Limit PageSize to maximum of 50 items per page
        [Range(1, 50, ErrorMessage = "PageSize must be between 1 and 50")]
        public int PageSize { get; set; } = 10;
        /// <summary>Status code to filter (e.g., "Pending", "Active", "Rejected")</summary>
        public string? Status { get; set; }
        /// <summary>Field to sort by (e.g., "CreatedAt", "OwnerName")</summary>
        public string? SortBy { get; set; }
        /// <summary>Sort order: "asc" or "desc"</summary>
        public string? SortOrder { get; set; } = "desc";
    }
}
