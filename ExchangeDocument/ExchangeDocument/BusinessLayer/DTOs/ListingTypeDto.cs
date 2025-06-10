namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// DTO for listing type metadata
    /// </summary>
    public class ListingTypeDto
    {
        /// <summary>Numeric value of the enum (0=Sell,1=Exchange)</summary>
        public int Value { get; set; }
        /// <summary>Enum name as string</summary>
        public string Name { get; set; } = null!;
    }
}
