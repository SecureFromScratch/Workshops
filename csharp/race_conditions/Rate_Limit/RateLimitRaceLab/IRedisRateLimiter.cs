public interface IRedisRateLimiter
{
    /// <summary>
    /// Returns true when the caller has exceeded its limit.
    /// </summary>
    Task<bool> IsBlockedAsync(string key);
}



