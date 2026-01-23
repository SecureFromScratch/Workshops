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

Push-Location $ProjectPath
try {
    dotnet ef database update --connection $saConnectionString
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migrations applied successfully!" -ForegroundColor Green
    } else {
        Write-Host "Migration failed!" -ForegroundColor Red
        throw "Failed to apply migrations"
    }
} finally {
    Pop-Location
}

Write-Host "`nDatabase setup complete!" -ForegroundColor Green

# Clear the password variable from memory
$saPassword = $null
