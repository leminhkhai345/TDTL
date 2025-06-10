using System;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    public interface IJwtBlacklistService
    {
        // Adds a token's JTI (unique identifier) to the blacklist until its expiry
        Task AddToBlacklistAsync(string jti, DateTime expiryTime);

        // Checks if a token's JTI is in the blacklist
        Task<bool> IsBlacklistedAsync(string jti);
    }
}
