using System.ComponentModel.DataAnnotations;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class CategoryCreateDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        [RegularExpression(@"^[\w\s\-]+$", ErrorMessage = "Tên danh mục chỉ chứa chữ, số, khoảng trắng và dấu gạch (-).")]
        public string CategoryName { get; set; } = string.Empty;
    }
}
