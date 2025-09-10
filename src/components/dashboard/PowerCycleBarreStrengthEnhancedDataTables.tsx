import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Download,
  Eye,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Zap,
  Activity,
  Dumbbell
} from 'lucide-react';
import { PayrollData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface PowerCycleBarreStrengthEnhancedDataTablesProps {
  data: PayrollData[];
  onItemClick?: (item: any) => void;
}

export const PowerCycleBarreStrengthEnhancedDataTables: React.FC<PowerCycleBarreStrengthEnhancedDataTablesProps> = ({ 
  data, 
  onItemClick 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('totalRevenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterLocation, setFilterLocation] = useState('all');

  const locations = useMemo(() => {
    const unique = [...new Set(data.map(item => item.location))].filter(Boolean);
    return unique.sort();
  }, [data]);

  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      avgSessionRevenue: item.totalSessions > 0 ? item.totalPaid / item.totalSessions : 0,
      fillRate: item.totalNonEmptySessions > 0 ? item.totalCustomers / item.totalNonEmptySessions : 0,
      powerCycleAvg: item.nonEmptyCycleSessions > 0 ? item.cyclePaid / item.nonEmptyCycleSessions : 0,
      barreAvg: item.nonEmptyBarreSessions > 0 ? item.barrePaid / item.nonEmptyBarreSessions : 0,
      strengthAvg: item.nonEmptyStrengthSessions > 0 ? item.strengthPaid / item.nonEmptyStrengthSessions : 0,
      powerCycleFillRate: item.nonEmptyCycleSessions > 0 ? item.cycleCustomers / item.nonEmptyCycleSessions : 0,
      barreFillRate: item.nonEmptyBarreSessions > 0 ? item.barreCustomers / item.nonEmptyBarreSessions : 0,
      strengthFillRate: item.nonEmptyStrengthSessions > 0 ? item.strengthCustomers / item.nonEmptyStrengthSessions : 0
    }));
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = processedData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.monthYear?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (filterLocation !== 'all') {
      filtered = filtered.filter(item => item.location === filterLocation);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField] || 0;
      const bValue = b[sortField] || 0;
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [processedData, searchTerm, filterLocation, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const exportData = () => {
    const csv = [
      ['Trainer', 'Location', 'Month/Year', 'Total Sessions', 'Total Revenue', 'Total Customers', 'PowerCycle Sessions', 'PowerCycle Revenue', 'Barre Sessions', 'Barre Revenue', 'Strength Sessions', 'Strength Revenue'].join(','),
      ...filteredAndSortedData.map(item => [
        item.teacherName,
        item.location,
        item.monthYear,
        item.totalSessions,
        item.totalPaid,
        item.totalCustomers,
        item.cycleSessions || 0,
        item.cyclePaid || 0,
        item.barreSessions || 0,
        item.barrePaid || 0,
        item.strengthSessions || 0,
        item.strengthPaid || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'powercycle-barre-strength-data.csv';
    a.click();
  };

  const SortableHeader = ({ field, children, className = "" }: { 
    field: string; 
    children: React.ReactNode; 
    className?: string;
  }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-white/10 transition-colors text-white ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          <div className="text-xs">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </div>
        )}
      </div>
    </TableHead>
  );

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-xl">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Detailed Analytics Table
            <Badge className="bg-blue-600 text-white">
              {filteredAndSortedData.length} records
            </Badge>
          </div>
          <Button
            onClick={exportData}
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search trainers, locations, or months..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="w-48">
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location} className="text-white">
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-32">
            <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="10" className="text-white">10 rows</SelectItem>
                <SelectItem value="25" className="text-white">25 rows</SelectItem>
                <SelectItem value="50" className="text-white">50 rows</SelectItem>
                <SelectItem value="100" className="text-white">100 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-700">
              <TableRow className="border-white/10 hover:bg-slate-600/50">
                <SortableHeader field="teacherName">
                  <Users className="w-4 h-4" />
                  Trainer
                </SortableHeader>
                <SortableHeader field="location">
                  <MapPin className="w-4 h-4" />
                  Location
                </SortableHeader>
                <SortableHeader field="monthYear">
                  <Calendar className="w-4 h-4" />
                  Period
                </SortableHeader>
                <SortableHeader field="totalSessions">
                  <Calendar className="w-4 h-4" />
                  Total Sessions
                </SortableHeader>
                <SortableHeader field="totalPaid">
                  <DollarSign className="w-4 h-4" />
                  Total Revenue
                </SortableHeader>
                <SortableHeader field="avgSessionRevenue">
                  <TrendingUp className="w-4 h-4" />
                  Avg/Session
                </SortableHeader>
                <SortableHeader field="cycleSessions">
                  <Zap className="w-4 h-4" />
                  PowerCycle
                </SortableHeader>
                <SortableHeader field="barreSessions">
                  <Activity className="w-4 h-4" />
                  Barre
                </SortableHeader>
                <SortableHeader field="strengthSessions">
                  <Dumbbell className="w-4 h-4" />
                  Strength
                </SortableHeader>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow 
                  key={`${item.teacherId}-${item.monthYear}-${index}`}
                  className="border-white/10 hover:bg-white/10 transition-colors"
                >
                  <TableCell className="text-white font-medium">
                    <div>
                      <div>{item.teacherName}</div>
                      <div className="text-xs text-gray-400">
                        {formatNumber(item.totalCustomers)} customers
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{item.location}</TableCell>
                  <TableCell className="text-white">{item.monthYear}</TableCell>
                  <TableCell className="text-white">
                    <div className="space-y-1">
                      <div className="font-medium">{formatNumber(item.totalSessions || 0)}</div>
                      <div className="text-xs text-gray-400">
                        {formatPercentage(item.fillRate)} fill rate
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    {formatCurrency(item.totalPaid || 0)}
                  </TableCell>
                  <TableCell className="text-white">
                    {formatCurrency(item.avgSessionRevenue)}
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-blue-400" />
                        <span>{formatNumber(item.cycleSessions || 0)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatCurrency(item.cyclePaid || 0)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-pink-400" />
                        <span>{formatNumber(item.barreSessions || 0)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatCurrency(item.barrePaid || 0)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-3 h-3 text-orange-400" />
                        <span>{formatNumber(item.strengthSessions || 0)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatCurrency(item.strengthPaid || 0)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onItemClick?.(item)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
                    >
                      <Eye className="w-3 h-3" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <div className="text-gray-400 text-sm">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={
                      currentPage === pageNumber
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};