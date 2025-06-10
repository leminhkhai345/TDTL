using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    [ApiExplorerSettings(IgnoreApi = true)] 
    public class ErrorController : ControllerBase
    {
        [Route("error")]
        public IActionResult HandleError()
        {
            // Lấy exception đã bị Middleware bắt
            var exceptionFeature = HttpContext.Features.Get<IExceptionHandlerFeature>();
            
            // Tạo ProblemDetails trả về chung cho client
            var problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.",
                Instance = HttpContext.Request.Path
            };

            return StatusCode(StatusCodes.Status500InternalServerError, problemDetails);
        }
    }
}
