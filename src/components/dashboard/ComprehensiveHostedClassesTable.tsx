import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { 
  Building2, Search, Calendar, Users, MapPin, Clock, Target, Award,
  TrendingUp, TrendingDown, Minus, ArrowUpDown, Filter
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';

interface ComprehensiveHostedClassesTableProps {
  data: SessionData[];
}

export const ComprehensiveHostedClassesTable: React.FC<ComprehensiveHostedClassesTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'attendance' | 'revenue' | 'trainer' | 'fillRate' | 'conversion'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [activeTab, setActiveTab] = useState('comprehensive');

  const { processedData, locations, classFormats, summaryStats } = useMemo(() => {
    if (!data) return { processedData: [], locations: [], classFormats: [], summaryStats: null };

    const locations = [...new Set(data.map(session => session.location).filter(Boolean))];
    const classFormats = [...new Set(data.map(session => session.cleanedClass || session.classType).filter(Boolean))];

    // Process each session with comprehensive metrics
    const processed = data
      .filter(session => {
        const matchesSearch = !searchTerm || 
          session.sessionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.cleanedClass?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLocation = filterLocation === 'all' || session.location === filterLocation;
        const matchesClass = filterClass === 'all' || (session.cleanedClass || session.classType) === filterClass;

        return matchesSearch && matchesLocation && matchesClass;
      })
      .map(session => {
        const checkedIn = session.checkedInCount || 0;
        const booked = session.bookedCount || 0;
        const capacity = session.capacity || 0;
        const cancelled = session.lateCancelledCount || 0;
        const newCount = (session as any).newClientCount || 0;
        const revenue = session.totalPaid || 0;

        // Calculate comprehensive metrics
        const fillRate = capacity > 0 ? Math.round((checkedIn / capacity) * 100) : 0;
        const bookingRate = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;
        const showUpRate = booked > 0 ? Math.round((checkedIn / booked) * 100) : 0;
        const cancellationRate = booked > 0 ? Math.round((cancelled / booked) * 100) : 0;
        const newClientRate = checkedIn > 0 ? Math.round((newCount / checkedIn) * 100) : 0;
        const retainedCount = checkedIn - newCount;
        const retentionRate = checkedIn > 0 ? Math.round((retainedCount / checkedIn) * 100) : 0;
        
        // Performance score (weighted average of key metrics)
        const score = Math.round(
          (fillRate * 0.3 + showUpRate * 0.25 + (100 - cancellationRate) * 0.2 + 
           retentionRate * 0.15 + newClientRate * 0.1)
        );

        return {
          id: (session as any).id || Math.random().toString(),
          className: session.cleanedClass || session.classType || 'Unknown',
          sessionName: session.sessionName || 'Unknown Session',
          date: session.date ? new Date(session.date).toLocaleDateString() : 'Unknown',
          time: session.time || 'Unknown',
          location: session.location || 'Unknown',
          trainer: session.trainerName || 'Unknown',
          newCount,
          checkedIn,
          booked,
          capacity,
          cancelled,
          retained: retainedCount,
          conversion: newClientRate,
          retention: retentionRate,
          fillRate,
          bookingRate,
          showUpRate,
          cancellationRate,
          revenue,
          revenuePerAttendee: checkedIn > 0 ? Math.round(revenue / checkedIn) : 0,
          score,
          rawSession: session
        };
      })
      .sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case 'date':
            aValue = new Date(a.rawSession.date || '');
            bValue = new Date(b.rawSession.date || '');
            break;
          case 'attendance':
            aValue = a.checkedIn;
            bValue = b.checkedIn;
            break;
          case 'revenue':
            aValue = a.revenue;
            bValue = b.revenue;
            break;
          case 'trainer':
            aValue = a.trainer;
            bValue = b.trainer;
            break;
          case 'fillRate':
            aValue = a.fillRate;
            bValue = b.fillRate;
            break;
          case 'conversion':
            aValue = a.conversion;
            bValue = b.conversion;
            break;
          default:
            return 0;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

    // Calculate summary statistics
    const totalSessions = processed.length;
    const totalAttendance = processed.reduce((sum, item) => sum + item.checkedIn, 0);
    const totalRevenue = processed.reduce((sum, item) => sum + item.revenue, 0);
    const totalCapacity = processed.reduce((sum, item) => sum + item.capacity, 0);
    const totalNew = processed.reduce((sum, item) => sum + item.newCount, 0);
    const totalRetained = processed.reduce((sum, item) => sum + item.retained, 0);
    
    const avgFillRate = totalCapacity > 0 ? Math.round((totalAttendance / totalCapacity) * 100) : 0;
    const avgConversion = totalAttendance > 0 ? Math.round((totalNew / totalAttendance) * 100) : 0;
    const avgRetention = totalAttendance > 0 ? Math.round((totalRetained / totalAttendance) * 100) : 0;
    const avgScore = totalSessions > 0 ? Math.round(processed.reduce((sum, item) => sum + item.score, 0) / totalSessions) : 0;

    const summaryStats = {
      totalSessions,
      totalAttendance,
      totalRevenue,
      totalNew,
      totalRetained,
      avgFillRate,
      avgConversion,
      avgRetention,
      avgScore,
      avgRevenuePerSession: totalSessions > 0 ? Math.round(totalRevenue / totalSessions) : 0
    };

    return { processedData: processed, locations, classFormats, summaryStats };
  }, [data, searchTerm, sortBy, sortOrder, filterLocation, filterClass]);

  const columns = [
    {
      key: 'className' as const,
      header: 'Class Name',
      render: (value: string, item: any) => (
        <div className="font-medium text-slate-800">
          <div>{value}</div>
          <div className="text-xs text-slate-500">{item.sessionName}</div>
        </div>
      ),
      className: 'min-w-[160px]'
    },
    {
      key: 'date' as const,
      header: 'Date',
      render: (value: string, item: any) => (
        <div className="text-sm">
          <div className="font-medium">{value}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.time}
          </div>
        </div>
      )
    },
    {
      key: 'location' as const,
      header: 'Location',
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="w-3 h-3 text-slate-400" />
          {value}
        </div>
      )
    },
    {
      key: 'trainer' as const,
      header: 'Trainer',
      render: (value: string) => (
        <div className="font-medium text-slate-700">{value}</div>
      )
    },
    {
      key: 'newCount' as const,
      header: 'New',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {value}
        </Badge>
      )
    },
    {
      key: 'checkedIn' as const,
      header: 'Checked In',
      align: 'center' as const,
      render: (value: number) => (
        <div className="font-semibold text-green-600">{value}</div>
      )
    },
    {
      key: 'booked' as const,
      header: 'Booked',
      align: 'center' as const,
      render: (value: number) => (
        <div className="font-medium text-slate-700">{value}</div>
      )
    },
    {
      key: 'cancelled' as const,
      header: 'Cancelled',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value > 0 ? "outline" : "secondary"} className={value > 0 ? "text-red-600" : ""}>
          {value}
        </Badge>
      )
    },
    {
      key: 'retained' as const,
      header: 'Retained',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="default" className="bg-purple-100 text-purple-800">
          {value}
        </Badge>
      )
    },
    {
      key: 'conversion' as const,
      header: 'Conversion %',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          {value >= 30 ? <TrendingUp className="w-3 h-3 text-green-500" /> :
           value >= 15 ? <Minus className="w-3 h-3 text-yellow-500" /> :
           <TrendingDown className="w-3 h-3 text-red-500" />}
          <span className={`font-medium ${value >= 30 ? 'text-green-600' : value >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
            {value}%
          </span>
        </div>
      )
    },
    {
      key: 'retention' as const,
      header: 'Retention %',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          {value >= 70 ? <TrendingUp className="w-3 h-3 text-green-500" /> :
           value >= 50 ? <Minus className="w-3 h-3 text-yellow-500" /> :
           <TrendingDown className="w-3 h-3 text-red-500" />}
          <span className={`font-medium ${value >= 70 ? 'text-green-600' : value >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {value}%
          </span>
        </div>
      )
    },
    {
      key: 'fillRate' as const,
      header: 'Fill Rate %',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value >= 80 ? 'default' : value >= 60 ? 'secondary' : 'outline'}>
          {value}%
        </Badge>
      )
    },
    {
      key: 'revenue' as const,
      header: 'Revenue',
      align: 'right' as const,
      render: (value: number) => (
        <div className="font-semibold text-green-600">₹{value.toLocaleString()}</div>
      )
    },
    {
      key: 'score' as const,
      header: 'Score',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          <Award className={`w-4 h-4 ${value >= 80 ? 'text-yellow-500' : value >= 60 ? 'text-blue-500' : 'text-slate-400'}`} />
          <span className={`font-bold ${value >= 80 ? 'text-yellow-600' : value >= 60 ? 'text-blue-600' : 'text-slate-500'}`}>
            {value}
          </span>
        </div>
      )
    }
  ];

  if (!summaryStats) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hosted classes found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            Comprehensive Class Analytics
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {summaryStats.totalSessions} sessions
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {summaryStats.totalAttendance} attendees
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              {summaryStats.avgScore} avg score
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comprehensive">Comprehensive Table</TabsTrigger>
            <TabsTrigger value="summary">Summary Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Total Sessions</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{summaryStats.totalSessions}</div>
                  <div className="text-xs text-purple-700">₹{summaryStats.avgRevenuePerSession.toLocaleString()} avg/session</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Total Attendance</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{summaryStats.totalAttendance.toLocaleString()}</div>
                  <div className="text-xs text-blue-700">{summaryStats.avgFillRate}% fill rate</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">New Clients</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">{summaryStats.totalNew}</div>
                  <div className="text-xs text-green-700">{summaryStats.avgConversion}% conversion rate</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Retained Clients</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">{summaryStats.totalRetained}</div>
                  <div className="text-xs text-orange-700">{summaryStats.avgRetention}% retention rate</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comprehensive" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by class, trainer, or session..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classFormats.map(format => (
                    <SelectItem key={format} value={format}>{format}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <OptimizedTable
              data={processedData}
              columns={columns}
              maxHeight="800px"
              stickyHeader={true}
              stickyFirstColumn={true}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};