namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// DTO for desired documents in a listing
    /// </summary>
    public class DesiredDocumentDto
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = string.Empty;
    }
}
