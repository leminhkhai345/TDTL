//using ExchangeDocument.BusinessLayer.DTOs;
//using System.Net.Mail;
//using System.Net;
//using ExchangeDocument.BusinessLayer.Interfaces;
//using Microsoft.Extensions.Options;


using ExchangeDocument.BusinessLayer.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Threading.Tasks;


namespace ExchangeDocument.BusinessLayer.Services
{


    public class EmailService : IEmailService
    {
        private readonly string _smtpServer = "smtp.gmail.com"; // Hoặc smtp.office365.com, v.v.
        private readonly int _smtpPort = 587;
        private readonly string _emailFrom = "khaile.03042005@gmail.com";
        private readonly string _emailPassword = "ahjp iezs wynv xtff"; // Không dùng mật khẩu chính, dùng app password

        public async Task SendOtpAsync(string emailTo, string otp)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_emailFrom));
            email.To.Add(MailboxAddress.Parse(emailTo));
            email.Subject = "Your OTP Code";

            email.Body = new TextPart("plain")
            {
                Text = $"Your OTP code is: {otp}"
            };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_smtpServer, _smtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_emailFrom, _emailPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }

}
