namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// DTO for system status metadata
    /// </summary>
    public class SystemStatusDto
    {
        public int StatusId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
