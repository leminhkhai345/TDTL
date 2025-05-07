using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class DocumentCreateDto
    {
        [Required(ErrorMessage = "Tiêu đề sách là bắt buộc.")]
        [MaxLength(255, ErrorMessage = "Tiêu đề không được vượt quá 255 ký tự.")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Danh mục là bắt buộc.")]
        [Range(1, int.MaxValue, ErrorMessage = "ID danh mục không hợp lệ.")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Tên tác giả là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên tác giả không được vượt quá 100 ký tự.")]
        public string Author { get; set; } = null!;

        [MaxLength(20, ErrorMessage = "ISBN không được vượt quá 20 ký tự.")]
        public string? Isbn { get; set; }

        [MaxLength(50, ErrorMessage = "Phiên bản không được vượt quá 50 ký tự.")]
        public string? Edition { get; set; }

        [Range(1800, 2026, ErrorMessage = "Năm xuất bản phải trong khoảng từ 1800 đến 2026.")]
        public int? PublicationYear { get; set; }

        [Required(ErrorMessage = "Tình trạng sách là bắt buộc.")]
        [MaxLength(50, ErrorMessage = "Tình trạng không được vượt quá 50 ký tự.")]
        public string Condition { get; set; } = null!;

        [Range(0, double.MaxValue, ErrorMessage = "Giá phải lớn hơn hoặc bằng 0.")]
        public decimal? Price { get; set; } // Nullable as per requirement

        public string? Description { get; set; }

        [Url(ErrorMessage = "URL hình ảnh không hợp lệ.")]
        public string? ImageUrl { get; set; }
    }
}
