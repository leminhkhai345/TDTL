using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendOtpAsync(string email, string fullName, string otp)
        {
            var settings = _configuration.GetSection("EmailSettings");
            var smtpHost = settings["SmtpHost"];
            var smtpPort = int.Parse(settings["SmtpPort"]);
            var senderName = settings["SenderName"];
            var senderEmail = settings["SenderEmail"];
            var user = settings["Username"];
            var pass = settings["Password"];

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(user, pass),
                EnableSsl = true
            };

            var mail = new MailMessage()
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = "Your OTP Code",
                Body = $"Hello {fullName},<br/><br/>Your OTP code is <strong>{otp}</strong>.<br/>It will expire in 10 minutes.<br/><br/>Thank you.",
                IsBodyHtml = true
            };
            mail.To.Add(email);

            await client.SendMailAsync(mail);
        }

        public async Task SendPasswordResetAsync(string email, string fullName, string resetToken)
        {
            var settings = _configuration.GetSection("EmailSettings");
            var smtpHost = settings["SmtpHost"];
            var smtpPort = int.Parse(settings["SmtpPort"]);
            var senderName = settings["SenderName"];
            var senderEmail = settings["SenderEmail"];
            var user = settings["Username"];
            var pass = settings["Password"];

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(user, pass),
                EnableSsl = true
            };

            var resetConfig = _configuration.GetSection("PasswordResetSettings");
            var expiryMinutes = resetConfig.GetValue<int>("ExpiryMinutes");

            var mail = new MailMessage()
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = "Password Reset Request",
                Body = $"Hello {fullName},<br/><br/>You requested a password reset. " +
                       $"Your reset token is <strong>{resetToken}</strong>.<br/>" +
                       $"It expires in {expiryMinutes} minutes.<br/><br/>If you did not request this, please ignore this email.",
                IsBodyHtml = true
            };
            mail.To.Add(email);

            await client.SendMailAsync(mail);
        }
    }
}
