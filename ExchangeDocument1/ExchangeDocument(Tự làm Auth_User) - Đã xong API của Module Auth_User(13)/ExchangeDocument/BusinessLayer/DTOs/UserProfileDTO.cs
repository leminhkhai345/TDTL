using System;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class UserProfileDTO
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public bool IsEmailVerified { get; set; }
        public string Role { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public DateTime? Birth { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
