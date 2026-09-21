import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('Testing v_admin_player_registrations...');
  let allViewData = [];
  let viewHasMore = true;
  let viewPage = 0;
  const viewPageSize = 1000;

  while (viewHasMore) {
    const from = viewPage * viewPageSize;
    const to = from + viewPageSize - 1;

    console.log(`Fetching view range: ${from} - ${to}`);
    const { data: viewData, error: viewError } = await supabase
      .from('v_admin_player_registrations')
      .select('*')
      .order('registration_date', { ascending: false })
      .range(from, to);

    if (viewError) {
      console.error('View error:', viewError.message);
      break;
    }

    console.log(`View fetched: ${viewData?.length} items`);

    if (viewData && viewData.length > 0) {
      allViewData = [...allViewData, ...viewData];
      viewPage++;
      if (viewData.length < viewPageSize) {
        viewHasMore = false;
      }
    } else {
      viewHasMore = false;
    }
  }

  console.log(`Total view items: ${allViewData.length}`);

  if (allViewData.length === 0) {
    console.log('\nTesting player_registrations fallback...');
    let allRegistrations = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 1000;

    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      console.log(`Fetching fallback range: ${from} - ${to}`);
      const { data: nextPageData, error: nextPageError } = await supabase
        .from('player_registrations')
        .select(`id, full_name, email, phone, created_at, state, city, pincode, position, payment_status, payment_amount, status`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (nextPageError) {
        console.error('Fallback error:', nextPageError.message);
        break;
      }

      console.log(`Fallback fetched: ${nextPageData?.length} items`);

      if (nextPageData && nextPageData.length > 0) {
        allRegistrations = [...allRegistrations, ...nextPageData];
        page++;
        if (nextPageData.length < pageSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(`Total fallback items: ${allRegistrations.length}`);
  }
}

testQuery();
