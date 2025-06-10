using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs;

public class OrderCreateDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "ListingId must be positive.")]
    public int ListingId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "PaymentMethodId must be positive.")]
    public int PaymentMethodId { get; set; }

    [MaxLength(500)]
    public string? ShippingAddress { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
