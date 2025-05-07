using System;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class DocumentDetailDto
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = null!;
        public string? Author { get; set; }
        public string? Isbn { get; set; }
        public string? Edition { get; set; }
        public int? PublicationYear { get; set; }
        public string? Condition { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public decimal? Price { get; set; }
        // Không cần trả về Status vì API này chỉ trả về sách đang "Listed"
        // public int DocumentStatusId { get; set; }
        // public string StatusName { get; set; } = null!;

        // Thông tin liên quan
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!; // Lấy từ Category entity
        public int UserId { get; set; }
        public string UserName { get; set; } = null!; // Lấy từ User entity
    }
}
