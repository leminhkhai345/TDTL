using ExchangeDocument.BusinessLayer.DTOs;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    public interface IListingService
    {
        /// <summary>
        /// Create a new listing for a document.
        /// Returns DTO on success or error message on failure.
        /// </summary>
        Task<(ListingDetailDto? dto, string? error)> CreateListingAsync(ListingCreateDto dto, int userId);

        /// <summary>
        /// Retrieve a listing detail by its Id.
        /// Returns DTO if found, otherwise null.
        /// </summary>
        Task<ListingDetailDto?> GetListingByIdAsync(int id);

        /// <summary>
        /// Admin endpoint: retrieve any listing by Id regardless of status.
        /// </summary>
        Task<ListingDetailDto?> AdminGetListingByIdAsync(int id);

        /// <summary>
        /// Admin: retrieve paginated listings with filtering and sorting.
        /// </summary>
        Task<PagedResult<AdminListingViewDto>> GetAdminListingsAsync(AdminListingQueryParametersDto queryParams);

        /// <summary>
        /// Update an existing listing.
        /// </summary>
        Task<(ListingDetailDto? dto, string? error)> UpdateListingAsync(int id, ListingUpdateDto dto, int userId);

        /// <summary>
        /// Retrieve current user's listings with pagination.
        /// </summary>
        Task<PagedResult<ListingDetailDto>> GetMyListingsAsync(int userId, int pageNumber, int pageSize);

        /// <summary>
        /// Retrieve paginated public (active) listings.
        /// </summary>
        Task<PagedResult<ListingSummaryDto>> GetPublicListingsAsync(int pageNumber, int pageSize);

        /// <summary>
        /// Soft-delete an existing listing. Returns null if success or error message on failure.
        /// </summary>
        Task<string?> DeleteListingAsync(int id, int userId, byte[] rowVersion);

        /// <summary>
        /// Admin: approve a pending listing with concurrency. Returns null on success or error message on failure.
        /// </summary>
        Task<string?> ApproveListingAsync(int id, byte[] rowVersion);

        /// <summary>
        /// Reject a pending listing with reason and concurrency. Returns null on success or error message on failure.
        /// </summary>
        Task<string?> RejectListingAsync(int id, string reason, byte[] rowVersion);
    }
}
