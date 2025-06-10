namespace ExchangeDocument.BusinessLayer.DTOs
{
    using System.ComponentModel.DataAnnotations;

    public class ListingRejectDto
    {
        [Required]
        [StringLength(500)]
        public string Reason { get; set; } = null!;

        [Required]
        public byte[] RowVersion { get; set; } = null!;
    }
}
