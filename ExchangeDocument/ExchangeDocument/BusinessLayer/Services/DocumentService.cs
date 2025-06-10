using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.BusinessLayer.DTOs;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using ExchangeDocument.DataAccessLayer.Data;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IDocumentRepository _documentRepository;
        private readonly IDocumentStatusRepository _documentStatusRepository;
        private readonly ExchangeDocumentContext _context;

        public DocumentService(
            ICategoryRepository categoryRepository,
            IDocumentRepository documentRepository,
            IDocumentStatusRepository documentStatusRepository,
            ExchangeDocumentContext context)
        {
            _categoryRepository = categoryRepository;
            _documentRepository = documentRepository;
            _documentStatusRepository = documentStatusRepository;
            _context = context;
        }

        public async Task<(DocumentDto? document, string? errorMessage)> AddDocumentAsync(DocumentCreateDto documentDto, int userId)
        {
            // 1. Kiểm tra Category tồn tại
            var category = await _categoryRepository.GetByIdAsync(documentDto.CategoryId);
            if (category == null)
            {
                return (null, "Danh mục không tồn tại.");
            }

            // 2. (Đã xác thực người dùng ở tầng Presentation) Bỏ kiểm tra user tồn tại

            // 3. Map DTO -> Entity
            var documentEntity = new Document
            {
                Title = documentDto.Title,
                CategoryId = documentDto.CategoryId,
                UserId = userId,
                StatusId = 1, // Default InStock
                Author = documentDto.Author,
                Isbn = documentDto.Isbn,
                Edition = documentDto.Edition,
                PublicationYear = documentDto.PublicationYear,
                Condition = documentDto.Condition,
                Price = documentDto.Price,
                Description = documentDto.Description,
                ImageUrl = documentDto.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            // 4. Lưu vào DB qua repository (nếu có exception, Global Error Handler sẽ bắt)
            var createdEntity = await _documentRepository.AddAsync(documentEntity);
            await _context.SaveChangesAsync();

            // 5. Lấy thông tin Status
            var status = await _documentStatusRepository.GetByIdAsync(createdEntity.StatusId);
            if (status == null)
            {
                // Trường hợp này khó xảy ra nếu DB seed đúng, nhưng vẫn nên xử lý
                // Log.Error("Không tìm thấy Status với ID {StatusId} sau khi tạo Document {DocumentId}", createdEntity.StatusId, createdEntity.DocumentId);
                return (null, "Lỗi hệ thống khi lấy trạng thái tài liệu.");
            }

            // 6. Map Entity -> DTO để trả về
            var resultDto = new DocumentDto
            {
                DocumentId = createdEntity.DocumentId,
                Title = createdEntity.Title,
                CategoryId = createdEntity.CategoryId,
                UserId = createdEntity.UserId,
                Author = createdEntity.Author,
                Isbn = createdEntity.Isbn,
                Edition = createdEntity.Edition,
                PublicationYear = createdEntity.PublicationYear,
                Condition = createdEntity.Condition,
                Price = createdEntity.Price,
                Description = createdEntity.Description,
                ImageUrl = createdEntity.ImageUrl,
                DocumentStatusId = createdEntity.StatusId,
                StatusName = status.Name, // Lấy Name từ status vừa lấy
                CreatedAt = createdEntity.CreatedAt,
                UpdatedAt = createdEntity.UpdatedAt
            };

            return (resultDto, null); // Thành công
        }

        public async Task<DocumentDetailDto?> GetListedDocumentDetailsByIdAsync(int id)
        {
            var documentEntity = await _documentRepository.GetListedDocumentDetailsByIdAsync(id);

            if (documentEntity == null)
            {
                // Document not found or not listed, service returns null.
                // Controller will handle returning 404 Not Found.
                return null;
            }

            // Map Entity (with included Category, User, and Status) to DTO
            var documentDetailDto = new DocumentDetailDto
            {
                DocumentId = documentEntity.DocumentId,
                Title = documentEntity.Title,
                Author = documentEntity.Author,
                Isbn = documentEntity.Isbn,
                Edition = documentEntity.Edition,
                PublicationYear = documentEntity.PublicationYear,
                Condition = documentEntity.Condition,
                Description = documentEntity.Description,
                ImageUrl = documentEntity.ImageUrl,
                Price = documentEntity.Price,
                CategoryId = documentEntity.CategoryId,
                CategoryName = documentEntity.Category?.CategoryName ?? "N/A",
                UserId = documentEntity.UserId,
                UserName = documentEntity.User?.FullName ?? "N/A" // Chỉ cần thông tin cơ bản và liên quan User/Category
                // DocumentStatusId và StatusName không cần thiết vì đã lọc theo "Listed"
            };

            return documentDetailDto;
        }

        public async Task<(DocumentDetailDto? document, string? errorMessage)> UpdateDocumentAsync(int id, DocumentUpdateDto updateDto, int userId)
        {
            // 1. Kiểm tra danh mục tồn tại
            var category = await _categoryRepository.GetByIdAsync(updateDto.CategoryId);
            if (category == null)
                return (null, "Danh mục không tồn tại.");

            // 2. Lấy document hiện tại
            var existing = await _documentRepository.GetByIdAsync(id);
            if (existing == null)
                return (null, "Không tìm thấy tài liệu.");

            // 3. Kiểm tra quyền (chỉ chủ sở hữu được sửa)
            if (existing.UserId != userId)
                return (null, "Không có quyền cập nhật tài liệu.");

            // 4. Quy tắc nghiệp vụ: chỉ cập nhật khi trạng thái là InStock hoặc Listed
            if (existing.SystemStatus.Code != "InStock" )
                return (null, $"Không thể cập nhật khi trạng thái là '{existing.SystemStatus.Code}'.");

            // 5. Áp dụng cập nhật từ DTO
            existing.Title = updateDto.Title;
            existing.CategoryId = updateDto.CategoryId;
            existing.Author = updateDto.Author;
            existing.Isbn = updateDto.Isbn;
            existing.Edition = updateDto.Edition;
            existing.PublicationYear = updateDto.PublicationYear;
            existing.Condition = updateDto.Condition;
            existing.Price = updateDto.Price;
            existing.Description = updateDto.Description;
            existing.ImageUrl = updateDto.ImageUrl;
            existing.UpdatedAt = DateTime.UtcNow;

            // 6. Lưu thay đổi
            try
            {
                await _documentRepository.UpdateAsync(existing);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return (null, "Conflict");
            }

            // 7. Map entity sang DTO để trả về
            var dto = new DocumentDetailDto
            {
                DocumentId    = existing.DocumentId,
                Title         = existing.Title,
                Author        = existing.Author,
                Isbn          = existing.Isbn,
                Edition       = existing.Edition,
                PublicationYear = existing.PublicationYear,
                Condition     = existing.Condition,
                Description   = existing.Description,
                ImageUrl      = existing.ImageUrl,
                Price         = existing.Price,
                CategoryId    = existing.CategoryId,
                CategoryName  = existing.Category?.CategoryName ?? "N/A",
                UserId        = existing.UserId,
                UserName      = existing.User?.FullName ?? "N/A",
                CreatedAt     = existing.CreatedAt,
                UpdatedAt     = existing.UpdatedAt
            };
            return (dto, null);
        }

        /// <summary>
        /// Soft-delete a document by its ID and user permission.
        /// </summary>
        public async Task<string?> DeleteDocumentAsync(int id, int userId)
        {
            var existing = await _documentRepository.GetByIdAsync(id);
            if (existing == null)
                return "NotFound";
            if (existing.UserId != userId)
                return "Forbidden";
            if (existing.SystemStatus.Code != "InStock")
                return "Conflict";

            // Đánh dấu tài liệu đã bị xóa mềm
            await _documentRepository.SoftDeleteAsync(existing);
            await _context.SaveChangesAsync();
            return null;
        }

        /// <summary>
        /// Get current user's inventory (InStock and Listed documents) with basic pagination.
        /// </summary>
        public async Task<PagedResult<DocumentInventoryDto>> GetMyInventoryAsync(int userId, DocumentQueryParameters queryParams)
        {
            // Validate User ID (basic check, enhance with actual auth checks later)
            if (userId <= 0)
            {
                // Ideally, throw a specific exception or return a standardized error response
                // For now, returning an empty result might be acceptable depending on requirements
                return new PagedResult<DocumentInventoryDto> { Items = new List<DocumentInventoryDto>(), TotalCount = 0, Page = queryParams.Page, PageSize = queryParams.PageSize };
            }

            var pagedDocs = await _documentRepository.GetInventoryByUserAsync(userId, queryParams);

            var dtos = pagedDocs.Items.Select(d => new DocumentInventoryDto
            {
                DocumentId = d.DocumentId,
                Title = d.Title,
                Price = d.Price,
                CategoryId = d.CategoryId,
                CategoryName = d.Category.CategoryName,
                DocumentStatusId = d.StatusId,
                StatusName = d.SystemStatus.Name, // Assuming SystemStatus is eagerly loaded
                Author = d.Author,
                ImageUrl = d.ImageUrl
            });

            return new PagedResult<DocumentInventoryDto>
            {
                Items = dtos,
                TotalCount = pagedDocs.TotalCount,
                Page = queryParams.Page,
                PageSize = queryParams.PageSize
            };
        }

        public async Task<(DocumentDetailDto? document, string? errorMessage)> GetMyDocumentByIdAsync(int id, int userId)
        {
            var existing = await _documentRepository.GetByIdAsync(id);
            if (existing == null)
                return (null, "NotFound");
            if (existing.UserId != userId)
                return (null, "Forbidden");

            // Chỉ hiển thị khi còn trong kho
            if (existing.SystemStatus.Code != "InStock" && existing.SystemStatus.Code != "Listed" && existing.SystemStatus.Code != "PendingSale")
                return (null, "Conflict");

            var dto = new DocumentDetailDto
            {
                DocumentId = existing.DocumentId,
                Title = existing.Title,
                Author = existing.Author,
                Isbn = existing.Isbn,
                Edition = existing.Edition,
                PublicationYear = existing.PublicationYear,
                Condition = existing.Condition,
                Description = existing.Description,
                ImageUrl = existing.ImageUrl,
                Price = existing.Price,
                CategoryId = existing.CategoryId,
                CategoryName = existing.Category?.CategoryName ?? "N/A",
                UserId = existing.UserId,
                UserName = existing.User?.FullName ?? "N/A",
                DocumentStatusId = existing.StatusId,
                StatusName = existing.SystemStatus.Name,
                CreatedAt = existing.CreatedAt,
                UpdatedAt = existing.UpdatedAt
            };

            return (dto, null);
        }
    }
}
