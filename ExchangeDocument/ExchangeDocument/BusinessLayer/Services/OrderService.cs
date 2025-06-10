using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using ExchangeDocument.Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using Serilog;
using ExchangeDocument.BusinessLayer.Enums;
using ILogger = Serilog.ILogger;

namespace ExchangeDocument.BusinessLayer.Services;

public class OrderService : IOrderService
{
    private readonly ExchangeDocumentContext _context;
    private readonly INotificationService _notificationService;
    private readonly ISystemStatusRepository _statusRepo;
    private readonly ILogger _logger = Log.ForContext<OrderService>();

    public OrderService(ExchangeDocumentContext context, INotificationService notificationService, ISystemStatusRepository statusRepo)
    {
        _context = context;
        _notificationService = notificationService;
        _statusRepo = statusRepo;
    }

    public async Task<OrderResponseDto> CreateOrderAsync(OrderCreateDto dto, int buyerId)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Load listing with rowversion
            var listing = await _context.Listings
                .Include(l => l.SystemStatus)
                .Include(l => l.ListingPaymentMethods)
                    .ThenInclude(lp => lp.PaymentMethod)
                .FirstOrDefaultAsync(l => l.ListingId == dto.ListingId && !l.IsDeleted);
            if (listing == null)
                throw new NotFoundException("Listing not found.");

            if (listing.OwnerId == buyerId)
                throw new ValidationException("You cannot buy your own listing.");

            if (listing.SystemStatus.Domain != "Listing" || listing.SystemStatus.Code != "Active")
                throw new ValidationException("Listing is not available for purchase.");

            if (listing.Price == null)
                throw new ValidationException("Listing price is not set.");

            // Validate payment method
            var allowedMethods = listing.ListingPaymentMethods.Select(lp => lp.PaymentMethodId).ToList();

            // If listing has exactly 1 allowed method -> force buyer to use it
            if (allowedMethods.Count == 1 && dto.PaymentMethodId != allowedMethods[0])
                throw new ValidationException("Payment method not allowed for this listing.");

            // If listing has >1 allowed OR 0 allowed => buyer must choose a method which is enabled (and in list if any)
            if (!_context.PaymentMethods.Any(pm => pm.PaymentMethodId == dto.PaymentMethodId && pm.IsEnabled))
                throw new ValidationException("Payment method not found or disabled.");

            if (allowedMethods.Any() && !allowedMethods.Contains(dto.PaymentMethodId))
                throw new ValidationException("Payment method not allowed for this listing.");

            // 2. Lookup statuses
            var orderPending = await _statusRepo.GetByDomainAndCodeAsync("Order", "PendingSellerConfirmation") ??
                                throw new Exception("Status PendingSellerConfirmation missing.");
            var listingReserved = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Reserved") ??
                                throw new Exception("Status Reserved missing.");
            var docPending = await _statusRepo.GetByDomainAndCodeAsync("Document", "PendingSale");

            // 3. Build order
            var order = new Order
            {
                BuyerId = buyerId,
                SellerId = listing.OwnerId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = listing.Price.Value,
                OrderStatusId = orderPending.StatusId,
                ShippingAddress = dto.ShippingAddress,
                Notes = dto.Notes,
                PaymentMethodId = dto.PaymentMethodId,
                OrderDetails = new List<OrderDetail>
                {
                    new OrderDetail
                    {
                        ListingId = listing.ListingId,
                        DocumentId = listing.DocumentId,
                        Quantity = 1,
                        PriceAtOrderTime = listing.Price.Value
                    }
                }
            };
            _context.Orders.Add(order);

            // 4. Update listing
            listing.ListingStatusId = listingReserved.StatusId;
            listing.UpdatedAt = DateTime.UtcNow;

