import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PayrollData } from '@/types/dashboard';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { Users, Calendar, Package, MapPin, ChevronLeft, ChevronRight, BarChart3, Zap, Activity, Dumbbell } from 'lucide-react';

interface PowerCycleBarreStrengthDataTablesProps {
  data: PayrollData[];
  onItemClick?: (item: any) => void;
  viewType?: 'overview' | 'trainers';
}

const ITEMS_PER_PAGE = 100;

export const PowerCycleBarreStrengthDataTables: React.FC<PowerCycleBarreStrengthDataTablesProps> = ({ 
  data, 
  onItemClick,
  viewType = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState('trainer-breakdown');
  const [currentPage, setCurrentPage] = useState(1);

  // Trainer breakdown analysis
  const trainerBreakdown = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(trainer => ({
      teacherName: trainer.teacherName,
      location: trainer.location,
      monthYear: trainer.monthYear,
      
      // PowerCycle metrics
      cycleSessions: trainer.cycleSessions || 0,
      cycleCustomers: trainer.cycleCustomers || 0,
      cycleRevenue: trainer.cyclePaid || 0,
      emptyCycleSessions: trainer.emptyCycleSessions || 0,
      cycleAvgCustomers: (trainer.cycleSessions || 0) > 0 ? (trainer.cycleCustomers || 0) / (trainer.cycleSessions || 0) : 0,
      
      // Barre metrics
      barreSessions: trainer.barreSessions || 0,
      barreCustomers: trainer.barreCustomers || 0,
      barreRevenue: trainer.barrePaid || 0,
      emptyBarreSessions: trainer.emptyBarreSessions || 0,
      barreAvgCustomers: (trainer.barreSessions || 0) > 0 ? (trainer.barreCustomers || 0) / (trainer.barreSessions || 0) : 0,
      
      // Strength metrics
      strengthSessions: trainer.strengthSessions || 0,
      strengthCustomers: trainer.strengthCustomers || 0,
      strengthRevenue: trainer.strengthPaid || 0,
      emptyStrengthSessions: trainer.emptyStrengthSessions || 0,
      strengthAvgCustomers: (trainer.strengthSessions || 0) > 0 ? (trainer.strengthCustomers || 0) / (trainer.strengthSessions || 0) : 0,
      
      // Totals
      totalSessions: trainer.totalSessions || 0,
      totalCustomers: trainer.totalCustomers || 0,
      totalRevenue: trainer.totalPaid || 0,
      totalEmptySessions: trainer.totalEmptySessions || 0,
      
      // Performance metrics
      conversionRate: parseFloat(trainer.conversionRate?.toString().replace('%', '') || '0'),
      retentionRate: parseFloat(trainer.retentionRate?.toString().replace('%', '') || '0'),
      newCustomers: trainer.newCustomers || 0
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [data]);

  // Location analysis
  const locationAnalysis = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const locationGroups = data.reduce((acc, trainer) => {
      const location = trainer.location || 'Unknown';
      
      if (!acc[location]) {
        acc[location] = {
          location,
          trainers: new Set(),
          cycleSessions: 0,
          barreSessions: 0,
          strengthSessions: 0,
          cycleRevenue: 0,
          barreRevenue: 0,
          strengthRevenue: 0,
          totalSessions: 0,
          totalRevenue: 0,
          totalCustomers: 0
        };
      }
      
      acc[location].trainers.add(trainer.teacherName);
      acc[location].cycleSessions += trainer.cycleSessions || 0;
      acc[location].barreSessions += trainer.barreSessions || 0;
      acc[location].strengthSessions += trainer.strengthSessions || 0;
      acc[location].cycleRevenue += trainer.cyclePaid || 0;
      acc[location].barreRevenue += trainer.barrePaid || 0;
      acc[location].strengthRevenue += trainer.strengthPaid || 0;
      acc[location].totalSessions += trainer.totalSessions || 0;
      acc[location].totalRevenue += trainer.totalPaid || 0;
      acc[location].totalCustomers += trainer.totalCustomers || 0;
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(locationGroups)
      .map((location: any) => ({
        ...location,
        trainerCount: location.trainers.size
      }))
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);
  }, [data]);

  // Format analysis by class type
  const formatAnalysis = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const formatTotals = data.reduce((acc, trainer) => {
      acc.powerCycle.sessions += trainer.cycleSessions || 0;
      acc.powerCycle.customers += trainer.cycleCustomers || 0;
      acc.powerCycle.revenue += trainer.cyclePaid || 0;
      acc.powerCycle.trainers.add(trainer.teacherName);
      
      acc.barre.sessions += trainer.barreSessions || 0;
      acc.barre.customers += trainer.barreCustomers || 0;
      acc.barre.revenue += trainer.barrePaid || 0;
      acc.barre.trainers.add(trainer.teacherName);
      
      acc.strength.sessions += trainer.strengthSessions || 0;
      acc.strength.customers += trainer.strengthCustomers || 0;
      acc.strength.revenue += trainer.strengthPaid || 0;
      acc.strength.trainers.add(trainer.teacherName);
      
      return acc;
    }, {
      powerCycle: { sessions: 0, customers: 0, revenue: 0, trainers: new Set() },
      barre: { sessions: 0, customers: 0, revenue: 0, trainers: new Set() },
      strength: { sessions: 0, customers: 0, revenue: 0, trainers: new Set() }
    });
    
    return [
      {
        format: 'PowerCycle',
        sessions: formatTotals.powerCycle.sessions,
        customers: formatTotals.powerCycle.customers,
        revenue: formatTotals.powerCycle.revenue,
        trainers: formatTotals.powerCycle.trainers.size,
        avgCustomersPerSession: formatTotals.powerCycle.sessions > 0 ? formatTotals.powerCycle.customers / formatTotals.powerCycle.sessions : 0,
        avgRevenuePerSession: formatTotals.powerCycle.sessions > 0 ? formatTotals.powerCycle.revenue / formatTotals.powerCycle.sessions : 0
      },
      {
        format: 'Barre',
        sessions: formatTotals.barre.sessions,
        customers: formatTotals.barre.customers,
        revenue: formatTotals.barre.revenue,
        trainers: formatTotals.barre.trainers.size,
        avgCustomersPerSession: formatTotals.barre.sessions > 0 ? formatTotals.barre.customers / formatTotals.barre.sessions : 0,
        avgRevenuePerSession: formatTotals.barre.sessions > 0 ? formatTotals.barre.revenue / formatTotals.barre.sessions : 0
      },
      {
        format: 'Strength',
        sessions: formatTotals.strength.sessions,
        customers: formatTotals.strength.customers,
        revenue: formatTotals.strength.revenue,
        trainers: formatTotals.strength.trainers.size,
        avgCustomersPerSession: formatTotals.strength.sessions > 0 ? formatTotals.strength.customers / formatTotals.strength.sessions : 0,
        avgRevenuePerSession: formatTotals.strength.sessions > 0 ? formatTotals.strength.revenue / formatTotals.strength.sessions : 0
      }
    ];
  }, [data]);

  // Pagination logic
  const getPaginatedData = (tableData: any[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return tableData.slice(startIndex, endIndex);
  };

  const getTotalPages = (tableData: any[]) => {
    return Math.ceil(tableData.length / ITEMS_PER_PAGE);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'trainer-breakdown':
        return trainerBreakdown;
      case 'location-analysis':
        return locationAnalysis;
      case 'format-analysis':
        return formatAnalysis;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  const paginatedData = getPaginatedData(currentData);
  const totalPages = getTotalPages(currentData);

  // Reset page when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, currentData.length)} of {currentData.length} results
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (pageNum > totalPages) return null;
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          PowerCycle vs Barre vs Strength Analysis
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
            35px row height
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="trainer-breakdown" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Trainer Breakdown
              </TabsTrigger>
              <TabsTrigger value="location-analysis" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Analysis
              </TabsTrigger>
              <TabsTrigger value="format-analysis" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Format Analysis
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trainer-breakdown" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-between px-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Trainer Performance Breakdown</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {currentData.length} trainers
                  </Badge>
                </div>
              </div>
              
              {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trainer</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>PC Sessions</TableHead>
                        <TableHead>Barre Sessions</TableHead>
                        <TableHead>Strength Sessions</TableHead>
                        <TableHead>PC Revenue</TableHead>
                        <TableHead>Barre Revenue</TableHead>
                        <TableHead>Strength Revenue</TableHead>
                        <TableHead>Total Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((trainer, index) => (
                        <TableRow key={index} className="h-[35px] max-h-[35px]">
                          <TableCell className="font-medium h-[35px] py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {trainer.teacherName ? trainer.teacherName.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'UK'}
                              </div>
                              <span className="font-semibold text-sm truncate max-w-[120px]">{trainer.teacherName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="h-[35px] py-2">
                            <Badge variant="outline" className="text-xs">
                              {trainer.location?.split(',')[0] || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="h-[35px] py-2">
                            <span className="text-xs">{trainer.monthYear}</span>
                          </TableCell>
                          <TableCell className="h-[35px] py-2 text-center">
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {formatNumber(trainer.cycleSessions)}
                            </Badge>
                          </TableCell>
                          <TableCell className="h-[35px] py-2 text-center">
                            <Badge className="bg-pink-100 text-pink-800 text-xs">
                              {formatNumber(trainer.barreSessions)}
                            </Badge>
                          </TableCell>
                          <TableCell className="h-[35px] py-2 text-center">
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              {formatNumber(trainer.strengthSessions)}
                            </Badge>
                          </TableCell>
                          <TableCell className="h-[35px] py-2 text-right">
                            <span className="text-blue-600 font-semibold text-xs">{formatCurrency(trainer.cycleRevenue)}</span>
                          </TableCell>
                          <TableCell className="h-[35px] py-2 text-right">
                            <span className="text-pink-600 font-semibold text-xs">{formatCurrency(trainer.barreRevenue)}</span>
                          </TableCell>
                          <TableCell className="h-[35px] py-2 text-right">
                            <span className="text-orange-600 font-semibold text-xs">{formatCurrency(trainer.strengthRevenue)}</span>
                          </TableCell>
                          <TableCell className="h-[35px] py-2 text-right">
                            <span className="text-green-600 font-bold text-xs">{formatCurrency(trainer.totalRevenue)}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationControls />
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">No trainer data available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="location-analysis" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-between px-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Location Performance Analysis</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {locationAnalysis.length} locations
                  </Badge>
                </div>
              </div>
              
              {locationAnalysis.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Trainers</TableHead>
                      <TableHead>PC Sessions</TableHead>
                      <TableHead>Barre Sessions</TableHead>
                      <TableHead>Strength Sessions</TableHead>
                      <TableHead>Total Sessions</TableHead>
                      <TableHead>Total Customers</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Avg Revenue/Session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locationAnalysis.map((location, index) => (
                      <TableRow key={index} className="h-[35px] max-h-[35px]">
                        <TableCell className="font-medium h-[35px] py-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-sm truncate max-w-[150px]">{location.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="h-[35px] py-2 text-center">
                          <Badge variant="outline" className="text-xs">
                            {formatNumber(location.trainerCount)}
                          </Badge>
                        </TableCell>
                        <TableCell className="h-[35px] py-2 text-center">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {formatNumber(location.cycleSessions)}
                          </Badge>
                        </TableCell>
                        <TableCell className="h-[35px] py-2 text-center">
                          <Badge className="bg-pink-100 text-pink-800 text-xs">
                            {formatNumber(location.barreSessions)}
                          </Badge>
                        </TableCell>
                        <TableCell className="h-[35px] py-2 text-center">
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            {formatNumber(location.strengthSessions)}
                          </Badge>
                        </TableCell>
                        <TableCell className="h-[35px] py-2 text-center">
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            {formatNumber(location.totalSessions)}
                          </Badge>
                        </TableCell>
                        <TableCell className="h-[35px] py-2 text-center">
                          <span className="text-sm font-semibold">{formatNumber(location.totalCustomers)}</span>
                        </TableCell>
                        <TableCell className="h-[35px] py-2 text-right">
                          <span className="text-green-600 font-bold text-sm">{formatCurrency(location.totalRevenue)}</span>
                        </TableCell>
                        <TableCell className="h-[35px] py-2 text-right">
                          <span className="text-sm font-semibold">
                            {location.totalSessions > 0 ? formatCurrency(location.totalRevenue / location.totalSessions) : '₹0'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-8">No location data available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="format-analysis" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-between px-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold">Class Format Performance</h3>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    3 formats
                  </Badge>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Format</TableHead>
                    <TableHead>Total Sessions</TableHead>
                    <TableHead>Total Customers</TableHead>
                    <TableHead>Active Trainers</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Avg Customers/Session</TableHead>
                    <TableHead>Avg Revenue/Session</TableHead>
                    <TableHead>Performance Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formatAnalysis.map((format, index) => (
                    <TableRow key={index} className="h-[35px] max-h-[35px]">
                      <TableCell className="font-medium h-[35px] py-2">
                        <div className="flex items-center gap-2">
                          {format.format === 'PowerCycle' && <Zap className="w-4 h-4 text-blue-600" />}
                          {format.format === 'Barre' && <Activity className="w-4 h-4 text-pink-600" />}
                          {format.format === 'Strength' && <Dumbbell className="w-4 h-4 text-orange-600" />}
                          <span className="font-semibold text-sm">{format.format}</span>
                        </div>
                      </TableCell>
                      <TableCell className="h-[35px] py-2 text-center">
                        <Badge variant="outline" className="text-xs">
                          {formatNumber(format.sessions)}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-[35px] py-2 text-center">
                        <span className="text-sm font-semibold">{formatNumber(format.customers)}</span>
                      </TableCell>
                      <TableCell className="h-[35px] py-2 text-center">
                        <Badge variant="secondary" className="text-xs">
                          {formatNumber(format.trainers)}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-[35px] py-2 text-right">
                        <span className="text-green-600 font-bold text-sm">{formatCurrency(format.revenue)}</span>
                      </TableCell>
                      <TableCell className="h-[35px] py-2 text-center">
                        <span className="text-sm font-semibold">{format.avgCustomersPerSession.toFixed(1)}</span>
                      </TableCell>
                      <TableCell className="h-[35px] py-2 text-right">
                        <span className="text-sm font-semibold">{formatCurrency(format.avgRevenuePerSession)}</span>
                      </TableCell>
                      <TableCell className="h-[35px] py-2 text-center">
                        <Badge className={`text-xs ${
                          format.avgCustomersPerSession > 8 ? 'bg-green-100 text-green-800' :
                          format.avgCustomersPerSession > 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {format.avgCustomersPerSession > 8 ? 'Excellent' :
                           format.avgCustomersPerSession > 5 ? 'Good' : 'Needs Focus'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};