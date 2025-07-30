/*public interface IRateLimiter
{
    /// <summary>
    /// Returns true when the caller has exceeded its limit.
    /// </summary>
    Task<bool> IsBlockedAsync(string key);
}
*/
public interface IRateLimiter
{
    bool IsBlocked(string key);
}

