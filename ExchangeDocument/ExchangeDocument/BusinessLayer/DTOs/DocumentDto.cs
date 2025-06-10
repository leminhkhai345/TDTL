namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class DocumentDto
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = null!;
        public int CategoryId { get; set; }
        public int UserId { get; set; } // ID của người đăng
        public string? Author { get; set; }
        public string? Isbn { get; set; }
        public string? Edition { get; set; }
        public int? PublicationYear { get; set; }
        public string? Condition { get; set; }
        public decimal? Price { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DocumentStatusId { get; set; }
        public string StatusName { get; set; } = null!; // Trạng thái sách (e.g., "InStock")
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Có thể thêm thông tin Category và User nếu cần
        // public CategoryDto Category { get; set; }
        // public UserDto User { get; set; }
    }
}
