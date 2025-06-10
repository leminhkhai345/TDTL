using System.Security.Claims;
using System.Threading.Tasks;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly IChatbotService _chatbotService;
        public ChatbotController(IChatbotService chatbotService)
        {
            _chatbotService = chatbotService;
        }

        [HttpPost("ask")]
        [Authorize]
        public async Task<IActionResult> Ask([FromBody] ChatbotRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest("Question is required.");
            }
            int? userId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (int.TryParse(idStr, out int id)) userId = id;
            }
            var answer = await _chatbotService.AskAsync(request.Question, userId);
            return Ok(new { answer });
        }
    }

    public class ChatbotRequest
    {
        public string Question { get; set; } = string.Empty;
    }
}
