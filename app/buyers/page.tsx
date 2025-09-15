'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { displayMappings } from '@/lib/validations/buyer';
import toast from 'react-hot-toast';
import { FileDown, Plus, Search, Filter, Upload } from 'lucide-react';
import debounce from 'lodash.debounce';

function BuyersPage() {  // <-- CHANGED: Removed "export default"
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [timeline, setTimeline] = useState(searchParams.get('timeline') || '');

  const fetchBuyers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      if (propertyType) params.set('propertyType', propertyType);
      if (status) params.set('status', status);
      if (timeline) params.set('timeline', timeline);

      const res = await fetch(`/api/buyers?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setBuyers(data.buyers);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to load buyers');
    } finally {
      setLoading(false);
    }
  }, [page, search, city, propertyType, status, timeline]);

  const debouncedFetch = useCallback(
    debounce(() => fetchBuyers(), 500),
    [fetchBuyers]
  );

  useEffect(() => {
    fetchBuyers();
  }, [page, city, propertyType, status, timeline]);

  useEffect(() => {
    debouncedFetch();
  }, [search]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city) params.set('city', city);
      if (propertyType) params.set('propertyType', propertyType);
      if (status) params.set('status', status);
      if (timeline) params.set('timeline', timeline);

      const res = await fetch(`/api/buyers/export?${params}`);
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buyers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Export successful!');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Leads</h1>
                    <div className="flex gap-2">
            <Link href="/buyers/import">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </Link>
            <Button onClick={handleExport} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Link href="/buyers/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="ghost">
              Logout
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Name, email, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="city">City</Label>
              <Select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {Object.entries(displayMappings.city).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">All Types</option>
                {Object.entries(displayMappings.propertyType).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                {Object.entries(displayMappings.status).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="timeline">Timeline</Label>
              <Select
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              >
                <option value="">All Timelines</option>
                {Object.entries(displayMappings.timeline).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : buyers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">
                    No buyers found
                  </td>
                </tr>
              ) : (
                buyers.map((buyer:any) => (
                  <tr key={buyer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {buyer.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {buyer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(displayMappings as any).city[buyer.city]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(displayMappings as any).propertyType[buyer.propertyType]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {buyer.budgetMin || buyer.budgetMax ? (
                        `₹${(buyer.budgetMin || 0).toLocaleString()} - ₹${(buyer.budgetMax || 0).toLocaleString()}`
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(displayMappings as any).timeline[buyer.timeline]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${buyer.status === 'NEW' ? 'bg-green-100 text-green-800' : ''}
                        ${buyer.status === 'QUALIFIED' ? 'bg-blue-100 text-blue-800' : ''}
                        ${buyer.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${buyer.status === 'VISITED' ? 'bg-purple-100 text-purple-800' : ''}
                        ${buyer.status === 'NEGOTIATION' ? 'bg-orange-100 text-orange-800' : ''}
                        ${buyer.status === 'CONVERTED' ? 'bg-green-100 text-green-800' : ''}
                        ${buyer.status === 'DROPPED' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {(displayMappings as any).status[buyer.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(buyer.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/buyers/${buyer.id}`}>
                        <Button variant="link" size="sm">
                          View/Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div>
                Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ADD THIS WRAPPER COMPONENT AT THE BOTTOM
export default function BuyersPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BuyersPage />
    </Suspense>
  );
}