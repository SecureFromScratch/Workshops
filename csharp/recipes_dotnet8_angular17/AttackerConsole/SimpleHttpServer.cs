using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;

public class SimpleHttpServer
{
    private readonly string[] _prefixes;
    private readonly string _baseDirectory;

    public SimpleHttpServer(string[] prefixes, string baseDirectory)
    {
        if (prefixes == null || prefixes.Length == 0)
            throw new ArgumentException("prefixes");
        if (!Directory.Exists(baseDirectory))
            throw new ArgumentException("Invalid directory.");

        _prefixes = prefixes;
        _baseDirectory = baseDirectory;
    }

    public async Task Start()
    {
        HttpListener listener = new HttpListener();

        foreach (string prefix in _prefixes)
        {
            listener.Prefixes.Add(prefix);
        }

        listener.Start();
        Console.WriteLine("Listening...");

        try
        {
            while (true)
            {
                HttpListenerContext context = await listener.GetContextAsync();
                Task.Run(() => ProcessRequest(context));
            }
        }
        finally
        {
            listener.Stop();
        }
    }

    private void ProcessRequest(HttpListenerContext context)
    {
        // Log details about the request
        Console.WriteLine($"Request received:");
        Console.WriteLine($"  Method: {context.Request.HttpMethod}");
        Console.WriteLine($"  URL: {context.Request.Url}");
        Console.WriteLine($"  Headers:");
        foreach (string header in context.Request.Headers.AllKeys)
        {
            Console.WriteLine($"    {header}: {context.Request.Headers[header]}");
        }

        string filename = Path.GetFileName(context.Request.RawUrl);
        string path = Path.Combine(_baseDirectory, filename);

        if (File.Exists(path))
        {
            try
            {
                context.Response.ContentType = "text/html";
                context.Response.StatusCode = (int)HttpStatusCode.OK;
                using (FileStream fs = File.OpenRead(path))
                {
                    fs.CopyTo(context.Response.OutputStream);
                }
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                using (StreamWriter writer = new StreamWriter(context.Response.OutputStream))
                {
                    writer.Write("Internal Server Error");
                }
            }
        }
        else
        {
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            using (StreamWriter writer = new StreamWriter(context.Response.OutputStream))
            {
                writer.Write("File Not Found");
            }
        }

        context.Response.OutputStream.Close();
    }
}

class Program
{
    static void Main()
    {
        var server = new SimpleHttpServer(new string[] { "http://localhost:8888/" }, ".");
        server.Start().GetAwaiter().GetResult();
    }
}
