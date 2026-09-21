# Supabase UTM Tracking System - Deployment Instructions

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  SUPABASE UTM TRACKING SYSTEM - DEPLOYMENT" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Environment Check
Write-Host "STEP 1: Environment Configuration" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "CHECK: .env file has been updated with your Supabase credentials:" -ForegroundColor Green
Write-Host "  VITE_SUPABASE_URL: https://fazpykekypcktcmniwbj.supabase.co" -ForegroundColor Gray
Write-Host "  VITE_SUPABASE_ANON_KEY: [configured]" -ForegroundColor Gray
Write-Host ""

# Step 2: Database Deployment
Write-Host "STEP 2: Deploy Database Schema" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "You must manually run the SQL setup in Supabase Dashboard:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open Supabase Dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Navigate to SQL Editor:" -ForegroundColor White
Write-Host "   Project: fazpykekypcktcmniwbj" -ForegroundColor Gray
Write-Host "   Dashboard -> SQL Editor" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Copy the SQL from: SUPABASE_UTM_SETUP.sql" -ForegroundColor White
Write-Host ""
Write-Host "4. Paste into SQL Editor and click 'RUN'" -ForegroundColor White
Write-Host ""
Write-Host "5. Verify these were created:" -ForegroundColor White
Write-Host "   - Table: utm_events" -ForegroundColor Gray
Write-Host "   - View: utm_summary" -ForegroundColor Gray
Write-Host "   - Function: log_payment_event" -ForegroundColor Gray
Write-Host "   - Trigger: trigger_log_payment_event" -ForegroundColor Gray
Write-Host ""

# Step 3: Verify Database
Write-Host "STEP 3: Verify Database Setup" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "In Supabase SQL Editor, run these verification queries:" -ForegroundColor Cyan
Write-Host ""

Write-Host "Query 1: Check utm_events table exists" -ForegroundColor White
Write-Host "  SELECT * FROM utm_events LIMIT 1;" -ForegroundColor Gray
Write-Host ""

Write-Host "Query 2: Check utm_summary view exists" -ForegroundColor White
Write-Host "  SELECT * FROM utm_summary LIMIT 1;" -ForegroundColor Gray
Write-Host ""

Write-Host "Query 3: List all indexes" -ForegroundColor White
Write-Host "  SELECT indexname FROM pg_indexes WHERE tablename = 'utm_events';" -ForegroundColor Gray
Write-Host ""

# Step 4: Start Dev Server
Write-Host "STEP 4: Start Development Server" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run the development server:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "This will start the app at: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

# Step 5: Test the System
Write-Host "STEP 5: Test UTM Tracking" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Test with UTM parameters:" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL:" -ForegroundColor White
Write-Host "  http://localhost:5173/register?utm_id=TEST001&utm_source=google&utm_medium=cpc&utm_campaign=test" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected Behavior:" -ForegroundColor White
Write-Host "  1. Page loads with UTM parameters in URL" -ForegroundColor Gray
Write-Host "  2. localStorage contains utm_data with your parameters" -ForegroundColor Gray
Write-Host "  3. scan event logged to utm_events table" -ForegroundColor Gray
Write-Host "  4. Fill out registration form and submit" -ForegroundColor Gray
Write-Host "  5. registration event logged to utm_events table" -ForegroundColor Gray
Write-Host ""

# Step 6: View Analytics
Write-Host "STEP 6: View Analytics Dashboard" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Visit the analytics dashboard:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  http://localhost:5173/analytics" -ForegroundColor Gray
Write-Host ""
Write-Host "You should see:" -ForegroundColor White
Write-Host "  - Summary cards with event counts" -ForegroundColor Gray
Write-Host "  - Campaign table with conversion data" -ForegroundColor Gray
Write-Host "  - Conversion funnel visualization" -ForegroundColor Gray
Write-Host "  - Export to CSV button" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration Status:" -ForegroundColor Yellow
Write-Host "  CHECK .env file updated with Supabase credentials" -ForegroundColor Green
Write-Host "  CHECK Code files ready in src/" -ForegroundColor Green
Write-Host "  CHECK Database schema in SUPABASE_UTM_SETUP.sql" -ForegroundColor Green
Write-Host ""

Write-Host "Manual Steps Required:" -ForegroundColor Yellow
Write-Host "  -> Deploy SQL schema to Supabase" -ForegroundColor Cyan
Write-Host "  -> Start npm run dev" -ForegroundColor Cyan
Write-Host "  -> Test with UTM parameters" -ForegroundColor Cyan
Write-Host "  -> View analytics dashboard" -ForegroundColor Cyan
Write-Host ""

Write-Host "Estimated Total Time: 15 minutes" -ForegroundColor Gray
Write-Host ""

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  NEXT STEP: Go to Supabase Dashboard and run the SQL setup" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
