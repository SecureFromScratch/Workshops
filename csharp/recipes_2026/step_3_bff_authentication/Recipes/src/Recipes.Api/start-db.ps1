#!/usr/bin/env pwsh
param(
    [string]$SecretId = "recipes/dev/sa-password",
    [string]$Endpoint = "http://localhost:4566"
)

Write-Host "Reading SA password from Secrets Manager: $SecretId"

$saPassword = aws --endpoint-url $Endpoint secretsmanager get-secret-value `
    --secret-id $SecretId `
    --query SecretString `
    --output text

if (-not $saPassword -or $saPassword -eq "null") {
    throw "Failed to get SA password from Secrets Manager."
}

$env:MSSQL_SA_PASSWORD = $saPassword

Write-Host "Starting sqlserver container..."
docker compose up -d sqlserver

Write-Host "Waiting for SQL Server to start..."
Start-Sleep -Seconds 15

Write-Host "Running init-db.sql inside container..."

docker exec -i recipes-sqlserver /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P $saPassword -C `
    -i /init/init-db.sql

Write-Host "DB initialized."
