import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Search, 
  Download, 
  Filter,
  Users,
  Calendar,
  DollarSign,
  Target,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { RecurringSessionData } from '@/hooks/useRecurringSessionsData';

interface RecurringSessionsGroupedTableProps {
  data: RecurringSessionData[];
}

export const RecurringSessionsGroupedTable: React.FC<RecurringSessionsGroupedTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'trainer' | 'class' | 'location' | 'day'>('trainer');
  const [sortField, setSortField] = useState('totalSessions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const groups: Record<string, {
      name: string;
      totalSessions: number;
      totalAttendance: number;
      totalCapacity: number;
      totalRevenue: number;
      avgFillRate: number;
      uniqueClasses: number;
      uniqueTrainers: number;
      avgRevenuePerSession: number;
    }> = {};

    data.forEach(session => {
      const key = session[groupBy] || 'Unknown';
      
      if (!groups[key]) {
        groups[key] = {
          name: key,
          totalSessions: 0,
          totalAttendance: 0,
          totalCapacity: 0,
          totalRevenue: 0,
          avgFillRate: 0,
          uniqueClasses: 0,
          uniqueTrainers: 0,
          avgRevenuePerSession: 0
        };
      }

      groups[key].totalSessions += 1;
      groups[key].totalAttendance += session.checkedIn;
      groups[key].totalCapacity += session.capacity;
      groups[key].totalRevenue += session.revenue;
    });

    // Calculate derived metrics and filter by search
    return Object.values(groups)
      .map(group => ({
        ...group,
        avgFillRate: group.totalCapacity > 0 ? (group.totalAttendance / group.totalCapacity) * 100 : 0,
        avgRevenuePerSession: group.totalSessions > 0 ? group.totalRevenue / group.totalSessions : 0,
        uniqueClasses: new Set(data.filter(s => s[groupBy] === group.name).map(s => s.class)).size,
        uniqueTrainers: new Set(data.filter(s => s[groupBy] === group.name).map(s => s.trainer)).size
      }))
      .filter(group => 
        !searchTerm || group.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[sortField as keyof typeof a];
        const bValue = b[sortField as keyof typeof b];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, groupBy, searchTerm, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getPerformanceBadge = (fillRate: number) => {
    if (fillRate >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (fillRate >= 60) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (fillRate >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  const columns = [
    {
      key: 'name',
      header: groupBy.charAt(0).toUpperCase() + groupBy.slice(1),
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {value.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{groupBy}</div>
          </div>
        </div>
      ),
      className: 'min-w-[200px]',
      sortable: true
    },
    {
      key: 'totalSessions',
      header: 'Total Sessions',
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">sessions</div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'totalAttendance',
      header: 'Total Attendance',
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">attendees</div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'avgFillRate',
      header: 'Fill Rate',
      render: (value: number, item: any) => (
        <div className="text-center space-y-1">
          <div className="text-lg font-bold text-purple-600">{formatPercentage(value)}</div>
          {getPerformanceBadge(value)}
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'totalRevenue',
      header: 'Total Revenue',
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-600">{formatCurrency(value)}</div>
          <div className="text-xs text-slate-500">revenue</div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'avgRevenuePerSession',
      header: 'Avg Revenue',
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">{formatCurrency(value)}</div>
          <div className="text-xs text-slate-500">per session</div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'uniqueClasses',
      header: 'Classes',
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-indigo-600">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">types</div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'uniqueTrainers',
      header: 'Trainers',
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-pink-600">{formatNumber(value)}</div>
          <div className="text-xs text-slate-500">trainers</div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    }
  ];

  return (
    <Card className="bg-white shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <BarChart3 className="w-6 h-6" />
            Sessions Analysis by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
            <Badge className="bg-white/20 text-white border-white/30">
              {groupedData.length} groups
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

      {/* Controls */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Group by:</span>
            <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trainer">Trainer</SelectItem>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={`Search ${groupBy}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          
          <Badge variant="outline" className="text-slate-600">
            {groupedData.length} groups found
          </Badge>
        </div>
      </div>

      <CardContent className="p-0">
        <ModernDataTable
          data={groupedData}
          columns={columns}
          maxHeight="600px"
          stickyHeader={true}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </CardContent>
    </Card>
  );
};