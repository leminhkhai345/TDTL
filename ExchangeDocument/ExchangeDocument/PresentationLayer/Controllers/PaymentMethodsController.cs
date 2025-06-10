using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    /// <summary>
    /// Public API trả về các phương thức thanh toán đang được kích hoạt (isEnabled = true)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentMethodsController : ControllerBase
    {
        private readonly IPaymentMethodService _paymentMethodService;
        public PaymentMethodsController(IPaymentMethodService paymentMethodService)
        {
            _paymentMethodService = paymentMethodService;
        }

        /// <summary>
        /// Lấy danh sách phương thức thanh toán đang được bật. Không yêu cầu authentication.
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetEnabled()
        {
            var list = await _paymentMethodService.GetEnabledAsync();
            return Ok(list);
        }

        /// <summary>
        /// Lấy chi tiết phương thức thanh toán theo ID. Chỉ trả về nếu phương thức đang được bật.
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var pm = await _paymentMethodService.GetByIdAsync(id);
            if (pm == null) return NotFound();
            return Ok(pm);
        }
    }
}
