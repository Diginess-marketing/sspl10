import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
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
        .order('created_at', { ascending: false })
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
}

testQuery();
