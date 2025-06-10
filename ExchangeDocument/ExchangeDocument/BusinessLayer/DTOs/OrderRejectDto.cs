using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs;

/// <summary>
/// DTO cho Seller từ chối đơn: cần RowVersion + lý do.
/// </summary>
public class OrderRejectDto
{
    [Required]
    public byte[] RowVersion { get; set; } = null!;

    [Required]
    [StringLength(500)]
    public string Reason { get; set; } = string.Empty;
}
