using ExchangeDocument.BusinessLayer.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
        Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto createDto);
        Task<CategoryDto> UpdateCategoryAsync(CategoryUpdateDto updateDto);
        /// <summary>
        /// Xóa danh mục theo ID
        /// </summary>
        Task DeleteCategoryAsync(int id);
        /// <summary>
        /// Lấy danh mục theo ID
        /// </summary>
        Task<CategoryDto> GetCategoryByIdAsync(int id);
    }
}
