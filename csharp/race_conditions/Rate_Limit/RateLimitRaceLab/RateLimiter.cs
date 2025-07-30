using System.Collections.Concurrent;

public class RateLimiter:IRateLimiter
{
    private readonly TimeSpan Window = TimeSpan.FromSeconds(1);
    private readonly int Max = 2;

    private readonly ConcurrentDictionary<string, (int Count, DateTime Start)> _cache = new();

    public bool IsBlocked(string key)
    {
        if (!_cache.TryGetValue(key, out var entry))
            entry = (0, DateTime.UtcNow);

        if (DateTime.UtcNow - entry.Start > Window)
            entry = (0, DateTime.UtcNow);        // new window

        /* ① CHECK  */
        bool rejected = entry.Count >= Max;      // seen by many threads

        /* ② UPDATE */
        _cache[key] = (entry.Count + 1, entry.Start);

        return rejected;                         // race still possible
    }

}
