import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import './SimpleTest.css';

const SimpleTest = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('=== SIMPLE TEST COMPONENT MOUNTED ===');
    
    const testQuery = async () => {
      console.log('Starting test query...');
      
      try {
        console.log('Supabase client exists:', !!supabase);
        
        const result = await supabase
          .from('player_registrations')
          .select('id, full_name, email, payment_status')
          .limit(5);
        
        console.log('Query result:', result);
        
        if (result.error) {
          console.error('Query error:', result.error);
          setError(JSON.stringify(result.error));
        } else {
          console.log('Query success! Rows:', result.data?.length);
          setData(result.data);
        }
      } catch (err: any) {
        console.error('Exception:', err);
        setError(err.message);
      }
    };
    
    testQuery();
  }, []);

  return (
    <div className="simple-test-container">
      <h2 className="simple-test-title">SIMPLE TEST COMPONENT</h2>
      <p>Check browser console for logs</p>
      
      {error && (
        <div className="simple-test-error">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="simple-test-success">
          <strong>Success! Found {data.length} rows</strong>
          <pre className="simple-test-pre">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      {!data && !error && <p>Loading...</p>}
    </div>
  );
};

export default SimpleTest;
