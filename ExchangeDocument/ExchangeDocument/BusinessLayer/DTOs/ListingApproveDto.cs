using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class ListingApproveDto
    {
        [Required]
        public byte[] RowVersion { get; set; } = null!;
    }
}
