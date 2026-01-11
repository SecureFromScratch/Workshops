# Secret Manager

## Why using secert manager?

Storing application secrets in a secret manager eliminates the need to hard-code sensitive values like database passwords, API keys, or JWT signing keys in source code, config files, or container images. This prevents accidental leaks through version control and reduces the blast radius of credential exposure. Secret managers also support secure rotation, centralized auditing, and environment-specific overrides without code changes. Instead of attempting to “hide” secrets in the application, the app retrieves them securely at runtime, allowing the same build artifacts to be safely deployed across development, staging, and production environments. In short, secret managers separate secrets from code, enforce least-privilege access, and make credential management an operational task rather than a developer responsibility.


## LocalStack
LocalStack is a tool that emulates many AWS cloud services on your local machine so you can build and test cloud applications without talking to real AWS. It runs as a local environment (often in Docker) and exposes AWS‑compatible endpoints, so your code, CLI, Terraform, or CDK commands work almost exactly as they would against real AWS, just faster and without cost. This lets teams iterate on things like S3, Lambda, DynamoDB, and API Gateway integrations offline, then switch the same code and configs to real AWS when ready to deploy.

## How to integrate secret manager into the api

### Creaing sqlserver, and localstack docker

Copy `docker-compose.yml` from the repo.


---
### Install AWS CLI
Linux:
```
sudo apt install awscli
```

Windows:

1. Go to:
   [https://awscli.amazonaws.com/AWSCLIV2.msi](https://awscli.amazonaws.com/AWSCLIV2.msi)

2. Run the installer (Next, Next, Finish)

3. Open a new terminal (PowerShell or CMD):

```powershell
aws --version
```
If you see something like `aws-cli/2.x`, you're done.

---

### Start DB + LocalStack

From that folder:

```bash
docker compose up -d
```

* SQL Server is at `localhost,14333`
* LocalStack (Secrets Manager) is at `http://localhost:4566`

---

### Put the **DB connection string** in LocalStack

Configure aws access key, (localstack doesn't check those, unlike aws real enviroment):

```bash
aws configure set aws_access_key_id localstack
aws configure set aws_secret_access_key localstack
aws configure set default.region us-east-1
```
1. SA password, to start SQL Server
   Replace the secret

```bash
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name recipes/dev/sa-password --secret-string "StrongP4ssword123"


```

2. app user connection string

After you create `recipes_app` in SQL Server:

```bash
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name recipes/dev/app-db-connection --secret-string "Server=localhost,14333;Database=Recipes;User Id=recipes_app;Password=StrongP4ssword123;TrustServerCertificate=true;"

```
Verify
```
aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value --secret-id recipes/dev/sa-password --query SecretString --output text
aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value --secret-id recipes/dev/app-db-connection --query SecretString --output text
```

Now **both** passwords live in Secret Manager.

---

## 3. Bootstrap script: get SA password from secret, start DB

If you work with Linux, install powershell

```
sudo apt-get update
sudo apt-get install -y wget apt-transport-https software-properties-common

wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb

sudo apt-get update
sudo apt-get install -y powershell

```

Create `start-db.ps1` next to `docker-compose.yml`:

```powershell 
# 1. Read SA password from LocalStack Secrets Manager
$saSecret = aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value `
    --secret-id recipes/dev/sa-password `
    --query SecretString `
    --output text

# 2. Export it as env var for this process
$env:MSSQL_SA_PASSWORD = $saSecret

# 3. Start SQL Server
docker compose up -d sqlserver
```

Run the powershell script

```
pwsh -File ./start-db.ps1
```

```
.\start-db.ps1           # on Windows (PowerShell)
```

Now:

* SA password source of truth is **Secret Manager**.
* `.env` is not needed at all.
* Docker only sees `MSSQL_SA_PASSWORD` at runtime, injected by the script.

---

## 4. C# app uses only the app secret

`appsettings.json` in Git:

```json
{
  "Secrets": {
    "ServiceUrl": "http://localhost:4566",
    "Region": "us-east-1",
    "DbConnectionSecretName": "recipes/dev/app-db-connection"
  }
}
```

Install the aws package
````
dotnet add package AWSSDK.SecretsManager

```
Copy the Security/SecretsConfig.cs class

In `Program.cs` 

```csharp
string connectionString = await SecretsConfig.GetDbConnectionStringAsync(builder.Configuration);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});
```


So final picture:

* **Both** SA password and app DB password live in Secret Manager.
* A small PowerShell script reads the SA secret and starts SQL Server.
* The C# app reads only the app secret.

If you want, I can next give you the exact SQL script to create `recipes_admin` and `recipes_app` and a minimal `RecipesDbContext` so the whole lab is copy paste runnable.


If you don’t have `aws` CLI, you can also create this secret via C# once.

Now the **only place** the app connection string lives is:

* LocalStack Secret: `recipes/dev/db-connection`.

---

