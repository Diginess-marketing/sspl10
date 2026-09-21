import React from 'react';

export default function SimpleGA4Page() {
  React.useEffect(() => {
    alert('SimpleGA4Page component mounted! Route is working!');
  }, []);
  
  return (
    <div className="min-h-screen bg-yellow-300 p-8 space-y-4">
      <h1 className="text-5xl font-bold text-red-600">GA4 Analytics Page - ROUTE WORKS!</h1>
      <p className="text-2xl">This is a simple non-lazy-loaded page.</p>
      <p className="text-2xl">If you can see this bright yellow page, the route is working!</p>
    </div>
  );
}
