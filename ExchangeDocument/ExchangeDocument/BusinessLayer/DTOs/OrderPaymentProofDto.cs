using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs;

/// <summary>
/// DTO để Buyer gửi minh chứng thanh toán (BankTransfer).
/// </summary>
public class OrderPaymentProofDto
{
    [Required]
    [StringLength(1000)]
    public string ProofImageUrl { get; set; } = string.Empty;

    [Required]
    public byte[] RowVersion { get; set; } = null!;
}
