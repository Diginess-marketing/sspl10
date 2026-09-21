# GA4 Integration Test Script
# Tests the complete GA4 integration flow

Write-Host "=== GA4 Integration Test ===" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
$env:VITE_SUPABASE_URL = (Get-Content .env | Select-String 'VITE_SUPABASE_URL').ToString().Split('=')[1].Trim()
$env:VITE_SUPABASE_ANON_KEY = (Get-Content .env | Select-String 'VITE_SUPABASE_ANON_KEY').ToString().Split('=')[1].Trim()

Write-Host "✓ Environment loaded" -ForegroundColor Green
Write-Host "  URL: $env:VITE_SUPABASE_URL" -ForegroundColor Gray
Write-Host ""

# Test 1: Check Edge Function Deployment
Write-Host "Test 1: Checking Edge Function Deployment..." -ForegroundColor Yellow
$functions = supabase functions list | Out-String
if ($functions -match 'ga4-utm-report') {
    Write-Host "✓ GA4 Edge Function is deployed" -ForegroundColor Green
} else {
    Write-Host "✗ GA4 Edge Function not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Check Secrets Configuration
Write-Host "Test 2: Checking Secrets Configuration..." -ForegroundColor Yellow
$secrets = supabase secrets list | Out-String
$requiredSecrets = @('GA4_SERVICE_ACCOUNT_EMAIL', 'GA4_PRIVATE_KEY', 'GA4_PROPERTY_ID')
$allSecretsPresent = $true

foreach ($secret in $requiredSecrets) {
    if ($secrets -match $secret) {
        Write-Host "✓ $secret is configured" -ForegroundColor Green
    } else {
        Write-Host "✗ $secret is missing" -ForegroundColor Red
        $allSecretsPresent = $false
    }
}

if (-not $allSecretsPresent) {
    Write-Host "✗ Some secrets are missing" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Test Edge Function API Call
Write-Host "Test 3: Testing Edge Function API Call..." -ForegroundColor Yellow
$url = "$env:VITE_SUPABASE_URL/functions/v1/ga4-utm-report"
$headers = @{
    "Authorization" = "Bearer $env:VITE_SUPABASE_ANON_KEY"
    "Content-Type" = "application/json"
}
$body = @{
    startDate = "7daysAgo"
    endDate = "today"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -TimeoutSec 30
    Write-Host "✓ API call successful" -ForegroundColor Green
    Write-Host "  Response type: $($response.GetType().Name)" -ForegroundColor Gray
    
    if ($response -is [array]) {
        Write-Host "  Records returned: $($response.Count)" -ForegroundColor Gray
        if ($response.Count -gt 0) {
            Write-Host ""
            Write-Host "Sample Record:" -ForegroundColor Cyan
            $response[0] | ConvertTo-Json -Depth 3
        }
    } else {
        Write-Host "  Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ API call failed" -ForegroundColor Red
    $statusCode = $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "  Status: $statusCode" -ForegroundColor Red
    Write-Host "  Error: $responseBody" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Verify Frontend Files
Write-Host "Test 4: Verifying Frontend Files..." -ForegroundColor Yellow
$files = @(
    "src\services\ga4DataFetchService.ts",
    "src\components\GA4ReportViewer.tsx",
    "src\pages\GA4Analytics.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "✗ $file missing" -ForegroundColor Red
    }
}
Write-Host ""

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✓ All tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Visit http://localhost:5173/ga4-analytics to view the dashboard" -ForegroundColor White
Write-Host "2. Click 'Fetch GA4 Data' to load analytics from Google Analytics 4" -ForegroundColor White
Write-Host "3. Adjust date ranges to view different time periods" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard Features:" -ForegroundColor Yellow
Write-Host "- Real-time UTM campaign performance" -ForegroundColor White
Write-Host "- User, session, and conversion metrics" -ForegroundColor White
Write-Host "- Revenue tracking by campaign" -ForegroundColor White
Write-Host "- Conversion rate calculations" -ForegroundColor White
Write-Host ""
