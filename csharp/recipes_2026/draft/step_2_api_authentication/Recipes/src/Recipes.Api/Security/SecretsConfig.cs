

// SecretsConfig.cs
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using Microsoft.Extensions.Configuration;

namespace Recipes.Api.Security;

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
