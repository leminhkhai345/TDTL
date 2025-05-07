namespace ExchangeDocument.BusinessLayer.Models
{
    // Configuration for password reset token expiry
    public class PasswordResetSettings
    {
        // Token valid duration in minutes
        public int ExpiryMinutes { get; set; }
    }
}
