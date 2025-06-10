using ExchangeDocument.BusinessLayer.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    public interface IPaymentMethodService
    {
        Task<List<PaymentMethodDto>> GetAllAsync();
        /// <summary>
        /// Lấy danh sách các phương thức thanh toán đang được bật (IsEnabled = true)
        /// </summary>
        Task<List<PaymentMethodDto>> GetEnabledAsync();
        Task<PaymentMethodDto?> CreateAsync(PaymentMethodCreateDto dto);
        Task<bool> ToggleEnableAsync(int id, bool enable);
        /// <summary>
        /// Lấy phương thức thanh toán theo ID (chỉ trả về khi IsEnabled = true)
        /// </summary>
        Task<PaymentMethodDto?> GetByIdAsync(int id);
    }
}
