# SecureFromScratch Lab - Quick Start Guide

## 🚀 One-Command Setup

### For Students: The Easy Way

1. **Download** the setup script: [setup-lab.ps1](link-to-your-repo)

2. **Run** as Administrator:
   ```powershell
   # Right-click PowerShell -> Run as Administrator
   cd Downloads
   Set-ExecutionPolicy Bypass -Scope Process -Force
   .\setup-lab.ps1
   ```

3. **Wait** ~10-15 minutes (grab a coffee ☕)

4. **Done!** Everything is installed and configured.

---

## ✅ What Gets Installed

The script automatically installs and configures:

- ✅ .NET 8 SDK
- ✅ Node.js (LTS)
- ✅ Git 2.52.0
- ✅ Docker Desktop
- ✅ AWS CLI
- ✅ Clones the workshop repository (sparse checkout)
- ✅ Starts LocalStack (AWS emulator)
- ✅ Creates all secrets in LocalStack
- ✅ Installs all NuGet packages (API + BFF)
- ✅ Installs all Angular packages
- ✅ Runs database migrations
- ✅ Starts SQL Server

---

## 🔧 Manual Setup (If Needed)

If you prefer to install manually or the script fails, follow these steps:

### 1. Install Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js LTS](https://nodejs.org/)
- [Git 2.52.0](https://github.com/git-for-windows/git/releases/download/v2.52.0.windows.1/Git-2.52.0-64-bit.exe)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [AWS CLI](https://awscli.amazonaws.com/AWSCLIV2.msi)

### 2. Clone Repository
```bash
git clone --no-checkout --filter=blob:none https://github.com/SecureFromScratch/Workshops.git
cd Workshops
git sparse-checkout init --cone
git sparse-checkout set csharp/recipes_2026/challanges/Recipes
git checkout main
```

### 3. Start LocalStack
```bash
cd csharp/recipes_2026/challanges/Recipes/src/Recipes.Api
docker compose up -d localstack
```

### 4. Configure AWS CLI & Create Secrets
```bash
aws configure set aws_access_key_id localstack
aws configure set aws_secret_access_key localstack
aws configure set default.region us-east-1

aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name recipes/dev/sa-password --secret-string "StrongP4ssword123"

aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name recipes/dev/app-db-connection --secret-string "Server=localhost,14333;Database=Recipes;User Id=recipes_app;Password=StrongP4ssword123;TrustServerCertificate=true;"

aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name recipes/dev/jwt-config --secret-string "{\"Secret\":\"ThisIsAStrongJwtSecretKey1234567\",\"Issuer\":\"recipes-api\",\"Audience\":\"recipes-client\"}"
```

### 5. Install Packages
```bash
# From Recipes folder root
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package AWSSDK.SecretsManager --version 4.0.4.3
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Azure.AI.OpenAI --version 2.1.0
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.AspNetCore.OpenApi --version 8.0.16
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore.Tools --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package OpenAI --version 2.8.0
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Swashbuckle.AspNetCore --version 6.6.2
dotnet add ./src/Recipes.Bff/Recipes.Bff.csproj package Yarp.ReverseProxy --version 2.3.0
dotnet restore

cd src/recipes-ui
npm install
```

### 6. Setup Database
```bash
cd ../Recipes.Api
dotnet ef migrations add InitialCreate
.\start-db.ps1
```

---

## 🐛 Troubleshooting

### "Execution policy error"
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
```

### "Docker is not running"
- Start Docker Desktop
- Wait for it to fully start (whale icon in system tray)
- Rerun the script

### "LocalStack not responding"
```bash
docker restart localstack
# Wait 10 seconds
```

### "AWS CLI not found after install"
- Close and reopen PowerShell/Terminal
- Or add to PATH manually: `C:\Program Files\Amazon\AWSCLIV2\`

### "Permission denied" on script
- Right-click PowerShell
- Select "Run as Administrator"

### Still having issues?
Run the verification script:
```powershell
.\verify-setup.ps1
```

---

## 📊 Verify Your Setup

Check everything is working:

```bash
# Check tools are installed
dotnet --version    # Should show 8.x.x
node --version      # Should show v20.x.x or v22.x.x
git --version       # Should show 2.52.0
docker --version    # Should show version
aws --version       # Should show aws-cli/2.x

# Check LocalStack
curl http://localhost:4566/_localstack/health

# Check secrets
aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets

# Check SQL Server
docker ps | grep sqlserver
```

---

## 🎯 Running the Application

### 1. Open VS Code
```bash
cd Workshops/csharp/recipes_2026/challanges/Recipes
code .
```
**Important:** Make sure VS Code opens at the `Recipes` folder (the one with `Recipes.sln`), not a subfolder!

### 2. Run the Backend (API + BFF)
1. In VS Code, press **Ctrl+Shift+D** (or click the Run & Debug icon)
2. Select **"API + BFF"** from the dropdown
3. Click the **green play button** (or press F5)
4. Wait for both services to start (you'll see output in the Debug Console)

**Verify it's working:**
- Open Swagger: [http://localhost:5000/swagger](http://localhost:5000/swagger) (or whatever port is shown)
- You should see the API documentation

### 3. Run the Frontend (Angular)
1. Open a **new terminal** in VS Code (Ctrl+`)
2. Navigate to the UI folder:
   ```bash
   cd src/recipes-ui
   ```
3. Start the development server:
   ```bash
   ng s
   ```
4. Wait for "Compiled successfully"
5. Open [http://localhost:4200](http://localhost:4200)

**You're now running the complete application!** 🎉

---

## 🛑 Shutdown

When you're done for the day:

```bash
cd src/Recipes.Api
docker compose down
```

Next time, just run:
```bash
docker compose up -d
```

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run `.\verify-setup.ps1`
3. Ask your instructor
4. Check Docker Desktop logs
5. Check LocalStack logs: `docker logs localstack`
