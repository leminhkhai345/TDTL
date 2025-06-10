namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// Represents the response for the GetMyInventory API, including query parameters and paged results.
    /// </summary>
    public class DocumentInventoryResponseDto
    {
        /// <summary>
        /// The query parameters used to generate this result.
        /// </summary>
        public DocumentQueryParameters QueryParameters { get; set; } = null!;

        /// <summary>
        /// The paged list of document inventory items.
        /// </summary>
        public PagedResult<DocumentInventoryDto> Result { get; set; } = null!;
    }
}
