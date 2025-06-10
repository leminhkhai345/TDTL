using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using ExchangeDocument.DataAccessLayer.Entities;

namespace ExchangeDocument.BusinessLayer.DTOs;

public class UpdateReviewDto
{
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;

    [Required]
    public ReviewType ReviewType { get; set; }

    // Thêm / xoá chứng cứ
    public List<IFormFile>? NewEvidenceFiles { get; set; }
    public List<int>? EvidenceIdsToDelete { get; set; }

    [Required]
    public byte[] RowVersion { get; set; } = null!;
}
