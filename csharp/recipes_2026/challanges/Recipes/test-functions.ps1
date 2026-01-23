# Test Script - Verify PowerShell Functions Work
# Run this to test if the helper functions work in your PowerShell version

Write-Host "`n=== Testing Helper Functions ===" -ForegroundColor Cyan

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

function Write-Check {
    param(
        [string]$Name,
        [bool]$Passed,
        [string]$Details = ""
    )
    
    if ($Passed) {
        Write-Host "[OK] " -ForegroundColor Green -NoNewline
        Write-Host "$Name" -NoNewline
        if ($Details) {
            Write-Host " - $Details" -ForegroundColor Gray
        } else {
            Write-Host ""
        }
    } else {
        Write-Host "[FAIL] " -ForegroundColor Red -NoNewline
        Write-Host "$Name" -NoNewline
        if ($Details) {
            Write-Host " - $Details" -ForegroundColor Yellow
        } else {
            Write-Host ""
        }
    }
}

# Test the functions
Write-Step "Testing Step Message"
Write-Success "This is a success message"
Write-Info "This is an info message"
Write-Check "Test Check Pass" $true "with details"
Write-Check "Test Check Fail" $false "with error details"

Write-Host "`n=== PowerShell Version ===" -ForegroundColor Cyan
Write-Host "Version: $($PSVersionTable.PSVersion)"
Write-Host "Edition: $($PSVersionTable.PSEdition)"

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "If you see colored output above, the functions work correctly!`n"
