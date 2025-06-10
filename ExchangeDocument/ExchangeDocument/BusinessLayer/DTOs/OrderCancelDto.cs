using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs;

/// <summary>
/// DTO cho thao tác huỷ đơn (buyer/seller).
/// </summary>
public class OrderCancelDto
{
    /// <summary>
    /// Lý do huỷ (tối đa 500 ký tự).
    /// </summary>
    [Required]
    [StringLength(500)]
    public string Reason { get; set; } = string.Empty;

    /// <summary>
    /// RowVersion dùng để kiểm tra concurrency.
    /// </summary>
    [Required]
    public byte[] RowVersion { get; set; } = null!;
}
