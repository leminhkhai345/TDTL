using System;
using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class DocumentUpdateDto
    {
        [Required(ErrorMessage = "Tiêu đề sách là bắt buộc.")]
        [MaxLength(255, ErrorMessage = "Tiêu đề không được vượt quá 255 ký tự.")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Danh mục là bắt buộc.")]
        [Range(1, int.MaxValue, ErrorMessage = "ID danh mục không hợp lệ.")]
        public int CategoryId { get; set; }

        [MaxLength(255, ErrorMessage = "Tên tác giả không được vượt quá 255 ký tự.")]
        public string? Author { get; set; }

        [MaxLength(20, ErrorMessage = "ISBN không được vượt quá 20 ký tự.")]
        public string? Isbn { get; set; }

        [MaxLength(100, ErrorMessage = "Phiên bản không được vượt quá 100 ký tự.")]
        public string? Edition { get; set; }

        public int? PublicationYear { get; set; }

        [Required(ErrorMessage = "Tình trạng sách là bắt buộc.")]
        [MaxLength(50, ErrorMessage = "Tình trạng không được vượt quá 50 ký tự.")]
        public string Condition { get; set; } = null!;

        [Range(0, double.MaxValue, ErrorMessage = "Giá phải lớn hơn hoặc bằng 0.")]
        public decimal? Price { get; set; }

        public string? Description { get; set; }

        [Url(ErrorMessage = "URL hình ảnh không hợp lệ.")]
        public string? ImageUrl { get; set; }
    }
}
