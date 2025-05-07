using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using ExchangeDocument.BusinessLayer.Interfaces.Services;

namespace ExchangeDocument.BusinessLayer.Services
{
    public class MemoryCacheJwtBlacklistService : IJwtBlacklistService
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<MemoryCacheJwtBlacklistService> _logger;
        private const string BlacklistKeyPrefix = "jwt_blacklist_";

        public MemoryCacheJwtBlacklistService(IMemoryCache cache, ILogger<MemoryCacheJwtBlacklistService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public Task AddToBlacklistAsync(string jti, DateTime expiryTime)
        {
            var key = BlacklistKeyPrefix + jti;
            var cacheExpiry = expiryTime.ToUniversalTime() - DateTime.UtcNow;
            if (cacheExpiry > TimeSpan.Zero)
            {
                _logger.LogInformation("Adding JTI {Jti} to memory cache blacklist, expires in {CacheExpiry}", jti, cacheExpiry);
                _cache.Set(key, true, cacheExpiry);
            }
            else
            {
                _logger.LogWarning("Attempted to blacklist already expired JTI {Jti}", jti);
            }
            return Task.CompletedTask;
        }

        public Task<bool> IsBlacklistedAsync(string jti)
        {
            var key = BlacklistKeyPrefix + jti;
            var exists = _cache.TryGetValue(key, out _);
            if (exists)
            {
                _logger.LogWarning("JTI {Jti} found in memory cache blacklist.", jti);
            }
            return Task.FromResult(exists);
        }
    }
}
