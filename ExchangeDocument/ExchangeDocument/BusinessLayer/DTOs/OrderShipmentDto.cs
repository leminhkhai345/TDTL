namespace ExchangeDocument.BusinessLayer.DTOs;

using System.ComponentModel.DataAnnotations;

public class OrderShipmentDto
{
    public string? ShippingProvider { get; set; }
    public string? TrackingNumber { get; set; }
    /// <summary>
    /// RowVersion gốc của Order mà client đang thao tác (Base-64 khi ở JSON).
    /// </summary>
    [Required]
    public byte[] RowVersion { get; set; } = null!;
}
