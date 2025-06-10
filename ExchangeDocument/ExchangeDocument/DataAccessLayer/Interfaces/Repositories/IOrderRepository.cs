using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories;

public interface IOrderRepository
{
    Task<Order> AddAsync(Order order);
    Task<Order?> GetByIdWithDetailsAsync(int orderId);
}
