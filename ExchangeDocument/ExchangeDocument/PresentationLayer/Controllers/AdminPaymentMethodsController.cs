using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/admin/payment-methods")]
    [Authorize(Roles = "Admin")]
    public class AdminPaymentMethodsController : ControllerBase
    {
        private readonly IPaymentMethodService _paymentMethodService;
        public AdminPaymentMethodsController(IPaymentMethodService paymentMethodService)
        {
            _paymentMethodService = paymentMethodService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _paymentMethodService.GetAllAsync();
            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PaymentMethodCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _paymentMethodService.CreateAsync(dto);
            if (created == null) return Conflict(new { message = "Payment method name already exists." });
            return CreatedAtAction(nameof(GetAll), null, created);
        }

        [HttpPut("{id}/enable")]
        public async Task<IActionResult> Enable(int id)
        {
            var ok = await _paymentMethodService.ToggleEnableAsync(id, true);
            return ok ? NoContent() : NotFound();
        }

        [HttpPut("{id}/disable")]
        public async Task<IActionResult> Disable(int id)
        {
            var ok = await _paymentMethodService.ToggleEnableAsync(id, false);
            return ok ? NoContent() : NotFound();
        }
    }
}
