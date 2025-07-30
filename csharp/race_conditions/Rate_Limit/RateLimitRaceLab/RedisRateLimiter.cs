using StackExchange.Redis;

public sealed class RedisRateLimiter : IRedisRateLimiter
{
    private readonly IDatabase _db;
    private readonly int _max;
    private readonly int _windowMs;
    private const string Script = @"       
        local c = redis.call('INCR', KEYS[1])
        if c == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
        return c";

    public RedisRateLimiter(IConnectionMultiplexer mux,
                            int maxPerWindow,
                            TimeSpan window)
    {
        _db       = mux.GetDatabase();          // ← always non-null
        _max      = maxPerWindow;
        _windowMs = (int)window.TotalMilliseconds;
    }

    public async Task<bool> IsBlockedAsync(string key)
    {
        var count = (long)await _db.ScriptEvaluateAsync(
                        Script,
                        new RedisKey[] { $"ratelimit:{key}" },
                        new RedisValue[] { _windowMs });

        return count > _max;
    }
}
