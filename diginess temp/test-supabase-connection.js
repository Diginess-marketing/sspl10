/**
 * Quick Supabase Connection Test
 * Run this to verify Supabase connectivity
 */

const SUPABASE_URL = 'https://fazpykekypcktcmniwbj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', SUPABASE_URL);
  
  try {
    // Test basic connectivity
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    console.log('✅ Connection successful!');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    // Test website_content table
    console.log('\n🔍 Testing website_content table access...');
    const contentResponse = await fetch(`${SUPABASE_URL}/rest/v1/website_content?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (contentResponse.ok) {
      const data = await contentResponse.json();
      console.log('✅ website_content table accessible!');
      console.log('Rows found:', data.length);
    } else {
      console.error('❌ Failed to access website_content table');
      console.error('Status:', contentResponse.status);
      console.error('Status Text:', contentResponse.statusText);
      const errorText = await contentResponse.text();
      console.error('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 DNS resolution failed. Check your internet connection.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Connection refused. Supabase service might be down.');
    } else if (error.message.includes('ERR_CONNECTION_CLOSED')) {
      console.error('\n💡 Connection closed. Network or firewall issue.');
    }
  }
}

testConnection();
