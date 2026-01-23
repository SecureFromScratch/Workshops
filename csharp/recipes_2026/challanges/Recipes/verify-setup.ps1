# Verification Script for Lab Setup
# Run this to check if everything is installed and configured correctly

$ErrorActionPreference = "Continue"

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Write-Check {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Details = ""
    )
    
    if ($Passed) {
        Write-Host "✓ " -ForegroundColor Green -NoNewline
        Write-Host "$Name" -NoNewline
        if ($Details) {
            Write-Host " - $Details" -ForegroundColor Gray
        } else {
            Write-Host ""
        }
    } else {
        Write-Host "✗ " -ForegroundColor Red -NoNewline
        Write-Host "$Name" -NoNewline
        if ($Details) {
            Write-Host " - $Details" -ForegroundColor Yellow
        } else {
            Write-Host ""
        }
    }
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Lab Setup Verification" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$allPassed = $true

# Check Prerequisites
Write-Host "Prerequisites:" -ForegroundColor Yellow

$dotnetInstalled = Test-Command "dotnet"
if ($dotnetInstalled) {
    $dotnetVersion = dotnet --version
    Write-Check ".NET SDK" $true $dotnetVersion
} else {
    Write-Check ".NET SDK" $false "NOT FOUND"
    $allPassed = $false
}

$nodeInstalled = Test-Command "node"
if ($nodeInstalled) {
    $nodeVersion = node --version
    Write-Check "Node.js" $true $nodeVersion
} else {
    Write-Check "Node.js" $false "NOT FOUND"
    $allPassed = $false
}

$gitInstalled = Test-Command "git"
if ($gitInstalled) {
    $gitVersion = git --version
    Write-Check "Git" $true $gitVersion
} else {
    Write-Check "Git" $false "NOT FOUND"
    $allPassed = $false
}

$dockerInstalled = Test-Command "docker"
if ($dockerInstalled) {
    $dockerVersion = docker --version
    Write-Check "Docker" $true $dockerVersion
} else {
    Write-Check "Docker" $false "NOT FOUND"
    $allPassed = $false
}

$awsInstalled = Test-Command "aws"
if ($awsInstalled) {
    $awsVersion = aws --version 2>&1
    Write-Check "AWS CLI" $true $awsVersion
} else {
    Write-Check "AWS CLI" $false "NOT FOUND"
    $allPassed = $false
}

# Check Docker Services
Write-Host "`nDocker Services:" -ForegroundColor Yellow

if ($dockerInstalled) {
    try {
        $containers = docker ps --format "{{.Names}}" 2>&1
        
        $localstackRunning = $containers -contains "localstack" -or $containers -match "localstack"
        Write-Check "LocalStack Container" $localstackRunning $(if ($localstackRunning) { "Running" } else { "Not running" })
        if (-not $localstackRunning) { $allPassed = $false }
        
        $sqlserverRunning = $containers -match "sqlserver" -or $containers -match "sql"
        Write-Check "SQL Server Container" $sqlserverRunning $(if ($sqlserverRunning) { "Running" } else { "Not running" })
        if (-not $sqlserverRunning) { $allPassed = $false }
    } catch {
        Write-Check "Docker Daemon" $false "Docker is not running"
        $allPassed = $false
    }
} else {
    Write-Check "Docker Services" $false "Docker not installed"
}

# Check LocalStack Health
Write-Host "`nLocalStack Services:" -ForegroundColor Yellow

try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:4566/_localstack/health" -TimeoutSec 5 -ErrorAction Stop
    $healthOk = $healthResponse.StatusCode -eq 200
    Write-Check "LocalStack API" $healthOk "http://localhost:4566"
    
    if ($healthOk) {
        # Check if Secrets Manager service is available
        $health = $healthResponse.Content | ConvertFrom-Json
        $secretsManagerRunning = $health.services.secretsmanager -eq "running" -or $health.services.secretsmanager -eq "available"
        Write-Check "Secrets Manager Service" $secretsManagerRunning
        if (-not $secretsManagerRunning) { $allPassed = $false }
    }
} catch {
    Write-Check "LocalStack API" $false "Cannot reach http://localhost:4566"
    $allPassed = $false
}

# Check AWS CLI Configuration
Write-Host "`nAWS CLI Configuration:" -ForegroundColor Yellow

if ($awsInstalled) {
    try {
        $accessKey = aws configure get aws_access_key_id 2>&1
        $secretKey = aws configure get aws_secret_access_key 2>&1
        $region = aws configure get default.region 2>&1
        
        $awsConfigured = ($accessKey -eq "localstack") -and ($secretKey -eq "localstack") -and ($region -eq "us-east-1")
        Write-Check "AWS Credentials" $awsConfigured $(if ($awsConfigured) { "Configured for LocalStack" } else { "Not configured correctly" })
        if (-not $awsConfigured) { $allPassed = $false }
    } catch {
        Write-Check "AWS Configuration" $false "Error reading AWS config"
        $allPassed = $false
    }
}

