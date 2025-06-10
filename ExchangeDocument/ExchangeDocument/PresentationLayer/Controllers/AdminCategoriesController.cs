using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.BusinessLayer.DTOs;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/admin/categories")]
    [Authorize(Roles = "Admin")]
    public class AdminCategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public AdminCategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // POST: api/admin/categories
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> Create([FromBody] CategoryCreateDto createDto)
        {
            try
            {
                var created = await _categoryService.CreateCategoryAsync(createDto);
                return CreatedAtAction(nameof(Create), new { id = created.CategoryId }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT: api/admin/categories/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> Update(int id, [FromBody] CategoryUpdateDto updateDto)
        {
            if (id != updateDto.CategoryId)
                return BadRequest(new { error = "ID trong URL không khớp với ID trong body" });
            try
            {
                var updated = await _categoryService.UpdateCategoryAsync(updateDto);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // DELETE: api/admin/categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _categoryService.DeleteCategoryAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}
