# Dealing with the JWT secret 

## 1. Put JWT config in Secret Manager (one secret)

In LocalStack:

```bash
aws --endpoint-url=http://localhost:4566 secretsmanager put-secret-value \
  --secret-id recipes/dev/jwt-config \
  --secret-string '{"Secret":"ThisIsAStrongJwtSecretKey1234567","Issuer":"recipes-api","Audience":"recipes-client"}'
```

2. Update configuration: 
   In `appsettings.json` (already have the section, just add a key):

```json
{
  "Secrets": {
    "ServiceUrl": "http://localhost:4566",
    "Region": "us-east-1",
    "DbConnectionSecretName": "recipes/dev/app-db-connection",
    "JwtConfigSecretName": "recipes/dev/jwt-config"
  }
}
```

---

## 3. Extend  `SecretsConfig` helper (no AWS noise in Program.cs)

Install the JwtBearer package
```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.*
```

Add a record and a new method:

```csharp
// SecretsConfig.cs
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using Microsoft.Extensions.Configuration;

public record JwtConfig(string Secret, string Issuer, string Audience);

public static class SecretsConfig
{
    public static async Task<string> GetDbConnectionStringAsync(IConfiguration configuration)
    {
        var secretsCfg = configuration.GetSection("Secrets");

        string serviceUrl = secretsCfg["ServiceUrl"]
            ?? throw new InvalidOperationException("Secrets:ServiceUrl is missing");
        string regionName = secretsCfg["Region"] ?? RegionEndpoint.USEast1.SystemName;
        string secretName = secretsCfg["DbConnectionSecretName"]
            ?? throw new InvalidOperationException("Secrets:DbConnectionSecretName is missing");

        return await GetSecretAsync(serviceUrl, regionName, secretName);
    }

    public static async Task<JwtConfig> GetJwtConfigAsync(IConfiguration configuration)
    {
        var secretsCfg = configuration.GetSection("Secrets");

        string serviceUrl = secretsCfg["ServiceUrl"]
            ?? throw new InvalidOperationException("Secrets:ServiceUrl is missing");
        string regionName = secretsCfg["Region"] ?? RegionEndpoint.USEast1.SystemName;
        string secretName = secretsCfg["JwtConfigSecretName"]
            ?? throw new InvalidOperationException("Secrets:JwtConfigSecretName is missing");

        string json = await GetSecretAsync(serviceUrl, regionName, secretName);

        var cfg = JsonSerializer.Deserialize<JwtConfig>(json);
        if (cfg is null || string.IsNullOrWhiteSpace(cfg.Secret))
        {
            throw new InvalidOperationException("Invalid JWT config in secret.");
        }

        return cfg;
    }

    private static async Task<string> GetSecretAsync(
        string serviceUrl,
        string regionName,
        string secretName)
    {
        var clientConfig = new AmazonSecretsManagerConfig
        {
            ServiceURL = serviceUrl,
            AuthenticationRegion = regionName
        };

        // creds come from aws configure / default chain
        var client = new AmazonSecretsManagerClient(clientConfig);

        var response = await client.GetSecretValueAsync(new GetSecretValueRequest
        {
            SecretId = secretName
        });

        string? secret = response.SecretString;
        if (string.IsNullOrEmpty(secret))
        {
            throw new InvalidOperationException($"Secret '{secretName}' is empty.");
        }

        return secret;
    }
}
```

---

## 4. Hide JWT setup in an extension method

Create `JwtAuthExtensions.cs`:

```csharp
using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

public static class JwtAuthExtensions
{
    public static IServiceCollection AddJwtAuth(this IServiceCollection services, JwtConfig jwt)
    {
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret));

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwt.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(2)
                };
            });

        services.AddAuthorization();

        // optional: expose config for other services/controllers
        services.AddSingleton(jwt);

        return services;
    }
}
```

---

## 5. Now `Program.cs` can stay small and clean, add the following:

```csharp
JwtConfig jwtConfig       = await SecretsConfig.GetJwtConfigAsync(builder.Configuration);

builder.Services.AddJwtAuth(jwtConfig);
```

No AWS keys, no raw JWT secret, no giant token-validation block in `Program.cs`.
Everything “cloud-ish” lives in helpers and in Secret Manager, where it belongs.

---

If you want, next step we can also move `JWT_SECRET` entirely out of config and into *another* LocalStack secret, and show students “both DB and JWT come from secret manager; appsettings only has secret **names**.”
