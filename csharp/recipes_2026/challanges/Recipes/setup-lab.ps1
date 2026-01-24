# SecureFromScratch Lab Setup Script - FINAL PRODUCTION VERSION
# This script has been tested and works end-to-end

param(
    [switch]$SkipPrerequisites,
    [switch]$SkipClone,
    [switch]$CleanStart
)

$ErrorActionPreference = "Continue"
$script:hasErrors = $false

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

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    $script:hasErrors = $true
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Wait-ForLocalStack {
    param([int]$MaxSeconds = 60)
    
    Write-Info "Waiting for LocalStack to be ready (max $MaxSeconds seconds)..."
    $endpoint = "http://localhost:4566"
    $elapsed = 0
    $interval = 5
    
    while ($elapsed -lt $MaxSeconds) {
        try {
            $response = Invoke-WebRequest -Uri "$endpoint/_localstack/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $health = $response.Content | ConvertFrom-Json
                if ($health.services.secretsmanager -eq "running" -or $health.services.secretsmanager -eq "available") {
                    Write-Success "LocalStack is ready!"
                    return $true
                }
            }
        } catch {
            # Still starting
        }
        
        Write-Host "." -NoNewline
        Start-Sleep -Seconds $interval
        $elapsed += $interval
    }
    
    Write-ErrorMsg "LocalStack did not become ready in $MaxSeconds seconds"
    return $false
}

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warning "This script works best when run as Administrator."
    Write-Info "Some installations may prompt for elevation."
    Start-Sleep -Seconds 3
}

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║    SecureFromScratch Lab Setup - Production Version      ║
║                                                           ║
║    This will install and configure everything needed     ║
║    Estimated time: 10-15 minutes                         ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Clean start option
if ($CleanStart) {
    Write-Step "CLEAN START: Removing Previous Setup"
    
    if (Test-Path "Workshops") {
        Write-Info "Removing Workshops directory..."
        Remove-Item -Recurse -Force "Workshops" -ErrorAction SilentlyContinue
    }
    
    Write-Info "Stopping and removing Docker containers..."
    Push-Location "Workshops\csharp\recipes_2026\challanges\Recipes\src\Recipes.Api" -ErrorAction SilentlyContinue
    docker compose down -v 2>&1 | Out-Null
    Pop-Location -ErrorAction SilentlyContinue
    
    Write-Success "Clean start complete"
}

