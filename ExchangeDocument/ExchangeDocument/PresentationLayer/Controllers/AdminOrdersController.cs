using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ExchangeDocument.PresentationLayer.Controllers;

/// <summary>
/// Quản trị đơn hàng cho admin.
/// </summary>
[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>
    /// Lấy danh sách đơn hàng theo phân trang / lọc.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderResponseDto>>> Get([FromQuery] OrderQueryParametersDto queryParams)
    {
        var result = await _orderService.GetAdminOrdersAsync(queryParams);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết đơn hàng theo ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponseDto>> GetById(int id)
    {
        var result = await _orderService.GetByIdForAdminAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }
}
