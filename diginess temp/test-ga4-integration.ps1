# Test GA4 Integration in Supabase
# This script checks if the GA4 Edge Function is deployed and working

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "=== GA4 Integration Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
    
    # Load environment variables
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -like "VITE_SUPABASE*") {
                Set-Item -Path "env:$name" -Value $value
                Write-Host "  Loaded: $name" -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Get Supabase URL and Anon Key
$supabaseUrl = $env:VITE_SUPABASE_URL
$supabaseKey = $env:VITE_SUPABASE_ANON_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "✗ Supabase credentials not found in .env" -ForegroundColor Red
    Write-Host "  Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set" -ForegroundColor Yellow
    exit 1
}

Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor Cyan
Write-Host ""

# Extract project ref from URL
if ($supabaseUrl -match '([a-z]+)\.supabase\.co') {
    $projectRef = $matches[1]
    Write-Host "Project Reference: $projectRef" -ForegroundColor Cyan
} else {
    Write-Host "✗ Could not extract project reference from URL" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Testing GA4 Edge Function ===" -ForegroundColor Cyan
Write-Host ""

# Test Edge Function
$functionUrl = "$supabaseUrl/functions/v1/ga4-utm-report"
$headers = @{
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}
$body = @{
    startDate = "30daysAgo"
    endDate = "today"
} | ConvertTo-Json

Write-Host "Calling: $functionUrl" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $functionUrl -Method Post -Headers $headers -Body $body -TimeoutSec 30
    
    Write-Host "✓ Edge Function is deployed and responding!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    if ($statusCode -eq 404) {
        Write-Host "✗ Edge Function not found (404)" -ForegroundColor Red
        Write-Host "  The ga4-utm-report function is not deployed" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To deploy it, run:" -ForegroundColor Yellow
        Write-Host "  supabase functions deploy ga4-utm-report" -ForegroundColor White
    } elseif ($statusCode -eq 500) {
        Write-Host "✗ Edge Function error (500)" -ForegroundColor Red
        Write-Host "  The function exists but encountered an error" -ForegroundColor Yellow
        Write-Host "  Error: $errorMessage" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  1. GA4 secrets not configured (GA4_SERVICE_ACCOUNT_EMAIL, GA4_PRIVATE_KEY, GA4_PROPERTY_ID)" -ForegroundColor White
        Write-Host "  2. Invalid GA4 credentials" -ForegroundColor White
        Write-Host "  3. GA4 API not enabled in Google Cloud Console" -ForegroundColor White
    } else {
        Write-Host "✗ Request failed: $errorMessage" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Login to Supabase CLI:" -ForegroundColor White
Write-Host "   supabase login" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Link your project:" -ForegroundColor White
Write-Host "   supabase link --project-ref $projectRef" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check deployed functions:" -ForegroundColor White
Write-Host "   supabase functions list" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Check secrets:" -ForegroundColor White
Write-Host "   supabase secrets list" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Deploy the function:" -ForegroundColor White
Write-Host "   supabase functions deploy ga4-utm-report" -ForegroundColor Gray
Write-Host ""
