using System;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// Hồ sơ công khai của người bán hiển thị cho người mua.
    /// Chỉ bao gồm các thông tin an toàn.
    /// </summary>
    public class PublicUserProfileDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public DateTime JoinedAt { get; set; }
        public int ActiveListings { get; set; }
        public string? Phone { get; set; }

        // Thêm thông tin liên hệ/thanh toán (nếu chủ tài khoản cung cấp)
        public string? Address { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankAccountName { get; set; }
        public string? BankName { get; set; }
        public string? BankBranch { get; set; }
    }
}
