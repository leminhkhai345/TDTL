using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class PaymentMethodRepository : IPaymentMethodRepository
    {
        private readonly ExchangeDocumentContext _context;
        public PaymentMethodRepository(ExchangeDocumentContext context)
        {
            _context = context;
        }

        public async Task<List<PaymentMethod>> GetAllAsync()
        {
            return await _context.PaymentMethods.OrderBy(p => p.PaymentMethodId).ToListAsync();
        }

        public async Task<bool> ExistsByNameAsync(string name)
        {
            return await _context.PaymentMethods.AnyAsync(p => p.Name == name);
        }

        public async Task<PaymentMethod> AddAsync(PaymentMethod paymentMethod)
        {
            var entry = await _context.PaymentMethods.AddAsync(paymentMethod);
            return entry.Entity;
        }

        public async Task<PaymentMethod?> GetByIdAsync(int id)
        {
            return await _context.PaymentMethods.FindAsync(id);
        }
    }
}
