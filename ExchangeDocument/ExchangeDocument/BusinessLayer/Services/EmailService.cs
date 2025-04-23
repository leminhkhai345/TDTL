using ExchangeDocument.BusinessLayer.DTOs;
using System.Net.Mail;
using System.Net;
using ExchangeDocument.BusinessLayer.Interfaces;
using Microsoft.Extensions.Options;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _settings;

        public EmailService(IOptions<SmtpSettings> options)
        {
            _settings = options.Value;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var message = new MailMessage
                {
                    From = new MailAddress(_settings.Username),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                message.To.Add(new MailAddress(toEmail));

                using var client = new SmtpClient(_settings.Host, _settings.Port)
                {
                    Credentials = new NetworkCredential(_settings.Username, _settings.Password),
                    EnableSsl = true
                };

                await client.SendMailAsync(message);
            }
            catch (Exception ex)
            {
                // Có thể ghi log hoặc ném lại
                Console.WriteLine($"[EmailService] Gửi email thất bại: {ex.Message}");
                throw; // hoặc xử lý tùy trường hợp
            }
        }
    }
}
