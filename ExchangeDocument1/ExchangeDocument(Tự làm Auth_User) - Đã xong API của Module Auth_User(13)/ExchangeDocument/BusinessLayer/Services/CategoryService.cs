using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(ICategoryRepository categoryRepository, ILogger<CategoryService> logger)
        {
            _categoryRepository = categoryRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Select(c => new CategoryDto
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName
            });
        }

        // Thêm phương thức tạo mới danh mục
        public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto createDto)
        {
            var name = createDto.CategoryName.Trim();
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên danh mục không được để trống");
            var categories = await _categoryRepository.GetAllAsync();
            if (categories.Any(c => c.CategoryName.Equals(name, StringComparison.OrdinalIgnoreCase)))
                throw new ArgumentException("Tên danh mục đã tồn tại");

            var entity = new Category { CategoryName = name };
            var created = await _categoryRepository.AddAsync(entity);
            _logger.LogInformation("Danh mục tạo: {CategoryName} (ID={CategoryId}) bởi CategoryService", created.CategoryName, created.CategoryId);
            return new CategoryDto
            {
                CategoryId = created.CategoryId,
                CategoryName = created.CategoryName
            };
        }

        public async Task<CategoryDto> UpdateCategoryAsync(CategoryUpdateDto updateDto)
        {
            var name = updateDto.CategoryName.Trim();
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Tên danh mục không được để trống");

            var existing = await _categoryRepository.GetByIdAsync(updateDto.CategoryId);
            if (existing == null)
                throw new KeyNotFoundException("Danh mục không tồn tại");

            var categories = await _categoryRepository.GetAllAsync();
            if (categories.Any(c => c.CategoryName.Equals(name, StringComparison.OrdinalIgnoreCase)
                                  && c.CategoryId != updateDto.CategoryId))
                throw new ArgumentException("Tên danh mục đã tồn tại");

            var oldName = existing.CategoryName;
            existing.CategoryName = name;
            var updated = await _categoryRepository.UpdateAsync(existing);
            _logger.LogInformation(
                "Cập nhật danh mục: ID={CategoryId}, '{OldName}' → '{NewName}'",
                updated.CategoryId, oldName, updated.CategoryName);
            return new CategoryDto
            {
                CategoryId = updated.CategoryId,
                CategoryName = updated.CategoryName
            };
        }

        /// <summary>
        /// Xóa danh mục theo ID, ném ArgumentException nếu còn tham chiếu tài liệu
        /// </summary>
        public async Task DeleteCategoryAsync(int id)
        {
            var existing = await _categoryRepository.GetByIdAsync(id);
            if (existing == null)
                throw new KeyNotFoundException("Danh mục không tồn tại");
            try
            {
                await _categoryRepository.DeleteAsync(existing);
            }
            catch (DbUpdateException)
            {
                throw new ArgumentException("Không thể xóa danh mục này vì đang có tài liệu tham chiếu. Vui lòng xử lý trước khi xóa.");
            }
            _logger.LogInformation("Xóa danh mục: ID={CategoryId}, Name={CategoryName}", existing.CategoryId, existing.CategoryName);
        }

        /// <summary>
        /// Lấy danh mục theo ID
        /// </summary>
        public async Task<CategoryDto> GetCategoryByIdAsync(int id)
        {
            var entity = await _categoryRepository.GetByIdAsync(id);
            if (entity == null)
                throw new KeyNotFoundException("Danh mục không tồn tại");
            return new CategoryDto
            {
                CategoryId = entity.CategoryId,
                CategoryName = entity.CategoryName
            };
        }
    }
}
