import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { DiscountLocationSelector } from './DiscountLocationSelector';
import { DiscountFilterSection } from './DiscountFilterSection';
import { DiscountMetricCards } from './DiscountMetricCards';
import { DiscountInteractiveCharts } from './DiscountInteractiveCharts';
import { DiscountDataTable } from './DiscountDataTable';
import { DiscountMonthOnMonthTable } from './DiscountMonthOnMonthTable';
import { DiscountYearOnYearTable } from './DiscountYearOnYearTable';
import { DiscountInteractiveTopBottomLists } from './DiscountInteractiveTopBottomLists';
import { DiscountDrillDownModal } from './DiscountDrillDownModal';
import { EnhancedDiscountBreakdownTables } from './EnhancedDiscountBreakdownTables';
import { EnhancedDiscountDataTable } from './EnhancedDiscountDataTable';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';

interface EnhancedDiscountsDashboardV2Props {
  data: SalesData[];
}

export const EnhancedDiscountsDashboardV2: React.FC<EnhancedDiscountsDashboardV2Props> = ({ data }) => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [drillDownData, setDrillDownData] = useState<{
    isOpen: boolean;
    title: string;
    data: any[];
    type: string;
  }>({ isOpen: false, title: '', data: [], type: '' });

  // Set default date range to previous month
  useEffect(() => {
    const previousMonth = getPreviousMonthDateRange();
    setFilters({
      dateRange: {
        from: new Date(previousMonth.start),
        to: new Date(previousMonth.end)
      }
    });
  }, []);

  // Filter data based on all applied filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Location filter
      if (selectedLocation !== 'all' && item.calculatedLocation !== selectedLocation) return false;
      
      // Other filters from filter section
      if (filters.location && item.calculatedLocation !== filters.location) return false;
      if (filters.category && item.cleanedCategory !== filters.category) return false;
      if (filters.product && item.cleanedProduct !== filters.product) return false;
      if (filters.soldBy) {
        const soldBy = item.soldBy === '-' ? 'Online/System' : item.soldBy;
        if (soldBy !== filters.soldBy) return false;
      }
      if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) return false;
      
      // Date range filter with proper offset handling
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const itemDate = new Date(item.paymentDate);
        // Ensure we're comparing dates correctly without timezone issues
        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        
        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          const fromDateOnly = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
          if (itemDateOnly < fromDateOnly) return false;
        }
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          const toDateOnly = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
          if (itemDateOnly > toDateOnly) return false;
        }
      }
      
      // Discount amount filters
      if (filters.minDiscountAmount && (item.discountAmount || 0) < filters.minDiscountAmount) return false;
      if (filters.maxDiscountAmount && (item.discountAmount || 0) > filters.maxDiscountAmount) return false;
      if (filters.minDiscountPercent && (item.discountPercentage || 0) < filters.minDiscountPercent) return false;
      if (filters.maxDiscountPercent && (item.discountPercentage || 0) > filters.maxDiscountPercent) return false;
      
      return true;
    });
  }, [data, selectedLocation, filters]);

  // Only show discounted transactions for the discount analysis
  const discountedData = useMemo(() => {
    return filteredData.filter(item => (item.discountAmount || 0) > 0);
  }, [filteredData]);

  const handleDrillDown = (title: string, data: any[], type: string) => {
    setDrillDownData({
      isOpen: true,
      title,
      data,
      type
    });
  };

  const closeDrillDown = () => {
    setDrillDownData({ isOpen: false, title: '', data: [], type: '' });
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const toggleFilterCollapse = () => {
    setIsFilterCollapsed(!isFilterCollapsed);
  };

  return (
    <div className="space-y-6">
      {/* Location Selector */}
      <DiscountLocationSelector
        data={data}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />

      {/* Collapsible Filter Section */}
      <Collapsible open={!isFilterCollapsed} onOpenChange={() => setIsFilterCollapsed(!isFilterCollapsed)}>
        <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-slate-50 backdrop-blur-sm">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-6 h-auto hover:bg-indigo-100/40 transition-all duration-300"
              onClick={toggleFilterCollapse}
            >
              <div className="flex items-center gap-3">
                <Filter className="w-6 h-6 text-indigo-700" />
                <span className="text-xl font-bold text-indigo-900">
                  Advanced Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length} active)`}
                </span>
              </div>
              {isFilterCollapsed ? (
                <ChevronDown className="w-6 h-6 text-indigo-700" />
              ) : (
                <ChevronUp className="w-6 h-6 text-indigo-700" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 pb-6 border-t border-indigo-200/50 bg-white/30 backdrop-blur-sm">
              <DiscountFilterSection
                data={data}
                onFiltersChange={handleFiltersChange}
                isCollapsed={false}
                onToggleCollapse={toggleFilterCollapse}
              />
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Enhanced Metric Cards */}
      <DiscountMetricCards 
        data={discountedData} 
        filters={filters}
        onDrillDown={handleDrillDown}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="detailed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-indigo-100 via-purple-100 to-slate-100 p-1 rounded-xl shadow-lg border border-indigo-200/50">
          <TabsTrigger value="detailed" className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-800 font-semibold transition-all duration-300">
            Data Tables
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-800 font-semibold transition-all duration-300">
            Breakdowns
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-800 font-semibold transition-all duration-300">
            Trends
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-800 font-semibold transition-all duration-300">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-800 font-semibold transition-all duration-300">
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DiscountInteractiveCharts data={discountedData} />
          <DiscountInteractiveTopBottomLists 
            data={discountedData} 
            onDrillDown={handleDrillDown}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <DiscountInteractiveCharts data={discountedData} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6">
            <DiscountMonthOnMonthTable 
              data={discountedData} 
            />
            <DiscountYearOnYearTable 
              data={discountedData} 
            />
          </div>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-6">
          <DiscountInteractiveTopBottomLists 
            data={discountedData} 
            onDrillDown={handleDrillDown}
          />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-indigo-200/50">
            <EnhancedDiscountDataTable 
              data={discountedData}
              onRowClick={(title, data, type) => handleDrillDown(title, data, type)}
            />
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <EnhancedDiscountBreakdownTables 
            data={discountedData}
            onDrillDown={handleDrillDown}
          />
        </TabsContent>
      </Tabs>

      {/* Drill Down Modal */}
      <DiscountDrillDownModal
        isOpen={drillDownData.isOpen}
        onClose={closeDrillDown}
        title={drillDownData.title}
        data={drillDownData.data}
        type={drillDownData.type}
      />
    </div>
  );
};
