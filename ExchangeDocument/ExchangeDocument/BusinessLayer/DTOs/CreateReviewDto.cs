using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.BusinessLayer.DTOs;

public class CreateReviewDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int OrderId { get; set; }

    [Required]
    [Range(1,5)]
    public int Rating { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;

    [Required]
    public ReviewType ReviewType { get; set; }

    // Bằng chứng kèm theo (ảnh / video)
    public List<IFormFile>? EvidenceFiles { get; set; }
}
