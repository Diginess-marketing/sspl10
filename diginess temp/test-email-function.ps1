# Test Send Confirmation Mail Function
# This script tests the Azure Microsoft Graph email function

Write-Host "=== Testing send-confirmation-mail Edge Function ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SUPABASE_URL = "https://fazpykekypcktcmniwbj.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM"

# Test data
Write-Host "Enter test email address: " -NoNewline -ForegroundColor Yellow
$testEmail = Read-Host

$testData = @{
    email = $testEmail
    playerName = "Test Player"
    amount = 590
    paymentId = "pay_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
    registrationId = "reg_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

Write-Host ""
Write-Host "Sending test email request..." -ForegroundColor Yellow
Write-Host "Test Data:" -ForegroundColor Gray
Write-Host $testData -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/functions/v1/send-confirmation-mail" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $ANON_KEY"
            "Content-Type" = "application/json"
        } `
        -Body $testData `
        -ErrorAction Stop

    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host ""
    Write-Host "Check your email inbox (including spam folder)!" -ForegroundColor Yellow
}
catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Red
        Write-Host $responseBody
    }
    
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if all Azure secrets are set: supabase secrets list" -ForegroundColor White
    Write-Host "2. Verify function is deployed: supabase functions list" -ForegroundColor White
    Write-Host "3. Check Azure Portal for API permissions" -ForegroundColor White
    Write-Host "4. Review function logs in Supabase dashboard" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
