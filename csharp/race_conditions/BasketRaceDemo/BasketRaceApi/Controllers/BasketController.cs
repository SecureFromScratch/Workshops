// Models
using Microsoft.AspNetCore.Mvc;

public record AddRequest(string User, string Item);

public record CleanRequest(string User);

public record CheckoutRequest(string User);

// Controllers/BasketController.cs
[ApiController]
[Route("[controller]")]
public class BasketController : ControllerBase
{
    private static readonly Dictionary<string, List<string>> Baskets = new();
    private static readonly Dictionary<string, int> Prices = new() { ["cheap"] = 10, ["expensive"] = 1000 };
    private static readonly Dictionary<string, int> Balances = new() { ["alice"] = 10 };

    [HttpPost("Add")]
    public IActionResult Add([FromBody] AddRequest r)
    {
        if (!Prices.ContainsKey(r.Item)) return BadRequest("Unknown item");


        if (!Baskets.TryGetValue(r.User, out var cart))
            Baskets[r.User] = cart = new List<string>();
        cart.Add(r.Item);                         // race window

        return Ok("Item added");
    }

    [HttpPost("Remove")]
    public IActionResult Remove([FromBody] AddRequest r)
    {
        if (!Prices.ContainsKey(r.Item)) return BadRequest("Unknown item");

        lock (Baskets)
        {
            if (!Baskets.TryGetValue(r.User, out var cart))
                Baskets[r.User] = cart = new List<string>();
            cart.Remove(r.Item);                         // race window
        }
        return Ok("Item removed");
    }

    [HttpPost("Clean")]
    public IActionResult Clean([FromBody] CleanRequest r)
    {

        lock (Baskets)
        {
            if (Baskets.TryGetValue(r.User, out var cart))
                Baskets[r.User].Clear();

        }
        Balances[r.User] = 10;

        return Ok("Items removed");
    }

    [HttpPost("Checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest r)
    {
        if (!Baskets.TryGetValue(r.User, out var cart) || cart.Count == 0)
            return BadRequest("Cart empty");

        var total = cart.Sum(i => Prices[i]);

        if (Balances[r.User] < total)
            return BadRequest("Insufficient balance");

        await Task.Delay(30);            // ← widens the race window (keep exactly like this)

        Balances[r.User] -= total;
        return Ok(new { Charged = total, Remaining = Balances[r.User] });
    }

    // helper
    [HttpGet("State")]
    public IActionResult State([FromQuery] string user) =>
        Ok(new
        {
            Cart = Baskets.TryGetValue(user, out var c) ? c : new List<string>(),
            Balance = Balances.TryGetValue(user, out var b) ? b : 0
        });
}
