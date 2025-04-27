namespace ExchangeDocument.BusinessLayer.Interfaces
{
    public interface IEmailService
    {
        public Task SendOtpAsync(string emailTo, string otp);
    }
}
