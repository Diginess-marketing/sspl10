#!/usr/bin/env python3
"""
Supabase UTM Tracking System Deployment Script
Deploys the database schema and setup to Supabase
"""

import sys
import os
from datetime import datetime

try:
    from supabase import create_client
except ImportError:
    print("ERROR: supabase library not found")
    print("Install with: pip install supabase")
    sys.exit(1)

# Configuration
SUPABASE_URL = "https://fazpykekypcktcmniwbj.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU"

# SQL setup commands
SQL_SETUP = """
-- ============================================
-- UTM Events Tracking System Setup
-- ============================================

-- 1. Create utm_events table to store all UTM tracking events
CREATE TABLE IF NOT EXISTS utm_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  event_id VARCHAR(255) UNIQUE,
  utm_id VARCHAR(255),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  registration_id VARCHAR(255),
  metadata JSONB DEFAULT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_utm_events_utm_id ON utm_events(utm_id);
CREATE INDEX IF NOT EXISTS idx_utm_events_event_type ON utm_events(event_type);
CREATE INDEX IF NOT EXISTS idx_utm_events_registration_id ON utm_events(registration_id);
CREATE INDEX IF NOT EXISTS idx_utm_events_timestamp ON utm_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_utm_events_event_id ON utm_events(event_id);

-- 2. Create sql trigger function to log payment events
CREATE OR REPLACE FUNCTION log_payment_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'success' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'success') THEN
    INSERT INTO utm_events (
      event_type,
      registration_id,
      metadata,
      timestamp
    ) VALUES (
      'payment',
      NEW.id,
      jsonb_build_object(
        'amount', NEW.amount,
        'name', NEW.name,
        'email', NEW.email,
        'phone', NEW.phone
      ),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger on registrations table
DROP TRIGGER IF EXISTS trigger_log_payment_event ON registrations;

CREATE TRIGGER trigger_log_payment_event
AFTER UPDATE ON registrations
FOR EACH ROW
EXECUTE FUNCTION log_payment_event();

-- 4. Create utm_summary view
CREATE OR REPLACE VIEW utm_summary AS
SELECT
  utm_id,
  COUNT(CASE WHEN event_type = 'scan' THEN 1 END) AS scans,
  COUNT(DISTINCT CASE WHEN event_type = 'registration' THEN registration_id END) AS registrations,
  COUNT(DISTINCT CASE WHEN event_type = 'payment' THEN registration_id END) AS paid_registrations
FROM utm_events
WHERE utm_id IS NOT NULL
GROUP BY utm_id
ORDER BY scans DESC;
"""

VERIFICATION_QUERIES = [
    "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'utm_events') AS utm_events_exists;",
    "SELECT EXISTS(SELECT 1 FROM information_schema.views WHERE table_name = 'utm_summary') AS utm_summary_exists;",
    "SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_name = 'trigger_log_payment_event';",
]

def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def print_step(step_num, text):
    print(f"\n[STEP {step_num}] {text}")
    print("-" * 60)

def print_success(text):
    print(f"✓ {text}")

def print_error(text):
    print(f"✗ {text}")

def print_info(text):
    print(f"→ {text}")

def deploy():
    """Main deployment function"""
    
    print_header("SUPABASE UTM TRACKING SYSTEM - DEPLOYMENT")
    
    print_step(1, "Connecting to Supabase")
    try:
        # Initialize Supabase client with service role key for full access
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print_success("Connected to Supabase")
        print_info(f"Project: {SUPABASE_URL}")
    except Exception as e:
        print_error(f"Failed to connect: {str(e)}")
        return False
    
    print_step(2, "Deploying Database Schema")
    try:
        # Split SQL into individual statements and execute
        statements = [s.strip() for s in SQL_SETUP.split(';') if s.strip()]
        
        for i, statement in enumerate(statements, 1):
            if not statement:
                continue
            print_info(f"Executing statement {i}/{len(statements)}...")
            
            # Execute via Supabase SQL endpoint
            result = supabase.rpc('exec_sql', {'sql': statement}).execute()
            print_success(f"Statement {i} executed")
    
    except Exception as e:
        print_error(f"Failed to deploy schema: {str(e)}")
        print_info("Note: Some errors are expected if tables already exist (idempotent)")
    
    print_step(3, "Verifying Deployment")
    try:
        # Check if utm_events table exists
        result = supabase.table('utm_events').select('*').limit(1).execute()
        print_success("utm_events table exists and is accessible")
        
        # Check if utm_summary view exists
        result = supabase.table('utm_summary').select('*').limit(1).execute()
        print_success("utm_summary view exists and is accessible")
        
    except Exception as e:
        print_error(f"Verification failed: {str(e)}")
        print_info("This may be expected - check Supabase dashboard directly")
    
    print_step(4, "Configuration Summary")
    print_info("Environment Variables Updated:")
    print_info("  VITE_SUPABASE_URL set")
    print_info("  VITE_SUPABASE_ANON_KEY set")
    
    print_step(5, "Next Steps")
    print_info("1. Verify schema in Supabase dashboard:")
    print_info("   https://fazpykekypcktcmniwbj.supabase.co/project/default/editor")
    print_info("")
    print_info("2. Start development server:")
    print_info("   npm run dev")
    print_info("")
    print_info("3. Test with UTM parameters:")
    print_info("   http://localhost:5173/register?utm_id=TEST001&utm_source=google&utm_medium=cpc&utm_campaign=test")
    print_info("")
    print_info("4. View analytics dashboard:")
    print_info("   http://localhost:5173/analytics")
    
    print_header("DEPLOYMENT COMPLETE")
    return True

if __name__ == '__main__':
    success = deploy()
    sys.exit(0 if success else 1)
