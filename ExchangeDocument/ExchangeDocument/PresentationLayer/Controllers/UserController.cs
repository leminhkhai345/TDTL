using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    public class UserController : Controller
    {
        IUserService iUserService;
        public UserController(IUserService _iUserService)
        {
            iUserService = _iUserService;
        }
        [HttpPost]
        [Route("api/register")]
        public ActionResult Register([FromBody]RegisterRequest request)
        {
            if (request == null) return BadRequest("Request is null!!!!");
            bool check = iUserService.Register(request);
            if (check) return Ok();
            else return BadRequest("Email already exited");
        }
    }
}
