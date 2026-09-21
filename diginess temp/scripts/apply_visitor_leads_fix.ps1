
Write-Host "Starting Visitor Leads Fix Application..." -ForegroundColor Cyan

# 1. Check for Supabase CLI
if (!(Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Supabase CLI is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Supabase CLI to proceed."
    exit 1
}

# 2. Link check (simplified)
Write-Host "Checking Supabase project status..."
supabase status

# 3. Apply Migration
Write-Host "`nApplying database migration..." -ForegroundColor Yellow
$migrationFile = "D:\ssplt10.cloud-prod-sync-20251006\httpdocs\supabase\migrations\20260116000000_create_visitor_leads.sql"

if (Test-Path $migrationFile) {
    # Try to push migrations (standard way)
    Write-Host "Pushing migrations to remote..."
    supabase db push
    
    # Fallback/Direct check
    Write-Host "If db push didn't apply the specific file, you might need to run:"
    Write-Host "supabase db reset (WARNING: DESTRUCTIVE)" -ForegroundColor Red
    Write-Host "OR copy the content of $migrationFile to the Supabase SQL Editor manually." -ForegroundColor Green
}
else {
    Write-Host "Migration file not found at $migrationFile" -ForegroundColor Red
}

# 4. Deploy Function
Write-Host "`nDeploying ga4-utm-report function..." -ForegroundColor Yellow
cd "D:\ssplt10.cloud-prod-sync-20251006\httpdocs"
supabase functions deploy ga4-utm-report --no-verify-jwt

Write-Host "`nFix application script finished." -ForegroundColor Cyan
Write-Host "Please check the output for any errors."
