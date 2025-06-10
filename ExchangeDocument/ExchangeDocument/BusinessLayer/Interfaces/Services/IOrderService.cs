using ExchangeDocument.BusinessLayer.DTOs;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services;

public interface IOrderService
{
    Task<OrderResponseDto> CreateOrderAsync(OrderCreateDto dto, int buyerId);
    Task<OrderResponseDto?> GetByIdAsync(int orderId, int userId);
    Task<OrderResponseDto?> GetByIdForAdminAsync(int orderId);
    Task<OrderResponseDto> ConfirmOrderAsync(int orderId, int sellerId, OrderActionDto dto);
    Task<OrderResponseDto> RejectOrderAsync(int orderId, int sellerId, OrderRejectDto dto);
    Task<OrderResponseDto> ShipOrderAsync(int orderId, int sellerId, OrderShipmentDto dto);
    Task<OrderResponseDto> DeliverOrderAsync(int orderId, int buyerId, OrderActionDto dto);
    Task<OrderResponseDto> CancelOrderAsync(int orderId, int userId, OrderCancelDto dto);
    Task<OrderResponseDto> ConfirmPaymentAsync(int orderId, int buyerId, OrderPaymentProofDto dto);
    Task<OrderResponseDto> ConfirmMoneyReceivedAsync(int orderId, int sellerId, OrderActionDto dto);

    // Danh sách đơn hàng
    Task<PagedResult<OrderResponseDto>> GetMyPurchasesAsync(int buyerId, OrderQueryParametersDto queryParams);
    Task<PagedResult<OrderResponseDto>> GetMySalesAsync(int sellerId, OrderQueryParametersDto queryParams);
    Task<PagedResult<OrderResponseDto>> GetAdminOrdersAsync(OrderQueryParametersDto queryParams);
}