# Check Secrets in LocalStack
Write-Host "`nLocalStack Secrets:" -ForegroundColor Yellow

if ($awsInstalled) {
    try {
        $endpoint = "http://localhost:4566"
        
        # Check sa-password
        $saPassword = aws --endpoint-url=$endpoint secretsmanager get-secret-value --secret-id recipes/dev/sa-password --query SecretString --output text 2>&1
        $saPasswordExists = $LASTEXITCODE -eq 0
        Write-Check "recipes/dev/sa-password" $saPasswordExists
        if (-not $saPasswordExists) { $allPassed = $false }
        
        # Check app-db-connection
        $appConnection = aws --endpoint-url=$endpoint secretsmanager get-secret-value --secret-id recipes/dev/app-db-connection --query SecretString --output text 2>&1
        $appConnectionExists = $LASTEXITCODE -eq 0
        Write-Check "recipes/dev/app-db-connection" $appConnectionExists
        if (-not $appConnectionExists) { $allPassed = $false }
        
        # Check jwt-config
        $jwtConfig = aws --endpoint-url=$endpoint secretsmanager get-secret-value --secret-id recipes/dev/jwt-config --query SecretString --output text 2>&1
        $jwtConfigExists = $LASTEXITCODE -eq 0
        Write-Check "recipes/dev/jwt-config" $jwtConfigExists
        if (-not $jwtConfigExists) { $allPassed = $false }
    } catch {
        Write-Check "Secrets Verification" $false "Cannot verify secrets"
        $allPassed = $false
    }
}

# Check Repository
Write-Host "`nRepository:" -ForegroundColor Yellow

$repoExists = Test-Path "Workshops"
Write-Check "Workshops Repository" $repoExists
if (-not $repoExists) { $allPassed = $false }

if ($repoExists) {
    $recipesPath = "Workshops\csharp\recipes_2026\challanges\Recipes"
    $recipesFolderExists = Test-Path $recipesPath
    Write-Check "Recipes Folder" $recipesFolderExists
    if (-not $recipesFolderExists) { $allPassed = $false }
    
    if ($recipesFolderExists) {
        # Check for key files
        $slnExists = Test-Path "$recipesPath\Recipes.sln"
        Write-Check "Solution File (.sln)" $slnExists
        
        $apiExists = Test-Path "$recipesPath\src\Recipes.Api"
        Write-Check "Recipes.Api Project" $apiExists
        
        $bffExists = Test-Path "$recipesPath\src\Recipes.Bff"
        Write-Check "Recipes.Bff Project" $bffExists
        
        $uiExists = Test-Path "$recipesPath\src\recipes-ui"
        Write-Check "recipes-ui (Angular)" $uiExists
        
        if (-not ($slnExists -and $apiExists -and $bffExists -and $uiExists)) {
            $allPassed = $false
        }
    }
}

# Check NuGet Packages
Write-Host "`nNuGet Packages:" -ForegroundColor Yellow

if ($repoExists -and (Test-Path $recipesPath)) {
    Push-Location "$recipesPath\src\Recipes.Api"
    
    $packagesRestored = Test-Path "obj\project.assets.json"
    Write-Check "Packages Restored" $packagesRestored
    if (-not $packagesRestored) { $allPassed = $false }
    
    Pop-Location
}

# Check Node Modules
Write-Host "`nNode Modules:" -ForegroundColor Yellow

if ($repoExists -and (Test-Path $recipesPath)) {
    $nodeModulesExists = Test-Path "$recipesPath\src\recipes-ui\node_modules"
    Write-Check "Angular node_modules" $nodeModulesExists
    if (-not $nodeModulesExists) { $allPassed = $false }
}

# Summary
Write-Host "`n================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "✓ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "`nYour lab environment is ready to use!" -ForegroundColor Green
    Write-Host "`nTo run the application:" -ForegroundColor Yellow
    Write-Host "1. Open VS Code in the Recipes folder (with Recipes.sln)"
    Write-Host "2. Press Ctrl+Shift+D and select 'API + BFF', then F5"
    Write-Host "3. Open Swagger: http://localhost:5000/swagger"
    Write-Host "4. In new terminal: cd src/recipes-ui && ng s"
    Write-Host "5. Open app: http://localhost:4200"
    Write-Host "`nSee QUICK-REFERENCE.md for a handy cheat sheet!" -ForegroundColor Cyan
} else {
    Write-Host "✗ SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host "`nPlease review the failed checks above." -ForegroundColor Yellow
    Write-Host "`nTo fix issues:" -ForegroundColor Yellow
    Write-Host "1. Rerun setup-lab.ps1 for full setup"
    Write-Host "2. Check the troubleshooting guide in QUICK-START.md"
    Write-Host "3. Contact your instructor if problems persist"
}

Write-Host "================================`n" -ForegroundColor Cyan
