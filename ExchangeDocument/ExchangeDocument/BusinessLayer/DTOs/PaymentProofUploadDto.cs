using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ExchangeDocument.BusinessLayer.DTOs;

public class PaymentProofUploadDto
{
    [Required]
    public IFormFile Proof { get; set; } = null!;

    [Required]
    public string RowVersion { get; set; } = string.Empty;
}