            // (optional) update document status
            if (docPending != null)
            {
                var doc = await _context.Documents.FirstAsync(d => d.DocumentId == listing.DocumentId);
                doc.StatusId = docPending.StatusId;
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            // 5. Notify seller
            await _notificationService.CreateNotificationAsync(listing.OwnerId, new NotificationCreateDto
            {
                Message = $"You have a new order #{order.OrderId}",
                Link = $"/orders/{order.OrderId}",
                ReferenceId = order.OrderId,
                NotificationType = "OrderCreated"
            });

            _logger.Information("Order {OrderId} created by {BuyerId}", order.OrderId, buyerId);

            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                SellerId = order.SellerId,
                ListingId = listing.ListingId,
                TotalAmount = order.TotalAmount,
                OrderStatus = orderPending.Name,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                Notes = order.Notes,
                PaymentMethodId = order.PaymentMethodId,
                PaymentMethodName = (await _context.PaymentMethods.FindAsync(order.PaymentMethodId))?.Name,
                RowVersion = order.RowVersion
            };
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await tx.RollbackAsync();
            _logger.Warning(ex, "Concurrency conflict while creating order by {BuyerId}", buyerId);
            throw new ConcurrencyException("Order was modified by another user. Please reload and try again.", errorCode: "CONCURRENCY_CONFLICT");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderResponseDto?> GetByIdAsync(int orderId, int userId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderStatus)
            .Include(o => o.OrderDetails)
            .Include(o => o.PaymentMethod)
            .FirstOrDefaultAsync(o => o.OrderId == orderId && (o.BuyerId == userId || o.SellerId == userId));
        if (order == null) return null;
        return new OrderResponseDto
        {
            OrderId = order.OrderId,
            BuyerId = order.BuyerId,
            SellerId = order.SellerId,
            ListingId = order.OrderDetails.First().ListingId,
            TotalAmount = order.TotalAmount,
            OrderStatus = order.OrderStatus.Name,
            OrderDate = order.OrderDate,
            ShippingAddress = order.ShippingAddress,
            Notes = order.Notes,
            PaymentMethodId = order.PaymentMethodId,
            PaymentMethodName = order.PaymentMethod?.Name,
            RowVersion = order.RowVersion
        };
    }

    public async Task<OrderResponseDto> ConfirmOrderAsync(int orderId, int sellerId, OrderActionDto dto)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderStatus)
                .Include(o => o.PaymentMethod)
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new NotFoundException("Order not found.");

            if (order.SellerId != sellerId)
                throw new ForbiddenException("You are not the seller of this order.");

            if (order.OrderStatus.Domain != "Order" || order.OrderStatus.Code != "PendingSellerConfirmation")
                throw new ValidationException("Order is not awaiting seller confirmation.", errorCode: "INVALID_ORDER_STATUS");

            // concurrency check
            _context.Entry(order).Property(o => o.RowVersion).OriginalValue = dto.RowVersion;

            var newStatusCode = order.PaymentMethod.Name == "BankTransfer" ? "AwaitingOfflinePayment" : "PendingShipment";
            var newStatus = await _statusRepo.GetByDomainAndCodeAsync("Order", newStatusCode)
                          ?? throw new InvalidOperationException($"System status '{newStatusCode}' not configured.");

            order.OrderStatusId = newStatus.StatusId;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            await _notificationService.CreateNotificationsByTemplateAsync(new[] { order.BuyerId }, NotificationTemplate.OrderAccepted, order.OrderId);

            _logger.Information("Order {OrderId} accepted by seller {SellerId}", order.OrderId, sellerId);

            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                SellerId = order.SellerId,
                ListingId = order.OrderDetails.First().ListingId,
                TotalAmount = order.TotalAmount,
                OrderStatus = newStatus.Name,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                Notes = order.Notes,
                PaymentMethodId = order.PaymentMethodId,
                PaymentMethodName = order.PaymentMethod.Name,
                RowVersion = order.RowVersion
            };
        }
        catch (DbUpdateConcurrencyException)
        {
            await tx.RollbackAsync();
            throw new ConcurrencyException("Order was modified by another user. Please reload and try again.", errorCode: "CONCURRENCY_CONFLICT");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderResponseDto> DeliverOrderAsync(int orderId, int buyerId, OrderActionDto dto)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderStatus)
                .Include(o => o.OrderDetails)
                .Include(o => o.PaymentMethod)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new KeyNotFoundException("Order not found.");

            if (order.BuyerId != buyerId)
                throw new ForbiddenException("You are not the buyer of this order.");

            if (order.OrderStatus.Domain != "Order" || order.OrderStatus.Code != "Shipped")
                throw new ValidationException("Order is not in shipped status.", errorCode: "ORDER_NOT_SHIPPED");

            // concurrency check
            _context.Entry(order).Property(o => o.RowVersion).OriginalValue = dto.RowVersion;

            var deliveredStatus = await _statusRepo.GetByDomainAndCodeAsync("Order", "Delivered")
                                ?? throw new InvalidOperationException("System status 'Delivered' not configured.");
            var completedStatus = await _statusRepo.GetByDomainAndCodeAsync("Order", "Completed");

            SystemStatus finalStatus;
            if (order.PaymentMethod?.Name == "BankTransfer")
            {
                if (completedStatus == null)
                    throw new InvalidOperationException("System status 'Completed' not configured.");
                order.OrderStatusId = completedStatus.StatusId;
                finalStatus = completedStatus;
            }
            else // COD
            {
                order.OrderStatusId = deliveredStatus.StatusId;
                finalStatus = deliveredStatus;
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            await _notificationService.CreateNotificationAsync(order.SellerId, new NotificationCreateDto
            {
                Message = order.PaymentMethod?.Name == "BankTransfer"
                    ? $"Buyer has confirmed receipt of order #{order.OrderId}. Order is now completed."
                    : $"Buyer has confirmed delivery for order #{order.OrderId}.",
                Link = $"/orders/{order.OrderId}",
                ReferenceId = order.OrderId,
                NotificationType = "OrderDelivered"
            });

            _logger.Information("Order {OrderId} delivered/completed by buyer {BuyerId}", order.OrderId, buyerId);

            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                SellerId = order.SellerId,
                ListingId = order.OrderDetails.First().ListingId,
                TotalAmount = order.TotalAmount,
                OrderStatus = finalStatus.Name,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                Notes = order.Notes,
                ShippingProvider = order.ShippingProvider,
                TrackingNumber = order.TrackingNumber,
                RowVersion = order.RowVersion
            };
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await tx.RollbackAsync();
            _logger.Warning(ex, "Concurrency conflict while delivering order {OrderId} by buyer {BuyerId}", orderId, buyerId);
            throw new ConcurrencyException("Order was modified by another user. Please reload and try again.", errorCode: "CONCURRENCY_CONFLICT");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderResponseDto> RejectOrderAsync(int orderId, int sellerId, OrderRejectDto dto)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderStatus)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Listing)
                        .ThenInclude(l => l.Document)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new NotFoundException("Order not found.");

            if (order.SellerId != sellerId)
                throw new ForbiddenException("You are not the seller of this order.");

            if (order.OrderStatus.Domain != "Order" || order.OrderStatus.Code != "PendingSellerConfirmation")
                throw new ValidationException("Order is not awaiting seller confirmation.", errorCode: "INVALID_ORDER_STATUS");

            _context.Entry(order).Property(o => o.RowVersion).OriginalValue = dto.RowVersion;

            var rejectedStatus = await _statusRepo.GetByDomainAndCodeAsync("Order", "RejectedBySeller")
                                ?? throw new InvalidOperationException("System status 'RejectedBySeller' not configured.");

            var listingActive = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Active")
                                ?? throw new InvalidOperationException("System status 'Active' for Listing not configured.");
            var documentListed = await _statusRepo.GetByDomainAndCodeAsync("Document", "Listed");

            var listing = order.OrderDetails.First().Listing;

            order.OrderStatusId = rejectedStatus.StatusId;
            order.RejectionReason = dto.Reason;

            // Giải phóng listing
            listing.ListingStatusId = listingActive.StatusId;
            if (documentListed != null)
                listing.Document.StatusId = documentListed.StatusId;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            await _notificationService.CreateNotificationsByTemplateAsync(new[] { order.BuyerId }, NotificationTemplate.OrderRejected, order.OrderId);

            _logger.Information("Order {OrderId} rejected by seller {SellerId}", order.OrderId, sellerId);

            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                SellerId = order.SellerId,
                ListingId = listing.ListingId,
                TotalAmount = order.TotalAmount,
                OrderStatus = rejectedStatus.Name,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                Notes = order.Notes,
                RejectionReason = order.RejectionReason,
                RowVersion = order.RowVersion
            };
        }
        catch (DbUpdateConcurrencyException)
        {
            await tx.RollbackAsync();
            throw new ConcurrencyException("Order was modified by another user. Please reload and try again.", errorCode: "CONCURRENCY_CONFLICT");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderResponseDto> ShipOrderAsync(int orderId, int sellerId, OrderShipmentDto dto)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderStatus)
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new KeyNotFoundException("Order not found.");

            if (order.SellerId != sellerId)
                throw new ForbiddenException("You are not the seller of this order.");

            if (order.OrderStatus.Domain != "Order" || order.OrderStatus.Code != "PendingShipment")
                throw new ValidationException("Order is not ready for shipment.", errorCode: "ORDER_NOT_READY_FOR_SHIPMENT");

            // concurrency check
            _context.Entry(order).Property(o => o.RowVersion).OriginalValue = dto.RowVersion;

            var shippedStatus = await _statusRepo.GetByDomainAndCodeAsync("Order", "Shipped")
                                ?? throw new InvalidOperationException("System status 'Shipped' not configured.");

            order.OrderStatusId = shippedStatus.StatusId;
            order.ShippingProvider = dto.ShippingProvider;
            order.TrackingNumber = dto.TrackingNumber;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            await _notificationService.CreateNotificationAsync(order.BuyerId, new NotificationCreateDto
            {
                Message = $"Your order #{order.OrderId} has been shipped.",
                Link = $"/orders/{order.OrderId}",
                ReferenceId = order.OrderId,
                NotificationType = "OrderShipped"
            });

            _logger.Information("Order {OrderId} shipped by seller {SellerId}", order.OrderId, sellerId);

            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                SellerId = order.SellerId,
                ListingId = order.OrderDetails.First().ListingId,
                TotalAmount = order.TotalAmount,
                OrderStatus = shippedStatus.Name,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                Notes = order.Notes,
                ShippingProvider = order.ShippingProvider,
                TrackingNumber = order.TrackingNumber,
                RowVersion = order.RowVersion
            };
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await tx.RollbackAsync();
            _logger.Warning(ex, "Concurrency conflict while shipping order {OrderId} by seller {SellerId}", orderId, sellerId);
            throw new ConcurrencyException("Order was modified by another user. Please reload and try again.", errorCode: "CONCURRENCY_CONFLICT");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderResponseDto> CancelOrderAsync(int orderId, int userId, OrderCancelDto dto)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderStatus)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Listing)
                        .ThenInclude(l => l.Document)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new NotFoundException("Order not found.");

            var isBuyer = order.BuyerId == userId;
            var isSeller = order.SellerId == userId;

            if (!isBuyer && !isSeller)
                throw new ForbiddenException("You are not allowed to cancel this order.");

            var allowedCodes = isBuyer
                ? new[] { "PendingSellerConfirmation", "AwaitingOfflinePayment", "PendingShipment" }
                : new[] { "AwaitingOfflinePayment", "PendingShipment" }; // Seller không được huỷ ở PendingSellerConfirmation, phải dùng Reject

            if (order.OrderStatus.Domain != "Order" || !allowedCodes.Contains(order.OrderStatus.Code))
                throw new ValidationException("Order cannot be cancelled in its current status.", errorCode: "INVALID_ORDER_STATUS");

            // concurrency check
            _context.Entry(order).Property(o => o.RowVersion).OriginalValue = dto.RowVersion;

            var cancelStatusCode = isBuyer ? "CancelledByBuyer" : "CancelledBySeller";
            var cancelledStatus = await _statusRepo.GetByDomainAndCodeAsync("Order", cancelStatusCode)
                                  ?? throw new InvalidOperationException($"System status '{cancelStatusCode}' not configured.");

            var listingActive = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Active")
                                  ?? throw new InvalidOperationException("System status 'Active' for Listing not configured.");
            var documentListed = await _statusRepo.GetByDomainAndCodeAsync("Document", "Listed");

            var listing = order.OrderDetails.First().Listing;

            order.OrderStatusId = cancelledStatus.StatusId;
            order.CancellationReason = dto.Reason;

            // Giải phóng listing
            listing.ListingStatusId = listingActive.StatusId;
            if (documentListed != null)
                listing.Document.StatusId = documentListed.StatusId;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            // Notify other party
            var notifyTo = isBuyer ? order.SellerId : order.BuyerId;
            await _notificationService.CreateNotificationAsync(notifyTo, new NotificationCreateDto
            {
                Message = $"Order #{order.OrderId} has been cancelled.",
                Link = $"/orders/{order.OrderId}",
                ReferenceId = order.OrderId,
                NotificationType = "OrderCancelled"
            });

            _logger.Information("Order {OrderId} cancelled by user {UserId}", order.OrderId, userId);

            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                SellerId = order.SellerId,
                ListingId = listing.ListingId,
                TotalAmount = order.TotalAmount,
                OrderStatus = cancelledStatus.Name,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                Notes = order.Notes,
                CancellationReason = order.CancellationReason,
                RowVersion = order.RowVersion
            };
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await tx.RollbackAsync();
            _logger.Warning(ex, "Concurrency conflict while cancelling order {OrderId} by user {UserId}", orderId, userId);
            throw new ConcurrencyException("Order was modified by another user. Please reload and try again.", errorCode: "CONCURRENCY_CONFLICT");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderResponseDto> ConfirmPaymentAsync(int orderId, int buyerId, OrderPaymentProofDto dto)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderStatus)
                .Include(o => o.PaymentMethod)
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new NotFoundException("Order not found.");

            if (order.BuyerId != buyerId)
                throw new ForbiddenException("You are not the buyer of this order.");

            if (order.PaymentMethod.Name != "BankTransfer")
                throw new ValidationException("This order does not require offline bank transfer.");

            if (order.OrderStatus.Domain != "Order" || order.OrderStatus.Code != "AwaitingOfflinePayment")
                throw new ValidationException("Order is not awaiting offline payment.", errorCode: "INVALID_ORDER_STATUS");

            // concurrency check
            _context.Entry(order).Property(o => o.RowVersion).OriginalValue = dto.RowVersion;

            order.ProofImageUrl = dto.ProofImageUrl;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            // Thông báo cho seller kiểm tra tiền
            await _notificationService.CreateNotificationAsync(order.SellerId, new NotificationCreateDto
            {
                Message = $"Buyer has uploaded payment proof for order #{order.OrderId}.",
                Link = $"/orders/{order.OrderId}",
                ReferenceId = order.OrderId,
                NotificationType = "PaymentProofUploaded"
            });

            _logger.Information("Buyer {BuyerId} uploaded payment proof for order {OrderId}", buyerId, order.OrderId);

            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                SellerId = order.SellerId,
                ListingId = order.OrderDetails.First().ListingId,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus.Name,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                Notes = order.Notes,
                PaymentMethodId = order.PaymentMethodId,
                PaymentMethodName = order.PaymentMethod.Name,
                ProofImageUrl = order.ProofImageUrl,
                RowVersion = order.RowVersion
            };
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await tx.RollbackAsync();
            _logger.Warning(ex, "Concurrency conflict while uploading payment proof for order {OrderId} by buyer {BuyerId}", orderId, buyerId);
            throw new ConcurrencyException("Order was modified by another user. Please reload and try again.", errorCode: "CONCURRENCY_CONFLICT");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderResponseDto> ConfirmMoneyReceivedAsync(int orderId, int sellerId, OrderActionDto dto)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderStatus)
                .Include(o => o.PaymentMethod)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Listing)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new NotFoundException("Order not found.");

            if (order.SellerId != sellerId)
                throw new ForbiddenException("You are not the seller of this order.");

            // Kiểm tra cạnh tranh
            _context.Entry(order).Property(o => o.RowVersion).OriginalValue = dto.RowVersion;

            // Hàm tiện ích tạo DTO trả về
            OrderResponseDto BuildResponse(SystemStatus newStatus) => new()
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                SellerId = order.SellerId,
                ListingId = order.OrderDetails.First().ListingId,
                TotalAmount = order.TotalAmount,
                OrderStatus = newStatus.Name,
                OrderDate = order.OrderDate,
                ShippingAddress = order.ShippingAddress,
                Notes = order.Notes,
                PaymentMethodId = order.PaymentMethodId,
                PaymentMethodName = order.PaymentMethod.Name,
                ProofImageUrl = order.ProofImageUrl,
                RowVersion = order.RowVersion
            };                

            if (order.PaymentMethod.Name == "BankTransfer")
            {
                // Điều kiện hợp lệ
                if (order.OrderStatus.Domain != "Order" || order.OrderStatus.Code != "AwaitingOfflinePayment")
                    throw new ValidationException("Order is not awaiting offline payment.", errorCode: "INVALID_ORDER_STATUS_BT");

                if (string.IsNullOrEmpty(order.ProofImageUrl))
                    throw new ValidationException("Buyer has not uploaded payment proof yet.", errorCode: "MISSING_PAYMENT_PROOF");

                var pendingShipmentStatus = await _statusRepo.GetByDomainAndCodeAsync("Order", "PendingShipment")
                                             ?? throw new InvalidOperationException("System status 'PendingShipment' not configured.");

                order.OrderStatusId = pendingShipmentStatus.StatusId;

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                // Thông báo cho người mua
                await _notificationService.CreateNotificationAsync(order.BuyerId, new NotificationCreateDto
                {
                    Message = $"Seller has confirmed receipt of your payment for order #{order.OrderId}. Your order is being prepared for shipment.",
                    Link = $"/orders/{order.OrderId}",
                    ReferenceId = order.OrderId,
                    NotificationType = "PaymentConfirmed_BankTransfer"
                });

                _logger.Information("Seller {SellerId} confirmed BankTransfer payment for order {OrderId}", sellerId, order.OrderId);

                return BuildResponse(pendingShipmentStatus);
            }
            else if (order.PaymentMethod.Name == "COD")
            {
                // Điều kiện hợp lệ
                if (order.OrderStatus.Domain != "Order" || order.OrderStatus.Code != "Delivered")
                    throw new ValidationException("Order must be in Delivered state to settle COD payment.", errorCode: "INVALID_ORDER_STATUS_COD");

                var completedStatus = await _statusRepo.GetByDomainAndCodeAsync("Order", "Completed")
                                         ?? throw new InvalidOperationException("System status 'Completed' not configured.");
                var soldListingStatus = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Sold")
                                          ?? throw new InvalidOperationException("System status 'Listing.Sold' not configured.");
                var soldDocumentStatus = await _statusRepo.GetByDomainAndCodeAsync("Document", "Sold"); // optional

                // Cập nhật Order
                order.OrderStatusId = completedStatus.StatusId;

                // Cập nhật Listing & Document liên quan
                foreach (var detail in order.OrderDetails)
                {
                    if (detail.Listing != null)
                    {
                        detail.Listing.ListingStatusId = soldListingStatus.StatusId;
                        var document = await _context.Documents.FindAsync(detail.Listing.DocumentId);
                        if (document != null)
                            document.StatusId = soldDocumentStatus.StatusId;
                    }
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                // Thông báo cho người mua
                await _notificationService.CreateNotificationAsync(order.BuyerId, new NotificationCreateDto
                {
                    Message = $"Seller has confirmed settlement of COD payment for order #{order.OrderId}. The order is now completed.",
                    Link = $"/orders/{order.OrderId}",
                    ReferenceId = order.OrderId,
                    NotificationType = "PaymentConfirmed_COD"
                });

                _logger.Information("Seller {SellerId} settled COD payment for order {OrderId}", sellerId, order.OrderId);

                return BuildResponse(completedStatus);
            }
            else
            {
                throw new ValidationException("Unsupported payment method for this action.");
            }
        }
        catch (DbUpdateConcurrencyException ex)
        {
            await tx.RollbackAsync();
            _logger.Warning(ex, "Concurrency conflict while seller confirming money for order {OrderId}", orderId);
            throw new ConcurrencyException("Order was modified by another user. Please reload and try again.", errorCode: "CONCURRENCY_CONFLICT");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    // --- Danh sách đơn hàng / Admin detail (stub implementation) ---

    public async Task<OrderResponseDto?> GetByIdForAdminAsync(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderStatus)
            .Include(o => o.OrderDetails)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (order == null) return null;

        return new OrderResponseDto
        {
            OrderId = order.OrderId,
            BuyerId = order.BuyerId,
            SellerId = order.SellerId,
            ListingId = order.OrderDetails.First().ListingId,
            TotalAmount = order.TotalAmount,
            OrderStatus = order.OrderStatus.Name,
            OrderDate = order.OrderDate,
            ShippingAddress = order.ShippingAddress,
            Notes = order.Notes,
            RowVersion = order.RowVersion
        };
    }

    public async Task<PagedResult<OrderResponseDto>> GetMyPurchasesAsync(int buyerId, OrderQueryParametersDto queryParams)
    {
        var query = _context.Orders
            .AsNoTracking()
            .Include(o => o.OrderStatus)
            .Include(o => o.OrderDetails)
            .Where(o => o.BuyerId == buyerId);

        // Filter by status code (enum)
        if (queryParams.StatusCode.HasValue)
        {
            var code = queryParams.StatusCode.Value.ToString();
            query = query.Where(o => o.OrderStatus.Code == code);
        }

        var totalCount = await query.CountAsync();

        // Sorting
        var sortDesc = queryParams.SortOrder == SortDirection.Desc;
        query = queryParams.SortBy switch
        {
            OrderSortBy.TotalAmount => sortDesc ? query.OrderByDescending(o => o.TotalAmount) : query.OrderBy(o => o.TotalAmount),
            _ => sortDesc ? query.OrderByDescending(o => o.OrderDate) : query.OrderBy(o => o.OrderDate),
        };

        var items = await query
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync();

        var dtos = items.Select(o => new OrderResponseDto
        {
            OrderId = o.OrderId,
            BuyerId = o.BuyerId,
            SellerId = o.SellerId,
            ListingId = o.OrderDetails.First().ListingId,
            TotalAmount = o.TotalAmount,
            OrderStatus = o.OrderStatus.Name,
            OrderDate = o.OrderDate,
            RowVersion = o.RowVersion
        });

        return new PagedResult<OrderResponseDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize
        };
    }

    public async Task<PagedResult<OrderResponseDto>> GetMySalesAsync(int sellerId, OrderQueryParametersDto queryParams)
    {
        var query = _context.Orders
            .AsNoTracking()
            .Include(o => o.OrderStatus)
            .Include(o => o.OrderDetails)
            .Where(o => o.SellerId == sellerId);

        // Filter by status code (enum)
        if (queryParams.StatusCode.HasValue)
        {
            var code = queryParams.StatusCode.Value.ToString();
            query = query.Where(o => o.OrderStatus.Code == code);
        }

        var totalCount = await query.CountAsync();

        var sortDesc = queryParams.SortOrder == SortDirection.Desc;
        query = queryParams.SortBy switch
        {
            OrderSortBy.TotalAmount => sortDesc ? query.OrderByDescending(o => o.TotalAmount) : query.OrderBy(o => o.TotalAmount),
            _ => sortDesc ? query.OrderByDescending(o => o.OrderDate) : query.OrderBy(o => o.OrderDate),
        };

        var items = await query
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync();

        var dtos = items.Select(o => new OrderResponseDto
        {
            OrderId = o.OrderId,
            BuyerId = o.BuyerId,
            SellerId = o.SellerId,
            ListingId = o.OrderDetails.First().ListingId,
            TotalAmount = o.TotalAmount,
            OrderStatus = o.OrderStatus.Name,
            OrderDate = o.OrderDate,
            RowVersion = o.RowVersion
        });

        return new PagedResult<OrderResponseDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize
        };
    }

    public async Task<PagedResult<OrderResponseDto>> GetAdminOrdersAsync(OrderQueryParametersDto queryParams)
    {
        var query = _context.Orders
            .AsNoTracking()
            .Include(o => o.OrderStatus)
            .Include(o => o.OrderDetails)
            .AsQueryable();

        // Filter by status code (enum)
        if (queryParams.StatusCode.HasValue)
        {
            var code = queryParams.StatusCode.Value.ToString();
            query = query.Where(o => o.OrderStatus.Code == code);
        }

        var totalCount = await query.CountAsync();

        var sortDesc = queryParams.SortOrder == SortDirection.Desc;
        query = queryParams.SortBy switch
        {
            OrderSortBy.TotalAmount => sortDesc ? query.OrderByDescending(o => o.TotalAmount) : query.OrderBy(o => o.TotalAmount),
            _ => sortDesc ? query.OrderByDescending(o => o.OrderDate) : query.OrderBy(o => o.OrderDate),
        };

        var items = await query
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync();

        var dtos = items.Select(o => new OrderResponseDto
        {
            OrderId = o.OrderId,
            BuyerId = o.BuyerId,
            SellerId = o.SellerId,
            ListingId = o.OrderDetails.First().ListingId,
            TotalAmount = o.TotalAmount,
            OrderStatus = o.OrderStatus.Name,
            OrderDate = o.OrderDate,
            RowVersion = o.RowVersion
        });

        return new PagedResult<OrderResponseDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = queryParams.Page,
            PageSize = queryParams.PageSize
        };
    }
}
