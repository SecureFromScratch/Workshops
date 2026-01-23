# Restart Lab Environment
# Use this script when you've already set up the lab but need to restart your services

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

Write-Step "Restarting Lab Environment"

# Check if we're in the right location
$recipesPath = "Workshops\csharp\recipes_2026\challanges\Recipes"

if (-not (Test-Path $recipesPath)) {
    # Try to find it
    if (Test-Path "csharp\recipes_2026\challanges\Recipes") {
        Set-Location "csharp\recipes_2026\challanges\Recipes"
    } elseif (Test-Path "Recipes") {
        Set-Location "Recipes"
    } else {
        Write-Error "Cannot find Recipes folder. Please navigate to the Workshops directory first."
        exit 1
    }
} else {
    Set-Location $recipesPath
}

Set-Location "src\Recipes.Api"
Write-Info "Working directory: $(Get-Location)"

# Check Docker is running
Write-Info "Checking Docker..."
try {
    docker ps > $null 2>&1
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
}

# Start services
Write-Step "Starting Services"

Write-Info "Starting LocalStack..."
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
    Write-Success "LocalStack is ready at http://localhost:4566"
} else {
    Write-Warning "LocalStack health check timeout. Continuing anyway..."
}

# Verify secrets still exist
Write-Info "Verifying secrets in LocalStack..."
$endpoint = "http://localhost:4566"

$secretsOk = $true
try {
    aws --endpoint-url=$endpoint secretsmanager get-secret-value --secret-id recipes/dev/sa-password --query SecretString --output text > $null 2>&1
    if ($LASTEXITCODE -ne 0) { $secretsOk = $false }
} catch {
    $secretsOk = $false
}

if ($secretsOk) {
    Write-Success "Secrets verified"
} else {
    Write-Warning "Secrets not found in LocalStack. Recreating..."
    
    aws --endpoint-url=$endpoint secretsmanager create-secret `
        --name recipes/dev/sa-password `
        --secret-string "StrongP4ssword123" 2>$null
    
    aws --endpoint-url=$endpoint secretsmanager create-secret `
        --name recipes/dev/app-db-connection `
        --secret-string "Server=localhost,14333;Database=Recipes;User Id=recipes_app;Password=StrongP4ssword123;TrustServerCertificate=true;" 2>$null
    
    aws --endpoint-url=$endpoint secretsmanager create-secret `
        --name recipes/dev/jwt-config `
        --secret-string '{"Secret":"ThisIsAStrongJwtSecretKey1234567","Issuer":"recipes-api","Audience":"recipes-client"}' 2>$null
    
    Write-Success "Secrets recreated"
}

# Start SQL Server
Write-Info "Starting SQL Server..."
if (Test-Path "start-db.ps1") {
    & .\start-db.ps1
    Write-Success "SQL Server started at localhost,14333"
} else {
    Write-Warning "start-db.ps1 not found. Starting SQL Server directly..."
    docker compose up -d sqlserver
    Start-Sleep -Seconds 5
}

# Verify everything is running
Write-Step "Verification"

$containers = docker ps --format "{{.Names}}"
$localstackRunning = $containers -match "localstack"
$sqlRunning = $containers -match "sqlserver" -or $containers -match "sql"

if ($localstackRunning) {
    Write-Success "LocalStack is running"
} else {
    Write-Warning "LocalStack container not found"
}

if ($sqlRunning) {
    Write-Success "SQL Server is running"
} else {
    Write-Warning "SQL Server container not found"
}

Write-Step "Environment Ready!"

Write-Host @"

[SUCCESS] Environment Ready!

LocalStack running at http://localhost:4566
SQL Server running at localhost,14333
All secrets configured

READY TO CODE!

To run the application:
1. Open VS Code (make sure root is Recipes folder with .sln)
   
2. Run backend (API + BFF):
   - Ctrl+Shift+D -> Select "API + BFF" -> F5
   - Open Swagger: http://localhost:5000/swagger
   
3. Run frontend:
   - New terminal: cd src/recipes-ui
   - ng s
   - Open http://localhost:4200

To stop services when done:
  docker compose down

To check status:
  docker ps

"@ -ForegroundColor Green
