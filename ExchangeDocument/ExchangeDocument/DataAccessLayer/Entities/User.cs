using System;
using System.Collections.Generic;

namespace ExchangeDocument.DataAccessLayer.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string? Phone { get; set; }

    public int RoleId { get; set; }

    // --- Fields for Authentication/Authorization ---
    public bool IsEmailVerified { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? ResetTokenExpires { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public bool IsLocked { get; set; } = false;
    // ---------------------------------------------

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual Role Role { get; set; } = null!;

    public virtual Userprofile? Userprofile { get; set; }
}
