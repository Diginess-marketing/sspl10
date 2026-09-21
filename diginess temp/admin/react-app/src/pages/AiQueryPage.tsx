import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function AiQueryPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[] | null>(null);
  const [queryObj, setQueryObj] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);
    setQueryObj(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';
      const response = await fetch(`${backendUrl}/api/admin/ai-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch query results');
      }

      setData(result.data || []);
      setQueryObj(result.query);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!data || data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, `AI_Query_Results.xlsx`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>🤖</span> Natural Language Query
          </h1>
          <p className="text-gray-500 mt-1">Ask questions in plain English to query the database.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            placeholder="e.g. show me the list of successful registrations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Querying...
              </>
            ) : (
              'Search'
            )}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-700">Try asking:</span>
          <button type="button" onClick={() => setQuery('Show me all players from Chennai')} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors">Show me all players from Chennai</button>
          <button type="button" onClick={() => setQuery('List successful payments for goalkeeper')} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors">List successful payments for goalkeeper</button>
          <button type="button" onClick={() => setQuery('Show latest 10 failed payments')} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors">Show latest 10 failed payments</button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error processing query</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {queryObj && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 mb-6 rounded-lg shadow-sm">
          <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Interpreted Query</h3>
          <pre className="text-xs text-indigo-900 font-mono bg-white p-3 rounded border border-indigo-50 overflow-x-auto">
            {JSON.stringify(queryObj, null, 2)}
          </pre>
        </div>
      )}

      {data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-800">
              Results <span className="bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full text-xs ml-2">{data.length} records</span>
            </h3>
            <button
              onClick={handleDownloadExcel}
              disabled={data.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-4 rounded shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              📥 Export Excel
            </button>
          </div>
          
          {data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No records found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.keys(data[0]).map((key) => (
                        <td key={key} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {row[key] !== null && typeof row[key] === 'object' 
                            ? JSON.stringify(row[key]) 
                            : String(row[key] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
