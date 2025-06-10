using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class PaymentMethodService : IPaymentMethodService
    {
        private readonly IPaymentMethodRepository _pmRepo;
        private readonly ExchangeDocumentContext _context;

        public PaymentMethodService(IPaymentMethodRepository pmRepo, ExchangeDocumentContext context)
        {
            _pmRepo = pmRepo;
            _context = context;
        }

        public async Task<List<PaymentMethodDto>> GetAllAsync()
        {
            var list = await _pmRepo.GetAllAsync();
            return list.Select(p => new PaymentMethodDto { PaymentMethodId = p.PaymentMethodId, Name = p.Name, IsEnabled = p.IsEnabled }).ToList();
        }

        public async Task<List<PaymentMethodDto>> GetEnabledAsync()
        {
            var list = await _pmRepo.GetAllAsync();
            return list.Where(p => p.IsEnabled)
                       .Select(p => new PaymentMethodDto { PaymentMethodId = p.PaymentMethodId, Name = p.Name, IsEnabled = p.IsEnabled })
                       .ToList();
        }

        public async Task<PaymentMethodDto?> CreateAsync(PaymentMethodCreateDto dto)
        {
            bool exists = await _pmRepo.ExistsByNameAsync(dto.Name);
            if (exists) return null;
            var entity = new PaymentMethod { Name = dto.Name, IsEnabled = dto.IsEnabled };
            await _pmRepo.AddAsync(entity);
            await _context.SaveChangesAsync();
            return new PaymentMethodDto { PaymentMethodId = entity.PaymentMethodId, Name = entity.Name, IsEnabled = entity.IsEnabled };
        }

        public async Task<bool> ToggleEnableAsync(int id, bool enable)
        {
            var pm = await _pmRepo.GetByIdAsync(id);
            if (pm == null) return false;
            pm.IsEnabled = enable;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PaymentMethodDto?> GetByIdAsync(int id)
        {
            var pm = await _pmRepo.GetByIdAsync(id);
            if (pm == null || !pm.IsEnabled) return null;
            return new PaymentMethodDto { PaymentMethodId = pm.PaymentMethodId, Name = pm.Name, IsEnabled = pm.IsEnabled };
        }
    }
}
