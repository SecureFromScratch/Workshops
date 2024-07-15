using System.Net;

namespace recipes_api.utils


{
    public static class Utils
    {
        public static async Task<string> DownloadImageAsync(string imageUrl, string uploadsFolder)
        {
            using (var httpClient = new HttpClient())
            {
                var response = await httpClient.GetAsync(imageUrl);
                if (response.IsSuccessStatusCode)
                {
                    var fileName = Path.GetFileName(new Uri(imageUrl).LocalPath);
                    var savePath = Path.Combine(uploadsFolder, fileName);
                    using (var fs = new FileStream(savePath, FileMode.Create))
                    {
                        await response.Content.CopyToAsync(fs);
                    }
                    return "/images/" + fileName; // Assuming wwwroot is the root for static files
                }
                else
                {
                    throw new InvalidOperationException("Could not download the file: " + response.ReasonPhrase);
                }
            }
        }



        public static string GetFullFileNameFromUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return null;

            try
            {
                Uri uri = new Uri(url);
                string fileName = Path.GetFileName(uri.LocalPath); // This includes the extension by default

                return fileName; // fileName already includes the extension
            }
            catch (UriFormatException)
            {
                // Handle the case where the URL is not a valid URI
                return null;
            }
        }


        public static bool IsAllowedUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return false;

            try
            {
                var uri = new Uri(url);
                var host = uri.Host;

                // Check if the host is an IP address
                if (IPAddress.TryParse(host, out var ip))
                {
                    return !IsPrivateIp(ip);
                }
                else
                {
                    // Check for 'localhost' or any local domain that might be considered internal
                    return !(host.Equals("localhost", StringComparison.OrdinalIgnoreCase) || host.EndsWith(".local", StringComparison.OrdinalIgnoreCase));
                }
            }
            catch (UriFormatException)
            {
                return false; // Not a valid URL
            }
        }

        private static bool IsPrivateIp(IPAddress ip)
        {
            var bytes = ip.GetAddressBytes();
            switch (bytes[0])
            {
                case 10:
                    return true; // Class A private network
                case 172:
                    return bytes[1] >= 16 && bytes[1] <= 31; // Class B private network
                case 192:
                    return bytes[1] == 168; // Class C private network
                default:
                    return false;
            }
        }
    }

}
