import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

export default function RazorpayDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [viewMode, setViewMode] = useState('all'); // all, captured, net_failed
  const { session } = useAuth();
  
  const limit = 50;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) queryParams.append('search', search);
      if (status && status !== 'all') queryParams.append('status', status);
      if (viewMode !== 'all') queryParams.append('view', viewMode);

      const response = await fetch(`${apiBase}/admin/razorpay/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const result = await response.json();
      
      setTransactions(result.data || []);
      setTotal(result.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching razorpay transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if session is available to send the token
    if (session) {
      fetchTransactions();
    }
  }, [page, status, viewMode, session]);

  // Handle Search on Enter or blur
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchTransactions();
    }
  };

  const handleExport = () => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (status && status !== 'all') queryParams.append('status', status);
    if (viewMode !== 'all') queryParams.append('view', viewMode);

    window.open(`${apiBase}/admin/razorpay/transactions/export?${queryParams}`, '_blank');
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Razorpay Payments</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all payment transactions from the Razorpay Ledger.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchTransactions()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExport} className="bg-sport-blue hover:bg-sport-blue/90">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Phone, Email, Pay ID..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onBlur={() => { setPage(1); fetchTransactions(); }}
                />
              </div>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="captured">Captured (Paid)</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="created">Created (Pending)</SelectItem>
                  <SelectItem value="authorized">Authorized</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {transactions.length} of {total} transactions
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Contact / Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">Loading transactions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No transactions found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((txn: any) => (
                    <TableRow key={txn.payment_id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(txn.created_at), 'dd MMM yyyy, hh:mm a')}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {txn.payment_id}
                        {txn.order_id && <div className="text-muted-foreground">{txn.order_id}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{txn.contact || '-'}</div>
                        <div className="text-sm text-muted-foreground">{txn.email || '-'}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{txn.amount?.toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {txn.method || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          txn.status === 'captured' ? 'bg-green-100 text-green-700' :
                          txn.status === 'failed' ? 'bg-red-100 text-red-700' :
                          txn.status === 'authorized' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {txn.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {txn.razorpay_dashboard_url ? (
                          <a 
                            href={txn.razorpay_dashboard_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            Dashboard <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        ) : (
                          <a 
                            href={`https://dashboard.razorpay.com/app/payments/${txn.payment_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            View <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    // Simple pagination logic to show current page around center
                    let pageNum = page;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
