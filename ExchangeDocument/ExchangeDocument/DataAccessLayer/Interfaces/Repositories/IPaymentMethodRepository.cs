using ExchangeDocument.DataAccessLayer.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories
{
    public interface IPaymentMethodRepository
    {
        Task<List<PaymentMethod>> GetAllAsync();
        Task<bool> ExistsByNameAsync(string name);
        Task<PaymentMethod> AddAsync(PaymentMethod paymentMethod);
        Task<PaymentMethod?> GetByIdAsync(int id);
    }
}
