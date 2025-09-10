
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePayrollData } from '@/hooks/usePayrollData';
import { TrainerYearOnYearTable } from './TrainerYearOnYearTable';
import { TrainerPerformanceDetailTable } from './TrainerPerformanceDetailTable';
import { TrainerEfficiencyAnalysisTable } from './TrainerEfficiencyAnalysisTable';
import { MonthOnMonthTrainerTable } from './MonthOnMonthTrainerTable';
import { DynamicTrainerDrillDownModal } from './DynamicTrainerDrillDownModal';
import { TrainerFilterSection } from './TrainerFilterSection';
import { TrainerMetricTabs } from './TrainerMetricTabs';
import { EnhancedTrainerRankings } from './EnhancedTrainerRankings';
import { EnhancedTrainerMetricCards } from './EnhancedTrainerMetricCards';
import { AdvancedNotesModal } from '@/components/ui/AdvancedNotesModal';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { processTrainerData } from './TrainerDataProcessor';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Users, Calendar, TrendingUp, AlertCircle, Award, Target, DollarSign, Activity, FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export const EnhancedTrainerPerformanceSection = () => {
  const { data: payrollData, isLoading, error } = usePayrollData();
  const [selectedTab, setSelectedTab] = useState('month-on-month');
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [filters, setFilters] = useState({ 
    location: '', 
    trainer: '', 
    month: '' // Start with no month filter to show all data
  });

  const processedData = useMemo(() => {
    if (!payrollData || payrollData.length === 0) return [];
    let data = processTrainerData(payrollData);
    
    // Apply filters
    if (selectedLocation !== 'All Locations') {
      data = data.filter(d => d.location === selectedLocation);
    }
    if (filters.location) {
      data = data.filter(d => d.location === filters.location);
    }
    if (filters.trainer) {
      data = data.filter(d => d.trainerName === filters.trainer);
    }
    if (filters.month) {
      data = data.filter(d => d.monthYear === filters.month);
    }
    
    return data;
  }, [payrollData, filters, selectedLocation]);

  const handleRowClick = (trainer: string, data: any) => {
    setSelectedTrainer(trainer);
    setDrillDownData(data);
  };

  const closeDrillDown = () => {
    setSelectedTrainer(null);
    setDrillDownData(null);
  };

  // Calculate summary statistics and metrics
  const summaryStats = useMemo(() => {
    if (!processedData.length) return null;

    const totalTrainers = new Set(processedData.map(d => d.trainerName)).size;
    const totalSessions = processedData.reduce((sum, d) => sum + d.totalSessions, 0);
    const totalRevenue = processedData.reduce((sum, d) => sum + d.totalPaid, 0);
    const totalCustomers = processedData.reduce((sum, d) => sum + d.totalCustomers, 0);
    const avgClassSize = totalSessions > 0 ? totalCustomers / totalSessions : 0;
    const avgRevenue = totalTrainers > 0 ? totalRevenue / totalTrainers : 0;

    return {
      totalTrainers,
      totalSessions,
      totalRevenue,
      totalCustomers,
      avgClassSize,
      avgRevenue
    };
  }, [processedData]);

  // Top and bottom performers
  const topBottomPerformers = useMemo(() => {
    if (!processedData.length) return { top: [], bottom: [] };

    const trainerStats = processedData.reduce((acc, trainer) => {
      if (!acc[trainer.trainerName]) {
        acc[trainer.trainerName] = {
          name: trainer.trainerName,
          totalSessions: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          location: trainer.location
        };
      }
      acc[trainer.trainerName].totalSessions += trainer.totalSessions;
      acc[trainer.trainerName].totalRevenue += trainer.totalPaid;
      acc[trainer.trainerName].totalCustomers += trainer.totalCustomers;
      return acc;
    }, {} as Record<string, any>);

    const trainers = Object.values(trainerStats);
    const sortedByRevenue = [...trainers].sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

    return {
      top: sortedByRevenue.slice(0, 5),
      bottom: sortedByRevenue.slice(-5).reverse()
    };
  }, [processedData]);

  // Chart data
  const chartData = useMemo(() => {
    if (!processedData.length) return [];

    const monthlyData = processedData.reduce((acc, trainer) => {
      const month = trainer.monthYear;
      if (!acc[month]) {
        acc[month] = { month, sessions: 0, revenue: 0, customers: 0 };
      }
      acc[month].sessions += trainer.totalSessions;
      acc[month].revenue += trainer.totalPaid;
      acc[month].customers += trainer.totalCustomers;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [processedData]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-slate-600">Loading trainer performance data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>Error loading trainer data: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!processedData.length) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardContent className="p-6">
          <p className="text-center text-slate-600">No trainer performance data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Tabs and Filter Section */}
      <div className="space-y-4">
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Location Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {['All Locations', ...Array.from(new Set(processedData.map(d => d.location)))].map((location) => (
                <button
                  key={location}
                  onClick={() => setSelectedLocation(location)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedLocation === location
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <TrainerFilterSection
          data={payrollData || []}
          onFiltersChange={setFilters}
          isCollapsed={isFiltersCollapsed}
          onToggleCollapse={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
        />
      </div>

      {/* Enhanced Metric Cards */}
      <EnhancedTrainerMetricCards data={processedData} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="Revenue" />
                <Line type="monotone" dataKey="sessions" stroke="#10B981" strokeWidth={2} name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Sessions vs Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#10B981" name="Sessions" />
                <Bar dataKey="customers" fill="#8B5CF6" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Rankings */}
      <EnhancedTrainerRankings 
        data={processedData} 
        onTrainerClick={handleRowClick}
      />

      {/* Analysis Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1 rounded-xl shadow-sm h-14">
          <TabsTrigger
            value="month-on-month"
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-blue-700"
          >
            <Calendar className="w-4 h-4" />
            Month-on-Month
          </TabsTrigger>
          <TabsTrigger
            value="year-on-year"
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-emerald-700"
          >
            <TrendingUp className="w-4 h-4" />
            Year-on-Year
          </TabsTrigger>
          <TabsTrigger
            value="efficiency-analysis"
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-orange-700"
          >
            <Target className="w-4 h-4" />
            Efficiency
          </TabsTrigger>
          <TabsTrigger
            value="performance-detail"
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-gray-50 data-[state=active]:hover:bg-purple-700"
          >
            <Award className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="month-on-month" className="space-y-6">
          <div className="flex justify-end mb-4">
            <AdvancedExportButton 
              payrollData={payrollData || []}
              defaultFileName="month-on-month-trainer-analysis"
              size="sm"
              variant="outline"
            />
          </div>
          <MonthOnMonthTrainerTable
            data={processedData}
            defaultMetric="totalSessions"
            onRowClick={handleRowClick}
          />
          <AdvancedNotesModal 
            pageId="month-on-month-trainer"
            title="Month-on-Month Analysis Notes"
          />
        </TabsContent>

        <TabsContent value="year-on-year" className="space-y-6">
          <div className="flex justify-end mb-4">
            <AdvancedExportButton 
              payrollData={payrollData || []}
              defaultFileName="year-on-year-trainer-analysis"
              size="sm"
              variant="outline"
            />
          </div>
          
          <TrainerYearOnYearTable
            data={processedData}
            onRowClick={handleRowClick}
          />
          
          <AdvancedNotesModal 
            pageId="year-on-year-trainer"
            title="Year-on-Year Analysis Notes"
          />
        </TabsContent>

        <TabsContent value="efficiency-analysis" className="space-y-6">
          <div className="flex justify-end mb-4">
            <AdvancedExportButton 
              payrollData={payrollData || []}
              defaultFileName="trainer-efficiency-analysis"
              size="sm"
              variant="outline"
            />
          </div>
          
          <TrainerEfficiencyAnalysisTable
            data={processedData}
            onRowClick={handleRowClick}
          />
          
          <AdvancedNotesModal 
            pageId="efficiency-analysis-trainer"
            title="Efficiency Analysis Notes"
          />
        </TabsContent>

        <TabsContent value="performance-detail" className="space-y-6">
          <div className="flex justify-end mb-4">
            <AdvancedExportButton 
              payrollData={payrollData || []}
              defaultFileName="trainer-performance-detail"
              size="sm"
              variant="outline"
            />
          </div>
          
          <TrainerPerformanceDetailTable
            data={processedData}
            onRowClick={handleRowClick}
          />
          
          <AdvancedNotesModal 
            pageId="performance-detail-trainer"
            title="Performance Detail Notes"
          />
        </TabsContent>
      </Tabs>

      {/* Dynamic Drill Down Modal */}
      {selectedTrainer && drillDownData && (
        <DynamicTrainerDrillDownModal
          isOpen={!!selectedTrainer}
          onClose={closeDrillDown}
          trainerName={selectedTrainer}
          trainerData={drillDownData}
        />
      )}
    </div>
  );
};
