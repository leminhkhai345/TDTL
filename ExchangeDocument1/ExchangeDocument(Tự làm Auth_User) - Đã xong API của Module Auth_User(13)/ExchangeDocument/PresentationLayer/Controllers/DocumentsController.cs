using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.BusinessLayer.DTOs;
using Microsoft.AspNetCore.Authorization; 
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; 
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http; 
using System.Linq;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize] 
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentsController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpPost]
        public async Task<IActionResult> AddDocument([FromBody] DocumentCreateDto documentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // --- Lấy User ID --- 
            // !!! Quan trọng: Cần thay thế logic này bằng cách lấy UserId thực tế từ context xác thực
            // Ví dụ: nếu dùng ASP.NET Core Identity với JWT:
            // var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
            // {
            //     return Unauthorized("Không thể xác định người dùng."); 
            // }

            // Tạm thởi hardcode userId = 1 để test. **PHẢI THAY ĐỔI SAU**
            int userId = 22; 
            // --- Kết thúc phần lấy User ID ---

            var (createdDocument, errorMessage) = await _documentService.AddDocumentAsync(documentDto, userId);

            if (errorMessage != null)
            {
                // Kiểm tra lỗi cụ thể để trả về status code phù hợp
                if (errorMessage.Contains("Danh mục không tồn tại") || errorMessage.Contains("Người dùng không tồn tại"))
                {
                    return BadRequest(new { message = errorMessage }); // Hoặc NotFound tùy ngữ cảnh
                }
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = errorMessage });
            }

            if (createdDocument == null)
            {
                // Trường hợp không mong muốn khác
                 return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Đã xảy ra lỗi không xác định." });
            }

            // Trả về 201 Created với Location Header và DocumentDto trong body
            return CreatedAtAction(
                nameof(GetDocumentById), // Tên của action GET sách theo ID (sẽ tạo sau)
                new { id = createdDocument.DocumentId }, // Route parameter cho action GET
                createdDocument // Body của response
            );
        }

        // Action này cần được tạo sau để CreatedAtAction hoạt động đúng
        [HttpGet("{id}")]

        //[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(DocumentDetailDto))]
        //[ProducesResponseType(StatusCodes.Status404NotFound)]
    
        // [AllowAnonymous] // Hoặc [Authorize] tùy yêu cầu
        public async Task<ActionResult<DocumentDetailDto>> GetDocumentById(int id)
        {
            var documentDetail = await _documentService.GetListedDocumentDetailsByIdAsync(id);

            if (documentDetail == null)
            {
                return NotFound(new { message = $"Không tìm thấy tài liệu với ID {id} hoặc tài liệu chưa được đăng bán." });
            }

            return Ok(documentDetail);
        }

        // PUT: api/documents/{id}
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(DocumentDetailDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] DocumentUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // TODO: Lấy userId từ context xác thực (sẽ điều chỉnh sau khi gộp module Auth)
            int userId = 1; // Hardcoded cho test

            var (updatedDocument, errorMessage) = await _documentService.UpdateDocumentAsync(id, updateDto, userId);

            if (errorMessage != null)
            {
                if (errorMessage == "Conflict")
                    return Conflict(new { message = "Xung đột khi cập nhật, vui lòng thử lại." });
                if (errorMessage.Contains("quyền"))
                    return StatusCode(403);
                if (errorMessage.Contains("Không tìm thấy"))
                    return NotFound(new { message = errorMessage });
                if (errorMessage.Contains("Danh mục không tồn tại"))
                    return BadRequest(new { message = errorMessage });
                return BadRequest(new { message = errorMessage });
            }

            return Ok(updatedDocument);
        }

        // DELETE: api/documents/{id}
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "ID không hợp lệ." });

            int userId = 1; // Hardcoded cho test
            var error = await _documentService.DeleteDocumentAsync(id, userId);
            if (error != null)
            {
                if (error == "NotFound")
                    return NotFound(new { message = $"Không tìm thấy tài liệu với ID {id}." });
                if (error == "Forbidden")
                    return StatusCode(StatusCodes.Status403Forbidden);
                if (error == "Conflict")
                    return Conflict(new { message = "Không thể xóa do trạng thái không phù hợp hoặc đang trong giao dịch." });
                return BadRequest(new { message = error });
            }

            return NoContent();
        }

        /// <summary>
        /// Retrieves a paginated list of documents currently in the user's inventory (InStock or Listed).
        /// </summary>
        /// <param name="queryParams">Pagination parameters (Page, PageSize).</param>
        /// <returns>A paginated list of the user's document inventory items.</returns>
        [ProducesResponseType(typeof(PagedResult<DocumentInventoryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Placeholder for future auth
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("mine")] // Explicitly define as GET and set route to api/documents/mine
        public async Task<ActionResult<PagedResult<DocumentInventoryDto>>> GetMyInventory([FromQuery] DocumentQueryParameters queryParams)
        {
            // TODO: Replace hardcoded userId with the actual user ID from authentication context
            int userId = 1; // Hardcoded for testing - MUST BE REPLACED
            /* 
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("Invalid user identifier.");
            }
            */

            var inventoryResult = await _documentService.GetMyInventoryAsync(userId, queryParams); // Pass query params
            if (inventoryResult == null)
            {
                return StatusCode(500, "An error occurred while retrieving your inventory.");
            }
 
            // Return the simple paged result
            return Ok(inventoryResult);
        }
    }
}