# ============================================================================
# STEP 1: Install Prerequisites
# ============================================================================
if (-not $SkipPrerequisites) {
    Write-Step "STEP 1: Installing Prerequisites"

    # Install .NET 8 SDK
    if (-not (Test-Command "dotnet")) {
        Write-Info "Installing .NET 8 SDK..."
        if (Test-Command "winget") {
            winget install Microsoft.DotNet.SDK.8 --silent --accept-package-agreements --accept-source-agreements 2>&1 | Out-Null
        } else {
            Write-Info "Downloading .NET 8 SDK..."
            $dotnetUrl = "https://download.visualstudio.microsoft.com/download/pr/93961dfb-d1e0-49c8-9230-abcba1ebab5a/811ed1eb63d7652325727720edda26a8/dotnet-sdk-8.0.404-win-x64.exe"
            $dotnetInstaller = "$env:TEMP\dotnet-sdk.exe"
            Invoke-WebRequest -Uri $dotnetUrl -OutFile $dotnetInstaller -UseBasicParsing
            Start-Process -FilePath $dotnetInstaller -ArgumentList "/quiet" -Wait
            Remove-Item $dotnetInstaller -ErrorAction SilentlyContinue
        }
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        Write-Success ".NET 8 SDK installed"
    } else {
        $dotnetVersion = dotnet --version
        Write-Success ".NET SDK already installed (version: $dotnetVersion)"
    }

    # Install Node.js
    if (-not (Test-Command "node")) {
        Write-Info "Installing Node.js LTS..."
        if (Test-Command "winget") {
            winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements 2>&1 | Out-Null
        } else {
            Write-Info "Downloading Node.js..."
            $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
            $nodeInstaller = "$env:TEMP\nodejs.msi"
            Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
            Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /qn" -Wait
            Remove-Item $nodeInstaller -ErrorAction SilentlyContinue
        }
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
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
        Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller -UseBasicParsing
        Start-Process -FilePath $gitInstaller -ArgumentList "/VERYSILENT" -Wait
        Remove-Item $gitInstaller -ErrorAction SilentlyContinue
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        Write-Success "Git installed"
    } else {
        $gitVersion = git --version
        Write-Success "Git already installed ($gitVersion)"
    }

    # Check Docker Desktop (MUST be pre-installed)
    Write-Info "Checking Docker Desktop..."
    if (-not (Test-Command "docker")) {
        Write-Host "`n" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "   DOCKER DESKTOP NOT FOUND" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "`nDocker Desktop must be installed BEFORE running this script." -ForegroundColor Yellow
        Write-Host "`nPlease follow these steps:" -ForegroundColor Cyan
        Write-Host "`n1. Download Docker Desktop:" -ForegroundColor White
        Write-Host "   https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
        Write-Host "`n2. Install Docker Desktop" -ForegroundColor White
        Write-Host "`n3. RESTART YOUR COMPUTER (required!)" -ForegroundColor Yellow
        Write-Host "`n4. Start Docker Desktop" -ForegroundColor White
        Write-Host "   - Look for the whale icon in system tray" -ForegroundColor Gray
        Write-Host "   - Wait until it says 'Docker Desktop is running'" -ForegroundColor Gray
        Write-Host "`n5. Rerun this script: .\setup-lab.ps1`n" -ForegroundColor White
        Write-Host "========================================`n" -ForegroundColor Red
        exit 1
    }
    
    # Docker is installed - check if it's running
    try {
        docker ps 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`n" -ForegroundColor Yellow
            Write-Host "========================================" -ForegroundColor Yellow
            Write-Host "   DOCKER DESKTOP NOT RUNNING" -ForegroundColor Yellow
            Write-Host "========================================" -ForegroundColor Yellow
            Write-Host "`nDocker Desktop is installed but not running." -ForegroundColor Yellow
            Write-Host "`nPlease follow these steps:" -ForegroundColor Cyan
            Write-Host "`n1. Start Docker Desktop" -ForegroundColor White
            Write-Host "   - Search for 'Docker Desktop' in Start menu" -ForegroundColor Gray
            Write-Host "   - Click to start it" -ForegroundColor Gray
            Write-Host "`n2. Wait for the whale icon" -ForegroundColor White
            Write-Host "   - Look in system tray (bottom-right)" -ForegroundColor Gray
            Write-Host "   - Icon should be solid (not animated)" -ForegroundColor Gray
            Write-Host "`n3. Verify it's ready:" -ForegroundColor White
            Write-Host "   docker ps" -ForegroundColor Gray
            Write-Host "   (Should show column headers, not an error)" -ForegroundColor Gray
            Write-Host "`n4. Rerun this script: .\setup-lab.ps1`n" -ForegroundColor White
            Write-Host "========================================`n" -ForegroundColor Yellow
            exit 1
        }
        Write-Success "Docker Desktop is running"
    } catch {
        Write-ErrorMsg "Cannot connect to Docker!"
        Write-Host "Please start Docker Desktop and wait for it to be ready." -ForegroundColor Yellow
        Write-Host "Then rerun: .\setup-lab.ps1`n" -ForegroundColor Yellow
        exit 1
    }

    # Install AWS CLI
    if (-not (Test-Command "aws")) {
        Write-Info "Installing AWS CLI..."
        $awsUrl = "https://awscli.amazonaws.com/AWSCLIV2.msi"
        $awsInstaller = "$env:TEMP\AWSCLIV2.msi"
        Invoke-WebRequest -Uri $awsUrl -OutFile $awsInstaller -UseBasicParsing
        Start-Process msiexec.exe -ArgumentList "/i `"$awsInstaller`" /qn" -Wait
        Remove-Item $awsInstaller -ErrorAction SilentlyContinue
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        Write-Success "AWS CLI installed"
    } else {
        $awsVersion = aws --version 2>&1
        Write-Success "AWS CLI already installed ($awsVersion)"
    }

    Write-Success "All prerequisites ready!"
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
            Write-Info "Using existing repository."
            Set-Location $repoPath
            $SkipClone = $true
        }
    }
    
    if (-not $SkipClone) {
        Write-Info "Cloning repository with blob filtering..."
        git clone --no-checkout --filter=blob:none https://github.com/SecureFromScratch/Workshops.git 2>&1 | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "Failed to clone repository"
            exit 1
        }
        
        Set-Location $repoPath
        
        Write-Info "Setting up sparse checkout..."
        git sparse-checkout init --cone 2>&1 | Out-Null
        git sparse-checkout set csharp/recipes_2026/challanges/Recipes 2>&1 | Out-Null
        
        Write-Info "Checking out main branch..."
        git checkout main 2>&1 | Out-Null
        
        Write-Success "Repository cloned successfully!"
    }
} else {
    if (-not (Test-Path "Workshops")) {
        Write-ErrorMsg "Workshops directory not found. Cannot skip clone."
        exit 1
    }
    Set-Location Workshops
}

# Navigate to Recipes folder
$recipesPath = "csharp\recipes_2026\challanges\Recipes"
if (-not (Test-Path $recipesPath)) {
    Write-ErrorMsg "Recipes folder not found at $recipesPath"
    exit 1
}
Set-Location $recipesPath
Write-Info "Working directory: $(Get-Location)"

# ============================================================================
# STEP 3: Start LocalStack and Clean Previous State
# ============================================================================
Write-Step "STEP 3: Starting LocalStack"

Set-Location "src\Recipes.Api"

Write-Info "Cleaning up any previous Docker state..."
docker compose down -v 2>&1 | Out-Null

Write-Info "Starting LocalStack container..."
docker compose up -d localstack 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Failed to start LocalStack"
    Write-Host "Check Docker Desktop is running and try: docker compose up -d localstack" -ForegroundColor Yellow
    exit 1
}

if (-not (Wait-ForLocalStack -MaxSeconds 60)) {
    Write-ErrorMsg "LocalStack failed to start properly"
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check logs: docker logs localstack" -ForegroundColor Yellow
    Write-Host "2. Restart: docker compose restart localstack" -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# STEP 4: Configure AWS CLI for LocalStack
# ============================================================================
Write-Step "STEP 4: Configuring AWS CLI"

Write-Info "Setting AWS credentials for LocalStack..."
aws configure set aws_access_key_id localstack 2>&1 | Out-Null
aws configure set aws_secret_access_key localstack 2>&1 | Out-Null
aws configure set default.region us-east-1 2>&1 | Out-Null

Write-Success "AWS CLI configured for LocalStack"

# ============================================================================
# STEP 5: Create Secrets in LocalStack (PRODUCTION VERSION)
# ============================================================================
Write-Step "STEP 5: Creating Secrets in LocalStack"

$endpoint = "http://localhost:4566"

# Function to create secrets with proper error handling
function Set-Secret {
    param(
        [string]$Name,
        [string]$Value
    )
    
    Write-Info "Creating secret: $Name"
    
    # Delete if exists
    aws --endpoint-url=$endpoint secretsmanager delete-secret `
        --secret-id $Name `
        --force-delete-without-recovery 2>&1 | Out-Null
    
    Start-Sleep -Seconds 1
    
    # Create new
    $result = aws --endpoint-url=$endpoint secretsmanager create-secret `
        --name $Name `
        --secret-string $Value 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Secret '$Name' created"
        return $true
    } else {
        Write-ErrorMsg "Failed to create secret '$Name'"
        Write-Host "  Error: $result" -ForegroundColor Gray
        return $false
    }
}

# Create secrets
$secretsOk = $true
$secretsOk = $secretsOk -and (Set-Secret "recipes/dev/sa-password" "StrongP4ssword123")
$secretsOk = $secretsOk -and (Set-Secret "recipes/dev/app-db-connection" "Server=localhost,14333;Database=Recipes;User Id=recipes_app;Password=StrongP4ssword123;TrustServerCertificate=true;")

# JWT Config - Use escaped quotes for proper JSON
Write-Info "Creating secret: recipes/dev/jwt-config"
aws --endpoint-url=$endpoint secretsmanager delete-secret --secret-id recipes/dev/jwt-config --force-delete-without-recovery 2>&1 | Out-Null
Start-Sleep -Seconds 1

# CRITICAL: Use escaped double quotes for proper JSON formatting
$jwtResult = aws --endpoint-url=$endpoint secretsmanager create-secret `
    --name recipes/dev/jwt-config `
    --secret-string '{\"Secret\":\"ThisIsAStrongJwtSecretKey1234567\",\"Issuer\":\"recipes-api\",\"Audience\":\"recipes-client\"}' 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "Secret 'recipes/dev/jwt-config' created"
} else {
    Write-ErrorMsg "Failed to create jwt-config secret"
    Write-Host "  Error: $jwtResult" -ForegroundColor Gray
    $secretsOk = $false
}

if (-not $secretsOk) {
    Write-ErrorMsg "Some secrets failed to create"
    exit 1
}

Write-Success "All secrets configured successfully!"

# ============================================================================
# STEP 6: Install NuGet Packages and EF Tools
# ============================================================================
Write-Step "STEP 6: Installing NuGet Packages and EF Tools"

Set-Location "..\..\"

# Install EF Core tools
Write-Info "Installing Entity Framework Core tools..."
dotnet tool install --global dotnet-ef 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    dotnet tool update --global dotnet-ef 2>&1 | Out-Null
}
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
Write-Success "EF Core tools ready"

Write-Info "Installing Recipes.Api packages..."
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package AWSSDK.SecretsManager --version 4.0.4.3 2>&1 | Out-Null
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Azure.AI.OpenAI --version 2.1.0 2>&1 | Out-Null
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.23 2>&1 | Out-Null
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.AspNetCore.OpenApi --version 8.0.16 2>&1 | Out-Null
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore --version 8.0.23 2>&1 | Out-Null
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.23 2>&1 | Out-Null
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Microsoft.EntityFrameworkCore.Tools --version 8.0.23 2>&1 | Out-Null
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package OpenAI --version 2.8.0 2>&1 | Out-Null
dotnet add ./src/Recipes.Api/Recipes.Api.csproj package Swashbuckle.AspNetCore --version 6.6.2 2>&1 | Out-Null

Write-Info "Installing Recipes.Bff packages..."
dotnet add ./src/Recipes.Bff/Recipes.Bff.csproj package Yarp.ReverseProxy --version 2.3.0 2>&1 | Out-Null

Write-Info "Restoring all packages..."
dotnet restore 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Package installation failed"
    exit 1
}

Write-Success "All packages installed!"

# ============================================================================
# STEP 7: Install Angular Packages
# ============================================================================
Write-Step "STEP 7: Installing Angular Packages"

Set-Location "src\recipes-ui"
Write-Info "Running npm install (this may take a few minutes)..."
npm install 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "npm install failed"
    exit 1
}

Write-Success "Angular packages installed!"

# ============================================================================
# STEP 8: Setup Database (using start-db.ps1)
# ============================================================================
Write-Step "STEP 8: Setting up Database"

Set-Location "..\Recipes.Api"

Write-Info "Current directory: $(Get-Location)"

if (-not (Test-Path "start-db.ps1")) {
    Write-ErrorMsg "start-db.ps1 not found at: $(Get-Location)"
    exit 1
}

Write-Info "Running start-db.ps1 (handles SQL Server, init-db.sql, and migrations)..."
Write-Host "`n--- start-db.ps1 output ---" -ForegroundColor Gray

& .\start-db.ps1

Write-Host "--- end of start-db.ps1 ---`n" -ForegroundColor Gray

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Database setup had issues"
    Write-Host "`nYou can retry manually:" -ForegroundColor Yellow
    Write-Host "  cd src\Recipes.Api" -ForegroundColor Yellow
    Write-Host "  .\start-db.ps1" -ForegroundColor Yellow
} else {
    Write-Success "Database setup complete!"
}

# ============================================================================
# COMPLETION
# ============================================================================
Write-Step "SETUP COMPLETE!"

if ($script:hasErrors) {
    Write-Host "[WARNING] Setup completed with some warnings" -ForegroundColor Yellow
    Write-Host "Review the messages above`n" -ForegroundColor Yellow
} else {
    Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║               🎉 SETUP SUCCESSFUL! 🎉                    ║
╚═══════════════════════════════════════════════════════════╝

[SUCCESS] All Steps Completed!

 Services Running:
 • LocalStack: http://localhost:4566
 • SQL Server: localhost,14333

 Next Steps:
 1. Open VS Code in Recipes folder (with Recipes.sln)
    Location: $(Get-Location | Split-Path -Parent | Split-Path -Parent)

 2. Run Backend (API + BFF):
    • Press Ctrl+Shift+D
    • Select "API + BFF"
    • Press F5
    • Open Swagger: http://localhost:5000/swagger

 3. Run Frontend:
    • New terminal (Ctrl+`)
    • cd src/recipes-ui
    • ng s
    • Open http://localhost:4200

 Verify Setup: .\verify-setup.ps1
 Stop Services: docker compose down

"@ -ForegroundColor Green
}

Write-Host "Setup completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""
