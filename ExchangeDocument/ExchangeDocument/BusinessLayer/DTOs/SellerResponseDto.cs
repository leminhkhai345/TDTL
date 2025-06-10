using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs;

public class SellerResponseDto
{
    [Required]
    [MaxLength(1000)]
    public string Response { get; set; } = string.Empty;

    [Required]
    public byte[] RowVersion { get; set; } = null!;
}
