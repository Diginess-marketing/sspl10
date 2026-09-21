# Email Configuration Validator
# Run this script to check if your email SMTP settings are properly configured

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   SSPL T10 - Email Configuration Validator" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$envPath = "d:\ssplt10.cloud-prod-sync-20251006\httpdocs\.env"

# Check if .env file exists
if (!(Test-Path $envPath)) {
    Write-Host "❌ ERROR: .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

# Read .env file
$envContent = Get-Content $envPath -Raw

# Check for required variables
$requiredVars = @(
    "VITE_SMTP_HOST",
    "VITE_SMTP_USER", 
    "VITE_SMTP_PASSWORD",
    "VITE_SMTP_FROM_EMAIL"
)

$allConfigured = $true

Write-Host "Checking SMTP Configuration:" -ForegroundColor Yellow
Write-Host ""

foreach ($var in $requiredVars) {
    if ($envContent -match "$var=(.+)") {
        $value = $matches[1].Trim()
        
        # Check if it's a placeholder value
        if ($value -match "your-|yourdomain|your-app-password|your-email") {
            Write-Host "⚠️  $var is set but contains placeholder value" -ForegroundColor Yellow
            Write-Host "   Current: $value" -ForegroundColor Gray
            $allConfigured = $false
        }
        elseif ($value -eq "") {
            Write-Host "❌ $var is empty" -ForegroundColor Red
            $allConfigured = $false
        }
        else {
            # Mask sensitive values
            if ($var -eq "VITE_SMTP_PASSWORD") {
                $displayValue = "*" * 16
            } else {
                $displayValue = $value
            }
            Write-Host "✅ $var configured" -ForegroundColor Green
            Write-Host "   Value: $displayValue" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "❌ $var not found in .env" -ForegroundColor Red
        $allConfigured = $false
    }
    Write-Host ""
}

Write-Host "==================================================" -ForegroundColor Cyan

if ($allConfigured) {
    Write-Host ""
    Write-Host "🎉 All email configuration variables are set!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your development server (Ctrl+C then 'npm run dev')" -ForegroundColor White
    Write-Host "2. Test email by completing a registration with payment" -ForegroundColor White
    Write-Host "3. Check the email inbox for confirmation" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "⚠️  Email configuration is incomplete!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Action Required:" -ForegroundColor Cyan
    Write-Host "1. Open .env file: $envPath" -ForegroundColor White
    Write-Host "2. Replace placeholder values with your actual SMTP credentials" -ForegroundColor White
    Write-Host "3. Run this script again to verify" -ForegroundColor White
    Write-Host ""
    Write-Host "Quick Setup Guide:" -ForegroundColor Cyan
    Write-Host "- See QUICK_EMAIL_SETUP.md for 5-minute setup instructions" -ForegroundColor White
    Write-Host "- See EMAIL_SETUP_GUIDE.md for detailed documentation" -ForegroundColor White
    Write-Host ""
}

Write-Host "==================================================" -ForegroundColor Cyan
