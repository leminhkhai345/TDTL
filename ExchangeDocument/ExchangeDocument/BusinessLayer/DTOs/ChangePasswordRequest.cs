namespace ExchangeDocument.BusinessLayer.DTOs
{
    public class ChangePasswordRequest
    {
        public string olePassword { get; set; }
        public string newPassword { get; set; }
        public string confirmPassword { get; set; }
    }
}
