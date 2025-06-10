using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs;

/// <summary>
/// DTO cho thao tác đơn hàng cần truyền RowVersion để kiểm tra concurrency.
/// Dùng cho Accept (Seller xác nhận đơn).
/// </summary>
public class OrderActionDto
{
    /// <summary>
    /// RowVersion gốc của Order mà client nhận được (Base-64 trong JSON).
    /// </summary>
    [Required]
    public byte[] RowVersion { get; set; } = null!;
}
