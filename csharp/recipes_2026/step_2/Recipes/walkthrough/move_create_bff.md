
## Create the BFF project (ASP.NET Core minimal API)

Purpose: single backend for the SPA, handles auth/cookies/CSRF later, and proxies to the API.

```bash
dotnet new web -n Recipes.Bff
dotnet sln ../Recipes.sln add Recipes.Bff/Recipes.Bff.csproj
```

### Add YARP reverse proxy package

```bash
dotnet add Recipes.Bff package Yarp.ReverseProxy
```

### Configure BFF to proxy `/api/*` to the API

Create `src/Recipes.Bff/appsettings.json`:

```json
{
  "ReverseProxy": {
    "Routes": {
      "apiRoute": {
        "ClusterId": "apiCluster",
        "Match": { "Path": "/api/{**catch-all}" }
      }
    },
    "Clusters": {
      "apiCluster": {
        "Destinations": {
          "api": { "Address": "https://localhost:5001/" }
        }
      }
    }
  }
}
```

> Important: adjust `5001` to whatever port your API actually uses (check API launch output).

Now edit `src/Recipes.Bff/Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapReverseProxy();

app.Run();
```

Run BFF:

```bash
cd src

dotnet run --project Recipes.Bff
```

Test proxy (should hit API):

* `https://localhost:<bff-port>/api/health`

---
