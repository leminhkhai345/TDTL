using ExchangeDocument.BusinessLayer.Enums;

namespace ExchangeDocument.BusinessLayer.DTOs;

/// <summary>
/// DTO chuyên biệt hóa cho tạo thông báo bằng template, tránh client phải truyền sẵn message.
/// </summary>
public class NotificationCreateByTemplateDto
{
    public NotificationTemplate Template { get; set; }
    public int ReferenceId { get; set; }
}
