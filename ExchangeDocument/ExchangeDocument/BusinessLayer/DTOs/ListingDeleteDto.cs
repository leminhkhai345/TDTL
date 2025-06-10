using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class ListingDeleteDto
    {
        [Required]
        public byte[] RowVersion { get; set; } = null!;
    }
}
