using System;

namespace ExchangeDocument.BusinessLayer.DTOs;

public class ReviewEvidenceDto
{
    public int Id { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public DateTime UploadedDate { get; set; }
}
