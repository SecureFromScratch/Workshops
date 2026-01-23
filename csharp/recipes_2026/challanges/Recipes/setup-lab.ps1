# LocalStack & AWS CLI Diagnostic Script
# Run this if you're having issues with secret creation

Write-Host "`n=== LocalStack & AWS CLI Diagnostics ===" -ForegroundColor Cyan

# Test 1: Check if AWS CLI is installed
Write-Host "`n1. Checking AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "[OK] AWS CLI installed: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] AWS CLI not found" -ForegroundColor Red
    Write-Host "Install from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check AWS CLI configuration
Write-Host "`n2. Checking AWS CLI configuration..." -ForegroundColor Yellow
$accessKey = aws configure get aws_access_key_id 2>&1
$secretKey = aws configure get aws_secret_access_key 2>&1
$region = aws configure get default.region 2>&1

if ($accessKey -eq "localstack" -and $secretKey -eq "localstack" -and $region -eq "us-east-1") {
    Write-Host "[OK] AWS CLI configured for LocalStack" -ForegroundColor Green
} else {
    Write-Host "[WARN] AWS CLI not configured properly" -ForegroundColor Yellow
    Write-Host "  Access Key: $accessKey (should be 'localstack')" -ForegroundColor Gray
    Write-Host "  Secret Key: $secretKey (should be 'localstack')" -ForegroundColor Gray
    Write-Host "  Region: $region (should be 'us-east-1')" -ForegroundColor Gray
    
    Write-Host "`nConfiguring now..." -ForegroundColor Cyan
    aws configure set aws_access_key_id localstack
    aws configure set aws_secret_access_key localstack
    aws configure set default.region us-east-1
    Write-Host "[OK] Configuration updated" -ForegroundColor Green
}

# Test 3: Check if LocalStack container is running
Write-Host "`n3. Checking LocalStack container..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" 2>&1
if ($containers -match "localstack") {
    Write-Host "[OK] LocalStack container is running" -ForegroundColor Green
} else {
    Write-Host "[FAIL] LocalStack container not found" -ForegroundColor Red
    Write-Host "Start it with: docker compose up -d localstack" -ForegroundColor Yellow
    exit 1
}

# Test 4: Check LocalStack health endpoint
Write-Host "`n4. Checking LocalStack health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:4566/_localstack/health" -TimeoutSec 5 -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "[OK] LocalStack is responding" -ForegroundColor Green
        
        # Parse health data
        $health = $healthResponse.Content | ConvertFrom-Json
        Write-Host "`nServices status:" -ForegroundColor Gray
        $health.services.PSObject.Properties | ForEach-Object {
            $service = $_.Name
            $status = $_.Value
            if ($status -eq "running" -or $status -eq "available") {
                Write-Host "  $service : $status" -ForegroundColor Green
            } else {
                Write-Host "  $service : $status" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "[WARN] LocalStack responded with status: $($healthResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[FAIL] Cannot reach LocalStack at http://localhost:4566" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Gray
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Docker Desktop is running"
    Write-Host "2. Check container: docker ps | findstr localstack"
    Write-Host "3. Check logs: docker logs localstack"
    exit 1
}

# Test 5: Test Secrets Manager endpoint specifically
Write-Host "`n5. Testing Secrets Manager endpoint..." -ForegroundColor Yellow
try {
    # Try to list secrets (should work even if empty)
    $listResult = aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Secrets Manager endpoint is working" -ForegroundColor Green
        
        # Show existing secrets if any
        $secrets = $listResult | ConvertFrom-Json
        if ($secrets.SecretList.Count -gt 0) {
            Write-Host "`nExisting secrets:" -ForegroundColor Gray
            $secrets.SecretList | ForEach-Object {
                Write-Host "  - $($_.Name)" -ForegroundColor Gray
            }
        } else {
            Write-Host "  No secrets exist yet (this is normal for first run)" -ForegroundColor Gray
        }
    } else {
        Write-Host "[FAIL] Secrets Manager endpoint not responding" -ForegroundColor Red
        Write-Host "Output: $listResult" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Error testing Secrets Manager" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Gray
}

# Test 6: Try to create a test secret
Write-Host "`n6. Testing secret creation..." -ForegroundColor Yellow
$testSecretName = "test/diagnostic-secret"
try {
    # Try to create test secret
    $createResult = aws --endpoint-url=http://localhost:4566 secretsmanager create-secret `
        --name $testSecretName `
        --secret-string "test-value" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Successfully created test secret" -ForegroundColor Green
        
        # Try to retrieve it
        $getValue = aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value `
            --secret-id $testSecretName `
            --query SecretString `
            --output text 2>&1
        
        if ($LASTEXITCODE -eq 0 -and $getValue -eq "test-value") {
            Write-Host "[OK] Successfully retrieved test secret" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Could not retrieve test secret" -ForegroundColor Yellow
        }
        
        # Clean up test secret
        aws --endpoint-url=http://localhost:4566 secretsmanager delete-secret `
            --secret-id $testSecretName `
            --force-delete-without-recovery 2>&1 | Out-Null
        Write-Host "[OK] Test secret cleaned up" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Could not create test secret" -ForegroundColor Red
        Write-Host "Output: $createResult" -ForegroundColor Gray
    }
} catch {
    Write-Host "[FAIL] Error during secret test" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Gray
}

# Summary
Write-Host "`n=== Diagnostic Summary ===" -ForegroundColor Cyan
Write-Host "If all tests passed, you can run: .\setup-lab.ps1" -ForegroundColor Green
Write-Host "`nIf tests failed:" -ForegroundColor Yellow
Write-Host "1. Make sure Docker Desktop is running"
Write-Host "2. Check LocalStack logs: docker logs localstack"
Write-Host "3. Restart LocalStack: docker compose restart localstack"
Write-Host "4. Wait 30 seconds and run this diagnostic again"
Write-Host "`n"
