using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.IdentityModel.Tokens;


using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class JwtService
    {
        private readonly string _SECRETKEY = "SupperSecretkey12345!@#$%^&*()_+67890";
        public string GenerateToken(string email, string role)
        {
            var claim = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, email ),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, role ),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_SECRETKEY));
            var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: "http://localhost:5041",
                audience: "http://localhost:5041",
                claims: claim,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: cred
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
