namespace ExchangeDocument.BusinessLayer.DTOs;

using System.ComponentModel.DataAnnotations;
using ExchangeDocument.BusinessLayer.Enums;

/// <summary>
/// Tham số truy vấn khi lấy danh sách đơn hàng (buyer/seller hoặc admin).
/// </summary>
public class OrderQueryParametersDto
{
    private const int MaxPageSize = 50;

    private int _pageSize = 10;

    /// <summary>
    /// Trang hiện tại (bắt đầu từ 1)
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Page must be at least 1")]
    public int Page { get; set; } = 1;

    /// <summary>
    /// Số bản ghi mỗi trang (tối đa 50)
    /// </summary>
    [Range(1, MaxPageSize, ErrorMessage = "PageSize must be between 1 and 50")]
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }

    /// <summary>
    /// Mã trạng thái để lọc.
    /// </summary>
    public OrderStatusCode? StatusCode { get; set; }

    /// <summary>
    /// Trường cần sắp xếp. Mặc định OrderDate.
    /// </summary>
    public OrderSortBy SortBy { get; set; } = OrderSortBy.OrderDate;

    /// <summary>
    /// Hướng sắp xếp.
    /// </summary>
    public SortDirection SortOrder { get; set; } = SortDirection.Desc;
}
