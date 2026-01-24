#!/usr/bin/env pwsh
param(
    [string]$SecretId = "recipes/dev/sa-password",
    [string]$Endpoint = "http://localhost:4566",
    [string]$ProjectPath = "."
)

Write-Host "Reading SA password from Secrets Manager: $SecretId"

$saPassword = aws --endpoint-url $Endpoint secretsmanager get-secret-value `
    --secret-id $SecretId `
    --query SecretString `
    --output text

if (-not $saPassword -or $saPassword -eq "null") {
    throw "Failed to get SA password from Secrets Manager."
}

Write-Host "Password retrieved (length: $($saPassword.Length))"

# Set the environment variable BEFORE starting the container
$env:MSSQL_SA_PASSWORD = $saPassword

Write-Host "Stopping and removing existing sqlserver container and volumes..."
docker compose down sqlserver -v

Write-Host "Starting fresh sqlserver container with SA password..."
docker compose up -d sqlserver

# Clean up the environment variable immediately after container creation
Remove-Item Env:\MSSQL_SA_PASSWORD
Write-Host "Environment variable removed from current session."

Write-Host "Waiting for SQL Server to be ready..."
Start-Sleep -Seconds 15

# Test SA connection
Write-Host "Testing SA connection..."
$maxRetries = 5
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    $testResult = docker exec recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd `
        -S localhost -U sa -P $saPassword -C -Q "SELECT @@VERSION" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SA connection successful!" -ForegroundColor Green
        break
    }
    
    $retryCount++
    Write-Host "Connection attempt $retryCount failed, retrying in 5 seconds..."
    Start-Sleep -Seconds 5
}

if ($retryCount -eq $maxRetries) {
    Write-Host "SA login failed after $maxRetries attempts" -ForegroundColor Red
    docker logs recipes-sqlserver
    throw "Cannot connect with SA credentials"
}

Write-Host "`nRunning init-db.sql inside container..."
docker exec -i recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P $saPassword -C `
    -i /init/init-db.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database and users created successfully!" -ForegroundColor Green
} else {
    Write-Host "DB initialization failed!" -ForegroundColor Red
    throw "Failed to initialize database"
}

# Now run EF migrations using SA (from AWS Secret Manager)
Write-Host "`nApplying Entity Framework migrations..."
$saConnectionString = "Server=localhost,14333;Database=Recipes;User Id=sa;Password=$saPassword;TrustServerCertificate=true;"

# Check if migration history table exists and is corrupt
Write-Host "Checking migration state..."
$historyCheck = docker exec recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P $saPassword -d Recipes -C `
    -Q "SELECT COUNT(*) as cnt FROM __EFMigrationsHistory" 2>&1

if ($historyCheck -match "cnt") {
    # Table exists - check if it's empty
    $count = docker exec recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd `
        -S localhost -U sa -P $saPassword -d Recipes -C -h-1 `
        -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM __EFMigrationsHistory" 2>&1 | Where-Object { $_ -match '^\s*\d+\s*$' }
    
    if ($count -match '^\s*0\s*$') {
        Write-Host "Migration history table exists but is empty - dropping it..." -ForegroundColor Yellow
        docker exec recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd `
            -S localhost -U sa -P $saPassword -d Recipes -C `
            -Q "DROP TABLE __EFMigrationsHistory" 2>&1 | Out-Null
    }
}

Push-Location $ProjectPath
try {
    # Check if Migrations folder exists
    if (Test-Path "Migrations") {
        Write-Host "Found existing Migrations folder - removing old migrations..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "Migrations"
        Write-Host "Old migrations removed." -ForegroundColor Green
    }
    
    # Create fresh migration
    Write-Host "Creating fresh migration..."
    dotnet ef migrations add InitialCreate 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration created successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to create migration!" -ForegroundColor Red
        throw "Migration creation failed"
    }
    
    # Apply migration
    Write-Host "Applying migration to database..."
    dotnet ef database update --connection $saConnectionString
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Migration command failed!" -ForegroundColor Red
        throw "Failed to apply migrations"
    }
    
    Write-Host "Migration command completed - verifying tables were created..."
    
    # CRITICAL: Verify tables actually exist
    $tablesResult = docker exec recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd `
        -S localhost -U sa -P $saPassword -d Recipes -C -h-1 `
        -Q "SET NOCOUNT ON; SELECT COUNT(*) FROM sys.tables WHERE name IN ('Users', 'Recipe')" 2>&1 | Where-Object { $_ -match '^\s*\d+\s*$' }
    
    if ($tablesResult -match '^\s*2\s*$') {
        Write-Host "SUCCESS: Tables verified (Users and Recipes exist)!" -ForegroundColor Green
        
        # Show what was created
        Write-Host "`nCreated tables:" -ForegroundColor Cyan
        docker exec recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd `
            -S localhost -U sa -P $saPassword -d Recipes -C `
            -Q "SELECT name FROM sys.tables ORDER BY name"
    } else {
        Write-Host "ERROR: Tables were NOT created!" -ForegroundColor Red
        Write-Host "Migration may have failed silently." -ForegroundColor Red
        
        # Show what exists
        Write-Host "`nCurrent tables:" -ForegroundColor Yellow
        docker exec recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd `
            -S localhost -U sa -P $saPassword -d Recipes -C `
            -Q "SELECT name FROM sys.tables ORDER BY name"
        
        throw "FATAL: Migrations did not create tables. Check if DbContext and entity models are configured correctly."
    }
    
} finally {
    Pop-Location
}

Write-Host "`nDatabase setup complete!" -ForegroundColor Green

# Clear the password variable from memory
$saPassword = $null
