import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fazpykekypcktcmniwbj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createTestUser() {
  const email = 'test_player_1@example.com';
  const password = 'Password123!';
  const phone = '9999999999';

  console.log('Checking if user exists...');
  
  // Try to create the user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: {
      linked_mobile: phone
    }
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log(`User already exists: ${email} / ${password}`);
    } else {
      console.error('Error creating user:', error);
    }
  } else {
    console.log(`Successfully created test user: ${email} / ${password}`);
  }

  try {
    const { error: insertError } = await supabase.from('registrations').insert({
      name: 'Test Player',
      email: email,
      mobile: phone,
      state: 'Test State',
      city: 'Test City',
      proficiency: 'Batsman',
      payment_status: 'SUCCESS'
    });
    if (insertError) {
      console.log('Note: Could not insert into registrations (might already exist or not exist):', insertError.message);
    } else {
      console.log('Inserted dummy registration data for mobile:', phone);
    }
  } catch (e) {
    console.log(e);
  }
}

createTestUser();
