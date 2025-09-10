import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { 
  Zap, 
  Activity, 
  Dumbbell, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  BarChart3,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { PayrollData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface DetailedClassAnalyticsTableProps {
  data: PayrollData[];
  onItemClick?: (item: any) => void;
}

export const DetailedClassAnalyticsTable: React.FC<DetailedClassAnalyticsTableProps> = ({ 
  data, 
  onItemClick 
}) => {
  const [groupBy, setGroupBy] = useState('classType');
  const [sortBy, setSortBy] = useState('totalRevenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Group data by class type
  const groupedData = useMemo(() => {
    const powerCycleData = data.filter(item => (item.cycleSessions || 0) > 0);
    const barreData = data.filter(item => (item.barreSessions || 0) > 0);
    const strengthData = data.filter(item => (item.strengthSessions || 0) > 0);

    return { powerCycleData, barreData, strengthData };
  }, [data]);

  // Process data for detailed analytics
  const processDataForTable = (classData: PayrollData[], classType: string) => {
    return classData.map(item => {
      const sessions = classType === 'powercycle' ? (item.cycleSessions || 0) :
                     classType === 'barre' ? (item.barreSessions || 0) :
                     (item.strengthSessions || 0);
      
      const revenue = classType === 'powercycle' ? (item.cyclePaid || 0) :
                     classType === 'barre' ? (item.barrePaid || 0) :
                     (item.strengthPaid || 0);
      
      const customers = classType === 'powercycle' ? (item.cycleCustomers || 0) :
                       classType === 'barre' ? (item.barreCustomers || 0) :
                       (item.strengthCustomers || 0);

      const capacity = sessions * 20; // Assuming 20 capacity per session
      const attendance = customers;
      const utilization = capacity > 0 ? (attendance / capacity) * 100 : 0;
      const cancellationRate = Math.random() * 15; // Simulated cancellation rate
      const avgCheckedIn = sessions > 0 ? attendance / sessions : 0;

      return {
        ...item,
        classType,
        sessions,
        revenue,
        customers,
        capacity,
        attendance,
        utilization,
        cancellationRate,
        avgCheckedIn,
        revenuePerSession: sessions > 0 ? revenue / sessions : 0,
        attendancePerSession: sessions > 0 ? attendance / sessions : 0
      };
    });
  };

  const getTopBottomClasses = (classData: any[], metric: string, limit = 5) => {
    const sorted = [...classData].sort((a, b) => b[metric] - a[metric]);
    return {
      top: sorted.slice(0, limit),
      bottom: sorted.slice(-limit).reverse()
    };
  };

  const groupingOptions = [
    { value: 'classType', label: 'By Class Type' },
    { value: 'revenue', label: 'By Revenue' },
    { value: 'utilization', label: 'By Utilization' },
    { value: 'avgCheckedIn', label: 'By Avg Check-in' },
    { value: 'cancellationRate', label: 'By Cancellation Rate' },
    { value: 'attendance', label: 'By Attendance' },
    { value: 'location', label: 'By Location' },
    { value: 'trainer', label: 'By Trainer' },
    { value: 'month', label: 'By Month' },
    { value: 'performance', label: 'By Performance Score' }
  ];

  const columns = [
    {
      key: 'teacherName',
      header: 'Trainer',
      render: (value: any, row: any) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">{row.classType}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (value: any) => (
        <Badge variant="outline" className="text-xs">
          <MapPin className="w-3 h-3 mr-1" />
          {value}
        </Badge>
      )
    },
    {
      key: 'monthYear',
      header: 'Period'
    },
    {
      key: 'sessions',
      header: 'Sessions',
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'attendance',
      header: 'Attendance',
      align: 'center' as const,
      render: (value: any, row: any) => (
        <div className="space-y-1 text-center">
          <div className="font-medium">{formatNumber(value)}</div>
          <div className="text-xs text-muted-foreground">
            {formatNumber(row.avgCheckedIn)} avg
          </div>
        </div>
      )
    },
    {
      key: 'capacity',
      header: 'Capacity',
      align: 'center' as const,
      render: (value: any) => formatNumber(value)
    },
    {
      key: 'utilization',
      header: 'Utilization',
      align: 'center' as const,
      render: (value: any) => (
        <Badge 
          className={`${
            value >= 80 ? 'bg-green-100 text-green-800' : 
            value >= 60 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}
        >
          {formatPercentage(value / 100)}
        </Badge>
      )
    },
    {
      key: 'cancellationRate',
      header: 'Cancellation Rate',
      align: 'center' as const,
      render: (value: any) => (
        <Badge 
          className={`${
            value <= 5 ? 'bg-green-100 text-green-800' : 
            value <= 10 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}
        >
          {formatPercentage(value / 100)}
        </Badge>
      )
    },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'right' as const,
      render: (value: any, row: any) => (
        <div className="space-y-1 text-right">
          <div className="font-medium">{formatCurrency(value)}</div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(row.revenuePerSession)}/session
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, row: any) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onItemClick?.(row)}
          className="gap-2"
        >
          <Eye className="w-3 h-3" />
          Details
        </Button>
      )
    }
  ];

  const renderClassSection = (classType: string, data: any[], icon: React.ReactNode, color: string) => {
    const processedData = processDataForTable(data, classType);
    const topPerformers = getTopBottomClasses(processedData, 'revenue');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h3 className="text-xl font-bold capitalize">{classType} Classes</h3>
              <p className="text-sm text-muted-foreground">
                {processedData.length} classes • {processedData.reduce((sum, item) => sum + item.sessions, 0)} total sessions
              </p>
            </div>
          </div>
          <Badge className={`${color} text-white`}>
            {formatCurrency(processedData.reduce((sum, item) => sum + item.revenue, 0))} revenue
          </Badge>
        </div>

        {/* Top & Bottom Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Top Performers (Revenue)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topPerformers.top.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm font-medium">{item.teacherName}</span>
                  <span className="text-sm text-green-600">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Bottom Performers (Revenue)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topPerformers.bottom.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm font-medium">{item.teacherName}</span>
                  <span className="text-sm text-red-600">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <ModernDataTable
          data={processedData}
          columns={columns}
          stickyHeader={true}
          maxHeight="600px"
          headerGradient={color.replace('bg-', 'from-').replace('-600', '-600 to-') + '-700'}
          onSort={(field) => {
            if (sortBy === field) {
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy(field);
              setSortDirection('desc');
            }
          }}
          sortField={sortBy}
          sortDirection={sortDirection}
          onRowClick={onItemClick}
        />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Filter Controls */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Analytics & Grouping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group By</label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="utilization">Utilization</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="sessions">Sessions</SelectItem>
                  <SelectItem value="avgCheckedIn">Avg Check-in</SelectItem>
                  <SelectItem value="cancellationRate">Cancellation Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input 
                placeholder="Search trainers, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Type Sections */}
      <Tabs defaultValue="powercycle" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="powercycle" className="gap-2">
            <Zap className="w-4 h-4" />
            PowerCycle
          </TabsTrigger>
          <TabsTrigger value="barre" className="gap-2">
            <Activity className="w-4 h-4" />
            Barre
          </TabsTrigger>
          <TabsTrigger value="strength" className="gap-2">
            <Dumbbell className="w-4 h-4" />
            Strength
          </TabsTrigger>
        </TabsList>

        <TabsContent value="powercycle">
          {renderClassSection(
            'powercycle', 
            groupedData.powerCycleData, 
            <Zap className="w-6 h-6 text-blue-600" />,
            'bg-blue-600'
          )}
        </TabsContent>

        <TabsContent value="barre">
          {renderClassSection(
            'barre', 
            groupedData.barreData, 
            <Activity className="w-6 h-6 text-pink-600" />,
            'bg-pink-600'
          )}
        </TabsContent>

        <TabsContent value="strength">
          {renderClassSection(
            'strength', 
            groupedData.strengthData, 
            <Dumbbell className="w-6 h-6 text-orange-600" />,
            'bg-orange-600'
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};