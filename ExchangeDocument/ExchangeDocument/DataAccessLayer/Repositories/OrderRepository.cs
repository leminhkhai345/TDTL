using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly ExchangeDocumentContext _context;
    public OrderRepository(ExchangeDocumentContext context) => _context = context;

    public async Task<Order> AddAsync(Order order)
    {
        _context.Orders.Add(order);
        return order;
    }

    public async Task<Order?> GetByIdWithDetailsAsync(int orderId)
    {
        return await _context.Orders
            .Include(o => o.OrderDetails)
            .ThenInclude(od => od.Listing)
            .Include(o => o.OrderStatus)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);
    }
}
