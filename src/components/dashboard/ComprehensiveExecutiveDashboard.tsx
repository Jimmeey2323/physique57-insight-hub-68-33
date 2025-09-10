
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3, 
  Calendar, 
  Eye,
  Activity,
  UserCheck,
  Zap,
  ShoppingCart,
  TrendingDown,
  Percent,
  Clock,
  Home
} from 'lucide-react';
import { ExecutiveLocationSelector } from './ExecutiveLocationSelector';
import { ExecutiveMetricCardsGrid } from './ExecutiveMetricCardsGrid';
import { ExecutiveChartsGrid } from './ExecutiveChartsGrid';
import { EnhancedExecutiveDataTables } from './EnhancedExecutiveDataTables';
import { ExecutiveTopPerformersGrid } from './ExecutiveTopPerformersGrid';
import { ExecutiveDiscountsTab } from './ExecutiveDiscountsTab';
import { ExecutiveFilterSection } from './ExecutiveFilterSection';
import { PowerCycleBarreStrengthComparison } from './PowerCycleBarreStrengthComparison';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { useGlobalFilters } from '@/contexts/GlobalFiltersContext';
import { useSalesData } from '@/hooks/useSalesData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useDiscountAnalysis } from '@/hooks/useDiscountAnalysis';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';

export const ComprehensiveExecutiveDashboard = () => {
  const [showSourceData, setShowSourceData] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const { filters } = useGlobalFilters();

  // Load real data from hooks
  const { data: salesData, loading: salesLoading } = useSalesData();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: payrollData, isLoading: payrollLoading } = usePayrollData();
  const { data: newClientsData, loading: newClientsLoading } = useNewClientData();
  const { data: leadsData, loading: leadsLoading } = useLeadsData();
  const { data: discountData, loading: discountLoading } = useDiscountAnalysis();

  // Get unique locations for the selector
  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    
    salesData?.forEach(sale => {
      if (sale.calculatedLocation) locations.add(sale.calculatedLocation);
    });
    
    sessionsData?.forEach(session => {
      if (session.location) locations.add(session.location);
    });
    
    newClientsData?.forEach(client => {
      if (client.homeLocation) locations.add(client.homeLocation);
    });
    
    payrollData?.forEach(payroll => {
      if (payroll.location) locations.add(payroll.location);
    });

    return Array.from(locations).sort();
  }, [salesData, sessionsData, newClientsData, payrollData]);

  // Filter data to previous month and by location
  const previousMonthData = useMemo(() => {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filterByPreviousMonth = (dateStr: string) => {
      const date = new Date(dateStr);
      return date >= previousMonth && date < currentMonth;
    };

    const filterByLocation = (items: any[], locationKey: string) => {
      if (!filters.location || filters.location.length === 0) return items;
      const locationFilter = Array.isArray(filters.location) ? filters.location[0] : filters.location;
      return items.filter(item => item[locationKey] === locationFilter);
    };

    const filteredSales = filterByLocation(
      salesData?.filter(item => filterByPreviousMonth(item.paymentDate)) || [],
      'calculatedLocation'
    );

    const filteredSessions = filterByLocation(
      sessionsData?.filter(item => filterByPreviousMonth(item.date)) || [],
      'location'
    );

    const filteredPayroll = filterByLocation(
      payrollData?.filter(item => {
        const monthYear = item.monthYear;
        const prevMonthStr = previousMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return monthYear === prevMonthStr;
      }) || [],
      'location'
    );

    const filteredNewClients = filterByLocation(
      newClientsData?.filter(item => filterByPreviousMonth(item.firstVisitDate)) || [],
      'homeLocation'
    );

    const prevPeriod = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;

    const filteredLeads = filterByLocation(
      (leadsData?.filter(item => {
        const createdOk = item.createdAt ? filterByPreviousMonth(item.createdAt) : false;
        const periodOk = item.period ? item.period === prevPeriod : false;
        return createdOk || periodOk;
      }) || []),
      'center'
    );

    const filteredDiscounts = filterByLocation(
      discountData?.filter(item => filterByPreviousMonth(item.paymentDate)) || [],
      'location'
    );

    return {
      sales: filteredSales,
      sessions: filteredSessions,
      payroll: filteredPayroll,
      newClients: filteredNewClients,
      leads: filteredLeads,
      discounts: filteredDiscounts
    };
  }, [salesData, sessionsData, payrollData, newClientsData, leadsData, discountData, filters.location]);

  const isLoading = salesLoading || sessionsLoading || payrollLoading || newClientsLoading || leadsLoading || discountLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-slate-600">Loading Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  const selectedLocation = Array.isArray(filters.location) ? filters.location[0] : filters.location;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 p-6">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-700 rounded-3xl text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-10 w-24 h-24 bg-indigo-300/20 rounded-full animate-bounce delay-1000"></div>
            <div className="absolute bottom-10 left-20 w-40 h-40 bg-purple-300/10 rounded-full animate-pulse delay-500"></div>
          </div>
          
          <div className="relative p-12">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 animate-fade-in-up">
                <BarChart3 className="w-6 h-6" />
                <span className="font-semibold text-lg">Executive Dashboard</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent animate-fade-in-up delay-200">
                Executive Overview
              </h1>
              
              <p className="text-xl text-indigo-100 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                Comprehensive real-time insights across Sales, Leads, Sessions, Trainers, and Client Conversions
                {selectedLocation && ` - ${selectedLocation}`}
              </p>
              
              <div className="flex items-center justify-center gap-4 animate-fade-in-up delay-400">
                <Badge className="bg-white/10 text-white border-white/20 px-4 py-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Previous Month Data
                </Badge>
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-4 py-2">
                  <Activity className="w-4 h-4 mr-2" />
                  Live Analytics
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30 px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  {previousMonthData.sales.length + previousMonthData.sessions.length + previousMonthData.newClients.length} Records
                </Badge>
              </div>

              {/* Dashboard Navigation Button */}
              <div className="flex justify-center gap-4 mt-6">
                <AdvancedExportButton 
                  salesData={previousMonthData.sales}
                  sessionsData={previousMonthData.sessions}
                  newClientData={previousMonthData.newClients}
                  payrollData={previousMonthData.payroll}
                  lateCancellationsData={[]}
                  discountData={previousMonthData.discounts}
                  defaultFileName="executive-dashboard-export"
                  size="lg"
                  variant="outline"
                />
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Main Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section with Location Selector */}
        <ExecutiveFilterSection availableLocations={availableLocations} />

        {/* Key Performance Metrics - 12 Cards with real data */}
        <ExecutiveMetricCardsGrid data={previousMonthData} />

        {/* Interactive Charts Section - 4 Charts with real data */}
        <ExecutiveChartsGrid data={previousMonthData} />

        {/* Main Content Sections */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 text-white border-0">
            <CardTitle className="text-2xl font-bold flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              Comprehensive Performance Analytics
              <Badge className="bg-white/20 text-white backdrop-blur-sm px-3 py-1">
                15+ Data Tables
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
              <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-5 w-full max-w-6xl mx-auto overflow-hidden mb-8">
                <TabsTrigger 
                  value="overview" 
                  className="relative rounded-xl px-4 py-3 font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Data Tables
                </TabsTrigger>
                <TabsTrigger 
                  value="performers" 
                  className="relative rounded-xl px-4 py-3 font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Top Performers
                </TabsTrigger>
                <TabsTrigger 
                  value="trends" 
                  className="relative rounded-xl px-4 py-3 font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Trend Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="discounts" 
                  className="relative rounded-xl px-4 py-3 font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50"
                >
                  <Percent className="w-4 h-4 mr-2" />
                  Discounts
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className="relative rounded-xl px-4 py-3 font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <div className="space-y-6">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <EnhancedExecutiveDataTables data={previousMonthData} selectedLocation={selectedLocation} />
                </TabsContent>

                <TabsContent value="performers" className="space-y-6 mt-0">
                  <ExecutiveTopPerformersGrid data={previousMonthData} />
                </TabsContent>

                <TabsContent value="trends" className="space-y-6 mt-0">
                  <ExecutiveChartsGrid data={previousMonthData} showTrends={true} />
                </TabsContent>

                <TabsContent value="discounts" className="space-y-6 mt-0">
                  <ExecutiveDiscountsTab data={previousMonthData.sales} selectedLocation={selectedLocation} />
                  <PowerCycleBarreStrengthComparison data={{
                    sessions: previousMonthData.sessions,
                    payroll: previousMonthData.payroll,
                    sales: previousMonthData.sales
                  }} />
                </TabsContent>

                <TabsContent value="insights" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-blue-800">Key Performance Insights</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">
                            Total Revenue: ${previousMonthData.sales.reduce((sum, sale) => sum + sale.paymentValue, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium">
                            New Clients: {previousMonthData.newClients.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                          <Target className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium">
                            Total Sessions: {previousMonthData.sessions.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                          <Percent className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium">
                            Discount Transactions: {previousMonthData.discounts.length}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-green-800">Action Items</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium">
                            Sessions with low attendance: {previousMonthData.sessions.filter(s => s.checkedInCount < s.capacity * 0.5).length}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium">
                            Empty sessions: {previousMonthData.sessions.filter(s => s.checkedInCount === 0).length}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium">
                            Lead conversion rate: {previousMonthData.leads.length > 0 ? 
                              ((previousMonthData.leads.filter(l => l.conversionStatus === 'Converted').length / previousMonthData.leads.length) * 100).toFixed(1) : '0'}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">
                            Total Discount Amount: ${previousMonthData.discounts.reduce((sum, d) => sum + d.discountAmount, 0).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Source Data Modal */}
        {showSourceData && (
          <SourceDataModal
            open={showSourceData}
            onOpenChange={setShowSourceData}
            sources={[
              {
                name: "Sales Data (Previous Month)",
                data: previousMonthData.sales
              },
              {
                name: "Sessions Data (Previous Month)",
                data: previousMonthData.sessions
              },
              {
                name: "New Clients Data (Previous Month)",
                data: previousMonthData.newClients
              },
              {
                name: "Leads Data (Previous Month)",
                data: previousMonthData.leads
              },
              {
                name: "Payroll Data (Previous Month)",
                data: previousMonthData.payroll
              },
              {
                name: "Discounts Data (Previous Month)",
                data: previousMonthData.discounts
              }
            ]}
          />
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};
