import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Search, 
  Download, 
  Filter,
  Eye,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '@/utils/formatters';
import { RecurringSessionData } from '@/hooks/useRecurringSessionsData';

interface ComprehensiveSessionsDataTableProps {
  data: RecurringSessionData[];
  onItemClick?: (item: RecurringSessionData) => void;
}

export const ComprehensiveSessionsDataTable: React.FC<ComprehensiveSessionsDataTableProps> = ({
  data,
  onItemClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(session => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        session.trainer?.toLowerCase().includes(searchLower) ||
        session.class?.toLowerCase().includes(searchLower) ||
        session.location?.toLowerCase().includes(searchLower) ||
        session.sessionName?.toLowerCase().includes(searchLower) ||
        session.type?.toLowerCase().includes(searchLower)
      );
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof RecurringSessionData];
      let bValue = b[sortField as keyof RecurringSessionData];
      
      if (typeof aValue === 'string') aValue = aValue?.toLowerCase() || '';
      if (typeof bValue === 'string') bValue = bValue?.toLowerCase() || '';
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getPerformanceBadge = (fillRate: number) => {
    if (fillRate >= 90) return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>;
    if (fillRate >= 75) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Very Good</Badge>;
    if (fillRate >= 60) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Good</Badge>;
    if (fillRate >= 40) return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Attention</Badge>;
  };

  const getRevenueBadge = (revenue: number) => {
    if (revenue >= 50000) return <Badge className="bg-emerald-100 text-emerald-800">High Revenue</Badge>;
    if (revenue >= 20000) return <Badge className="bg-blue-100 text-blue-800">Medium Revenue</Badge>;
    if (revenue >= 5000) return <Badge className="bg-yellow-100 text-yellow-800">Low Revenue</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">No Revenue</Badge>;
  };

  const columns = [
    {
      key: 'sessionDetails',
      header: 'Session Details',
      render: (value: any, item: RecurringSessionData) => (
        <div className="space-y-2 min-w-[250px]">
          <div className="font-semibold text-slate-900">{item.sessionName || 'Unnamed Session'}</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {item.class ? item.class.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UK'}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700">{item.class || 'Unknown Class'}</div>
              <div className="text-xs text-slate-500">{item.type || 'Unknown Type'}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            {formatDate(item.date)} - {item.day}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {item.time}
          </div>
        </div>
      ),
      className: 'min-w-[250px]',
      sortable: true
    },
    {
      key: 'trainer',
      header: 'Trainer',
      render: (value: string, item: RecurringSessionData) => (
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {value ? value.split(' ').map(n => n[0]).join('').slice(0, 2) : 'UK'}
          </div>
          <div>
            <div className="font-medium text-slate-800">{value || 'Unassigned'}</div>
            <div className="text-xs text-slate-500">ID: {item.trainerId}</div>
          </div>
        </div>
      ),
      className: 'min-w-[180px]',
      sortable: true
    },
    {
      key: 'location',
      header: 'Location',
      render: (value: string) => (
        <div className="flex items-center gap-2 min-w-[160px]">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-slate-800">{value || 'Unknown'}</span>
        </div>
      ),
      className: 'min-w-[160px]',
      sortable: true
    },
    {
      key: 'attendance',
      header: 'Attendance',
      render: (value: any, item: RecurringSessionData) => (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-lg font-bold text-green-600">{item.checkedIn}</span>
            <span className="text-slate-500">/ {item.capacity}</span>
          </div>
          <div className="space-y-1">
            {getPerformanceBadge(item.fillPercentage || 0)}
            <div className="text-xs text-slate-500">
              {formatPercentage(item.fillPercentage || 0)} fill rate
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="text-blue-600">Booked: {item.booked}</div>
            <div className="text-orange-600">Cancelled: {item.lateCancelled}</div>
          </div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'membershipBreakdown',
      header: 'Membership Breakdown',
      render: (value: any, item: RecurringSessionData) => (
        <div className="text-center space-y-2 min-w-[150px]">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Members: {item.memberships}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Packages: {item.packages}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Intro: {item.introOffers}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Single: {item.singleClasses}</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Non-paid: {item.nonPaid}
          </div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (value: number, item: RecurringSessionData) => (
        <div className="text-center space-y-2">
          <div className="text-lg font-bold text-emerald-600">
            {formatCurrency(value || 0)}
          </div>
          {getRevenueBadge(value || 0)}
          <div className="text-xs text-slate-500">
            Total Revenue
          </div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'performance',
      header: 'Performance Metrics',
      render: (value: any, item: RecurringSessionData) => (
        <div className="text-center space-y-2 min-w-[140px]">
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span>Avg Fill:</span>
              <Badge variant="outline" className="text-xs">
                {formatPercentage(item.classAvgExclEmpty || 0)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Sessions:</span>
              <Badge variant="outline" className="text-xs">
                {item.totalSessions || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Empty:</span>
              <Badge variant="outline" className="text-xs">
                {item.emptySessions || 0}
              </Badge>
            </div>
          </div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, item: RecurringSessionData) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onItemClick?.(item)}
          className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Eye className="w-4 h-4" />
          Details
        </Button>
      ),
      align: 'center' as const
    }
  ];

  const summaryStats = useMemo(() => {
    return {
      totalSessions: filteredAndSortedData.length,
      totalAttendance: filteredAndSortedData.reduce((sum, session) => sum + session.checkedIn, 0),
      totalCapacity: filteredAndSortedData.reduce((sum, session) => sum + session.capacity, 0),
      totalRevenue: filteredAndSortedData.reduce((sum, session) => sum + (session.revenue || 0), 0),
      avgFillRate: filteredAndSortedData.length > 0 
        ? filteredAndSortedData.reduce((sum, session) => sum + (session.fillPercentage || 0), 0) / filteredAndSortedData.length
        : 0,
      uniqueTrainers: new Set(filteredAndSortedData.map(session => session.trainer)).size,
      uniqueClasses: new Set(filteredAndSortedData.map(session => session.class)).size
    };
  }, [filteredAndSortedData]);

  return (
    <Card className="bg-white shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <BarChart3 className="w-6 h-6" />
            Comprehensive Sessions Analysis
            <Badge className="bg-white/20 text-white border-white/30">
              {filteredAndSortedData.length} sessions
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{formatNumber(summaryStats.totalSessions)}</div>
            <div className="text-sm text-slate-600">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatNumber(summaryStats.totalAttendance)}</div>
            <div className="text-sm text-slate-600">Total Attendance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(summaryStats.totalCapacity)}</div>
            <div className="text-sm text-slate-600">Total Capacity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatPercentage(summaryStats.avgFillRate)}</div>
            <div className="text-sm text-slate-600">Avg Fill Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="text-sm text-slate-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{formatNumber(summaryStats.uniqueTrainers)}</div>
            <div className="text-sm text-slate-600">Trainers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{formatNumber(summaryStats.uniqueClasses)}</div>
            <div className="text-sm text-slate-600">Class Types</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search sessions, trainers, classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <Badge variant="outline" className="text-slate-600">
            <Filter className="w-3 h-3 mr-1" />
            {filteredAndSortedData.length} of {data.length} sessions
          </Badge>
        </div>
      </div>

      <CardContent className="p-0">
        <ModernDataTable
          data={filteredAndSortedData}
          columns={columns}
          maxHeight="700px"
          stickyHeader={true}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </CardContent>
    </Card>
  );
};