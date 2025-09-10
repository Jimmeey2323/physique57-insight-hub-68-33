import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExpirationData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpirationDataTablesProps {
  data: ExpirationData[];
  onRowClick?: (item: ExpirationData) => void;
}

type SortField = 'firstName' | 'membershipName' | 'endDate' | 'status';
type SortDirection = 'asc' | 'desc';

export const ExpirationDataTables: React.FC<ExpirationDataTablesProps> = ({ data, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('endDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = data
    .filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.firstName?.toLowerCase().includes(searchLower) ||
        item.lastName?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.membershipName?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      return aVal.localeCompare(bVal) * multiplier;
    });

  // Table 1: Churned Memberships
  const churnedData = filteredAndSortedData.filter(item => item.status === 'Churned');

  // Table 2: Frozen Memberships
  const frozenData = filteredAndSortedData.filter(item => item.status === 'Frozen');

  // Table 3: Active Memberships
  const activeData = filteredAndSortedData.filter(item => item.status === 'Active');

  // Table 4: All Memberships Summary
  const summaryData = data.reduce((acc, item) => {
    const key = item.membershipName || 'Unknown';
    if (!acc[key]) {
      acc[key] = { name: key, total: 0, active: 0, churned: 0, frozen: 0 };
    }
    acc[key].total++;
    if (item.status === 'Active') acc[key].active++;
    if (item.status === 'Churned') acc[key].churned++;
    if (item.status === 'Frozen') acc[key].frozen++;
    return acc;
  }, {} as Record<string, { name: string; total: number; active: number; churned: number; frozen: number }>);

  const summaryArray = Object.values(summaryData).sort((a, b) => b.total - a.total);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-1 font-medium text-slate-700 hover:text-slate-900"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
      )}
    </Button>
  );

  const getStatusBadge = (status: string) => (
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        status === 'Churned' ? "border-red-200 bg-red-50 text-red-700" :
        status === 'Frozen' ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
        "border-green-200 bg-green-50 text-green-700"
      )}
    >
      {status}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, membership, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Churned Memberships */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              Churned Memberships ({formatNumber(churnedData.length)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white/90">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3">
                      <SortButton field="firstName">Member</SortButton>
                    </th>
                    <th className="text-left py-2 px-3">
                      <SortButton field="membershipName">Membership</SortButton>
                    </th>
                    <th className="text-left py-2 px-3">
                      <SortButton field="endDate">End Date</SortButton>
                    </th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {churnedData.slice(0, 50).map((item, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer"
                      onClick={() => onRowClick?.(item)}
                    >
                      <td className="py-2 px-3 font-medium">{`${item.firstName} ${item.lastName}`}</td>
                      <td className="py-2 px-3 text-slate-600 text-xs">{item.membershipName}</td>
                      <td className="py-2 px-3 text-slate-600">{item.endDate}</td>
                      <td className="py-2 px-3">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Table 2: Frozen Memberships */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
              Frozen Memberships ({formatNumber(frozenData.length)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white/90">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3">
                      <SortButton field="firstName">Member</SortButton>
                    </th>
                    <th className="text-left py-2 px-3">
                      <SortButton field="membershipName">Membership</SortButton>
                    </th>
                    <th className="text-left py-2 px-3">
                      <SortButton field="endDate">End Date</SortButton>
                    </th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {frozenData.slice(0, 50).map((item, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer"
                      onClick={() => onRowClick?.(item)}
                    >
                      <td className="py-2 px-3 font-medium">{`${item.firstName} ${item.lastName}`}</td>
                      <td className="py-2 px-3 text-slate-600 text-xs">{item.membershipName}</td>
                      <td className="py-2 px-3 text-slate-600">{item.endDate}</td>
                      <td className="py-2 px-3">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Table 3: Active Memberships */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Active Memberships ({formatNumber(activeData.length)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white/90">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3">
                      <SortButton field="firstName">Member</SortButton>
                    </th>
                    <th className="text-left py-2 px-3">
                      <SortButton field="membershipName">Membership</SortButton>
                    </th>
                    <th className="text-left py-2 px-3">
                      <SortButton field="endDate">End Date</SortButton>
                    </th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeData.slice(0, 50).map((item, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer"
                      onClick={() => onRowClick?.(item)}
                    >
                      <td className="py-2 px-3 font-medium">{`${item.firstName} ${item.lastName}`}</td>
                      <td className="py-2 px-3 text-slate-600 text-xs">{item.membershipName}</td>
                      <td className="py-2 px-3 text-slate-600">{item.endDate}</td>
                      <td className="py-2 px-3">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Table 4: Membership Summary */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
              Membership Type Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white/90">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-700">Membership</th>
                    <th className="text-center py-2 px-3 font-medium text-slate-700">Total</th>
                    <th className="text-center py-2 px-3 font-medium text-green-600">Active</th>
                    <th className="text-center py-2 px-3 font-medium text-yellow-600">Frozen</th>
                    <th className="text-center py-2 px-3 font-medium text-red-600">Churned</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryArray.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-xs">{item.name}</td>
                      <td className="py-2 px-3 text-center font-medium">{formatNumber(item.total)}</td>
                      <td className="py-2 px-3 text-center text-green-600">{formatNumber(item.active)}</td>
                      <td className="py-2 px-3 text-center text-yellow-600">{formatNumber(item.frozen)}</td>
                      <td className="py-2 px-3 text-center text-red-600">{formatNumber(item.churned)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};