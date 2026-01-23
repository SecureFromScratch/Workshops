# SecureFromScratch Lab Setup Script
# This script automates the complete lab environment setup

param(
    [switch]$SkipPrerequisites,
    [switch]$SkipClone
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Yellow
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warning "This script should be run as Administrator for best results."
    Write-Info "Some installations may prompt for elevation."
    Start-Sleep -Seconds 3
}

# ============================================================================
# STEP 1: Install Prerequisites
# ============================================================================
if (-not $SkipPrerequisites) {
    Write-Step "STEP 1: Installing Prerequisites"

    # Check for winget
    if (-not (Test-Command "winget")) {
        Write-Warning "winget not found. Please install it from Microsoft Store or update Windows."
        Write-Info "Continuing with manual checks..."
    }

    # Install .NET 8 SDK
    if (-not (Test-Command "dotnet")) {
        Write-Info "Installing .NET 8 SDK..."
        winget install Microsoft.DotNet.SDK.8 --silent --accept-package-agreements --accept-source-agreements
        Write-Success ".NET 8 SDK installed"
    } else {
        $dotnetVersion = dotnet --version
        Write-Success ".NET SDK already installed (version: $dotnetVersion)"
    }

    # Install Node.js
    if (-not (Test-Command "node")) {
        Write-Info "Installing Node.js LTS..."
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        Write-Success "Node.js installed"
    } else {
        $nodeVersion = node --version
        Write-Success "Node.js already installed (version: $nodeVersion)"
    }

    # Install Git
    if (-not (Test-Command "git")) {
        Write-Info "Installing Git..."
        $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.52.0.windows.1/Git-2.52.0-64-bit.exe"
        $gitInstaller = "$env:TEMP\Git-Setup.exe"
        Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller
        Start-Process -FilePath $gitInstaller -ArgumentList "/VERYSILENT" -Wait
        Remove-Item $gitInstaller
        Write-Success "Git installed"
    } else {
        $gitVersion = git --version
        Write-Success "Git already installed ($gitVersion)"
    }

    # Install Docker Desktop
    if (-not (Test-Command "docker")) {
        Write-Info "Installing Docker Desktop..."
        winget install Docker.DockerDesktop --silent --accept-package-agreements --accept-source-agreements
        Write-Warning "Docker Desktop installed. You may need to restart your computer and rerun this script."
        Write-Info "Press any key to continue or Ctrl+C to exit and restart..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Success "Docker already installed"
    }

    # Install AWS CLI
    if (-not (Test-Command "aws")) {
        Write-Info "Installing AWS CLI..."
        $awsUrl = "https://awscli.amazonaws.com/AWSCLIV2.msi"
        $awsInstaller = "$env:TEMP\AWSCLIV2.msi"
        Invoke-WebRequest -Uri $awsUrl -OutFile $awsInstaller
        Start-Process msiexec.exe -ArgumentList "/i `"$awsInstaller`" /qn" -Wait
        Remove-Item $awsInstaller
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        Write-Success "AWS CLI installed"
    } else {
        $awsVersion = aws --version
        Write-Success "AWS CLI already installed ($awsVersion)"
    }

    Write-Success "All prerequisites installed!"
}

# ============================================================================
# STEP 2: Clone Repository with Sparse Checkout
# ============================================================================
if (-not $SkipClone) {
    Write-Step "STEP 2: Cloning Repository (Sparse Checkout)"

    $repoPath = "Workshops"
    
    if (Test-Path $repoPath) {
        Write-Info "Repository already exists at .\$repoPath"
        $response = Read-Host "Do you want to delete and re-clone? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Remove-Item -Recurse -Force $repoPath
        } else {
            Write-Info "Skipping clone. Using existing repository."
            Set-Location $repoPath
            $SkipClone = $true
        }
    }
    
    if (-not $SkipClone) {
        Write-Info "Cloning repository with blob filtering..."
        git clone --no-checkout --filter=blob:none https://github.com/SecureFromScratch/Workshops.git
        
        Set-Location $repoPath
        
        Write-Info "Setting up sparse checkout..."
        git sparse-checkout init --cone
        git sparse-checkout set csharp/recipes_2026/challanges/Recipes
        
        Write-Info "Checking out main branch..."
        git checkout main
        
        Write-Success "Repository cloned successfully!"
    }
} else {
    # If skipping clone, assume we're already in the right directory
    if (-not (Test-Path "Workshops")) {
        Write-Error "Workshops directory not found. Please run without -SkipClone or navigate to the correct directory."
        exit 1
    }
    Set-Location Workshops
}

# Navigate to Recipes folder
$recipesPath = "csharp\recipes_2026\challanges\Recipes"
if (-not (Test-Path $recipesPath)) {
    Write-Error "Recipes folder not found at $recipesPath"
    exit 1
}
Set-Location $recipesPath
Write-Info "Working directory: $(Get-Location)"

# ============================================================================
# STEP 3: Start LocalStack
# ============================================================================
Write-Step "STEP 3: Starting LocalStack"

# Navigate to API folder for docker-compose
Set-Location "src\Recipes.Api"

Write-Info "Starting LocalStack container..."
docker compose up -d localstack

Write-Info "Waiting for LocalStack to be ready..."
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4566/_localstack/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $ready = $true
        }
    } catch {
        # LocalStack not ready yet
    }
    
    if (-not $ready) {
        $attempt++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

if ($ready) {
    Write-Success "LocalStack is ready!"
} else {
    Write-Warning "LocalStack health check timeout. Continuing anyway..."
}

# ============================================================================
# STEP 4: Configure AWS CLI for LocalStack
# ============================================================================
Write-Step "STEP 4: Configuring AWS CLI"

Write-Info "Setting AWS credentials for LocalStack..."
aws configure set aws_access_key_id localstack
aws configure set aws_secret_access_key localstack
aws configure set default.region us-east-1

Write-Success "AWS CLI configured for LocalStack"

# ============================================================================
# STEP 5: Seed Secrets into LocalStack
# ============================================================================
Write-Step "STEP 5: Creating Secrets in LocalStack"

$endpoint = "http://localhost:4566"

Write-Info "Creating sa-password secret..."
aws --endpoint-url=$endpoint secretsmanager create-secret `
    --name recipes/dev/sa-password `
    --secret-string "StrongP4ssword123" 2>$null

Write-Info "Creating app-db-connection secret..."
aws --endpoint-url=$endpoint secretsmanager create-secret `
    --name recipes/dev/app-db-connection `
    --secret-string "Server=localhost,14333;Database=Recipes;User Id=recipes_app;Password=StrongP4ssword123;TrustServerCertificate=true;" 2>$null

Write-Info "Creating jwt-config secret..."
aws --endpoint-url=$endpoint secretsmanager create-secret `
    --name recipes/dev/jwt-config `
    --secret-string '{"Secret":"ThisIsAStrongJwtSecretKey1234567","Issuer":"recipes-api","Audience":"recipes-client"}' 2>$null

# Verify secrets
Write-Info "Verifying secrets..."
$saPassword = aws --endpoint-url=$endpoint secretsmanager get-secret-value --secret-id recipes/dev/sa-password --query SecretString --output text
$appConnection = aws --endpoint-url=$endpoint secretsmanager get-secret-value --secret-id recipes/dev/app-db-connection --query SecretString --output text
$jwtConfig = aws --endpoint-url=$endpoint secretsmanager get-secret-value --secret-id recipes/dev/jwt-config --query SecretString --output text

if ($saPassword -and $appConnection -and $jwtConfig) {
    Write-Success "All secrets created and verified!"
} else {
    Write-Warning "Some secrets may not have been created properly. Check manually."
}

# ============================================================================
# STEP 6: Install NuGet Packages
# ============================================================================
Write-Step "STEP 6: Installing NuGet Packages"

# Go back to solution root
Set-Location "..\..\"

Write-Info "Installing Recipes.Api packages..."
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package AWSSDK.SecretsManager --version 4.0.4.3
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Azure.AI.OpenAI --version 2.1.0
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.AspNetCore.OpenApi --version 8.0.16
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore.Tools --version 8.0.23
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package OpenAI --version 2.8.0
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Swashbuckle.AspNetCore --version 6.6.2

Write-Info "Installing Recipes.Bff packages..."
dotnet add ./src/Recipes.Bff/Recipes.Bff.csproj package Yarp.ReverseProxy --version 2.3.0

Write-Info "Restoring all packages..."
dotnet restore

Write-Success "NuGet packages installed!"

# ============================================================================
# STEP 7: Install Angular Packages
# ============================================================================
Write-Step "STEP 7: Installing Angular Packages"

Set-Location "src\recipes-ui"
Write-Info "Running npm install..."
npm install

Write-Success "Angular packages installed!"

# Go back to API folder for database setup
Set-Location "..\Recipes.Api"

# ============================================================================
# STEP 8: Start SQL Server and Run Migrations
# ============================================================================
Write-Step "STEP 8: Setting up Database"

Write-Info "Starting SQL Server and running migrations with start-db.ps1..."
if (Test-Path "start-db.ps1") {
    & .\start-db.ps1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "SQL Server started and migrations applied!"
    } else {
        Write-Warning "Database setup encountered issues. Check the output above."
    }
} else {
    Write-Warning "start-db.ps1 not found. You may need to set up the database manually."
    Write-Info "Expected location: $(Get-Location)\start-db.ps1"
}

# ============================================================================
# COMPLETION
# ============================================================================
Write-Step "SETUP COMPLETE!"

Write-Host @"

[SUCCESS] Setup Complete!

All prerequisites installed
Repository cloned (sparse checkout)
LocalStack running at http://localhost:4566
Secrets configured in LocalStack
NuGet packages installed
Angular packages installed
Database migration created
SQL Server running at localhost,14333

NEXT STEPS:
1. Open VS Code in the Recipes folder (with Recipes.sln)
   Location: $(Get-Location | Split-Path -Parent | Split-Path -Parent)

2. Run the backend (API + BFF):
   - Press Ctrl+Shift+D
   - Select "API + BFF" 
   - Press F5 or click green play button
   - Open Swagger: http://localhost:5000/swagger

3. Run the frontend:
   - Open new terminal (Ctrl+`)
   - cd src/recipes-ui
   - ng s
   - Open http://localhost:4200

To verify setup:
  .\verify-setup.ps1

To stop services:
  docker compose down

"@ -ForegroundColor Green

Write-Info "Setup log saved to: setup-log.txt"
