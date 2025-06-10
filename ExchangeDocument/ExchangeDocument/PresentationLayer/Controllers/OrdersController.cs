using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Security.Claims;

namespace ExchangeDocument.PresentationLayer.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IWebHostEnvironment _env;

    public OrdersController(IOrderService orderService, IWebHostEnvironment env)
    {
        _orderService = orderService;
        _env = env;
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponseDto>> Create([FromBody] OrderCreateDto dto)
    {
        var buyerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _orderService.CreateOrderAsync(dto, buyerId);
        return CreatedAtAction(nameof(GetById), new { id = result.OrderId }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponseDto>> GetById(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _orderService.GetByIdAsync(id, userId);
        if (result == null) 
          return NotFound();
        return Ok(result);
    }

    [HttpPut("{id}/confirm")]
    public async Task<ActionResult<OrderResponseDto>> Accept(int id, [FromBody] OrderActionDto dto)
    {
        var sellerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _orderService.ConfirmOrderAsync(id, sellerId, dto);
        return Ok(result);
    }

    [HttpPut("{id}/reject")]
    public async Task<ActionResult<OrderResponseDto>> Reject(int id, [FromBody] OrderRejectDto dto)
    {
        var sellerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _orderService.RejectOrderAsync(id, sellerId, dto);
        return Ok(result);
    }

    [HttpPut("{id}/ship")]
    public async Task<ActionResult<OrderResponseDto>> Ship(int id, [FromBody] OrderShipmentDto dto)
    {
        var sellerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _orderService.ShipOrderAsync(id, sellerId, dto);
        return Ok(result);
    }

    [HttpPut("{id}/deliver")]
    public async Task<ActionResult<OrderResponseDto>> Deliver(int id, [FromBody] OrderActionDto dto)
    {
        var buyerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _orderService.DeliverOrderAsync(id, buyerId, dto);
        return Ok(result);
    }

    // Huỷ đơn (buyer hoặc seller)
    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<OrderResponseDto>> Cancel(int id, [FromBody] OrderCancelDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _orderService.CancelOrderAsync(id, userId, dto);
        return Ok(result);
    }

    // Buyer gửi minh chứng thanh toán (BankTransfer)
    [HttpPut("{id}/confirm-payment")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<OrderResponseDto>> ConfirmPayment(int id, [FromForm] PaymentProofUploadDto uploadDto)
    {
        var proof = uploadDto.Proof;
        if (proof == null || proof.Length == 0)
            return BadRequest("Proof image is required.");

        var buyerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        string? filePath = null;
        try
        {
            // Lưu file vào wwwroot/images
            var ext = Path.GetExtension(proof.FileName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var imagesDir = Path.Combine(_env.WebRootPath, "images");
            Directory.CreateDirectory(imagesDir);
            filePath = Path.Combine(imagesDir, fileName);
            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await proof.CopyToAsync(stream);
            }

            var publicUrl = $"/images/{fileName}"; // relative URL, client prepend host

            var dto = new OrderPaymentProofDto
            {
                ProofImageUrl = publicUrl,
                RowVersion = Convert.FromBase64String(uploadDto.RowVersion)
            };

            var result = await _orderService.ConfirmPaymentAsync(id, buyerId, dto);
            return Ok(result);
        }
        catch
        {
            // Xóa file nếu service ném lỗi
            if (filePath != null && System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
            throw;
        }
    }

    // Seller xác nhận đã nhận tiền
    [HttpPut("{id}/confirm-money")]
    public async Task<ActionResult<OrderResponseDto>> ConfirmMoney(int id, [FromBody] OrderActionDto dto)
    {
        var sellerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _orderService.ConfirmMoneyReceivedAsync(id, sellerId, dto);
        return Ok(result);
    }

    // Danh sách đơn hàng đã mua của buyer
    [HttpGet("my-purchases")]
    public async Task<ActionResult<PagedResult<OrderResponseDto>>> GetMyPurchases([FromQuery] OrderQueryParametersDto queryParams)
    {
        var buyerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _orderService.GetMyPurchasesAsync(buyerId, queryParams);
        return Ok(result);
    }

    // Danh sách đơn hàng đã bán của seller
    [HttpGet("my-sales")]
    public async Task<ActionResult<PagedResult<OrderResponseDto>>> GetMySales([FromQuery] OrderQueryParametersDto queryParams)
    {
        var sellerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _orderService.GetMySalesAsync(sellerId, queryParams);
        return Ok(result);
    }
}
