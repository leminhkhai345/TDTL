using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs;

public class DeleteReviewDto
{
    [Required]
    public byte[] RowVersion { get; set; } = null!;
}
