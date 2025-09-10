import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { MetricCard } from './MetricCard';
import { UnifiedTopBottomSellers } from './UnifiedTopBottomSellers';
import { ModernDrillDownModal } from './ModernDrillDownModal';
import { NoteTaker } from '@/components/ui/NoteTaker';
import { ExpirationChartsGrid } from './ExpirationChartsGrid';
import { ExpirationDataTables } from './ExpirationDataTables';
import { ExpirationAdditionalAnalytics } from './ExpirationAdditionalAnalytics';
import { ExpirationData, ExpirationFilterOptions, MetricCardData } from '@/types/dashboard';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { Calendar, Users, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface ExpirationAnalyticsSectionProps {
  data: ExpirationData[];
}

const locations = [{
  id: 'kwality',
  name: 'Kwality House, Kemps Corner',
  fullName: 'Kwality House, Kemps Corner'
}, {
  id: 'supreme',
  name: 'Supreme HQ, Bandra',
  fullName: 'Supreme HQ, Bandra'
}, {
  id: 'kenkere',
  name: 'Kenkere House',
  fullName: 'Kenkere House'
}];

export const ExpirationAnalyticsSection: React.FC<ExpirationAnalyticsSectionProps> = ({ data }) => {
  const [activeLocation, setActiveLocation] = useState('kwality');
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'expiration' | 'member' | 'status'>('expiration');

  // Initialize filters with previous month as default
  const [filters, setFilters] = useState<ExpirationFilterOptions>(() => {
    const previousMonth = getPreviousMonthDateRange();
    
    return {
      dateRange: previousMonth,
      location: [],
      status: [],
      membershipType: [],
      soldBy: []
    };
  });

  const applyFilters = (rawData: ExpirationData[]) => {
    console.log('Applying filters to', rawData.length, 'expiration records');
    
    let filtered = [...rawData];

    // Apply location filter
    filtered = filtered.filter(item => {
      const locationMatch = activeLocation === 'kwality' 
        ? item.homeLocation === 'Kwality House, Kemps Corner' 
        : activeLocation === 'supreme' 
        ? item.homeLocation === 'Supreme HQ, Bandra' 
        : item.homeLocation?.includes('Kenkere') || item.homeLocation === 'Kenkere House';
      return locationMatch;
    });

    // Apply status filter
    if (filters.status?.length) {
      filtered = filtered.filter(item => 
        filters.status!.some(status => 
          item.status?.toLowerCase().includes(status.toLowerCase())
        )
      );
    }

    // Apply membership type filter
    if (filters.membershipType?.length) {
      filtered = filtered.filter(item => 
        filters.membershipType!.some(type => 
          item.membershipName?.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Apply sold by filter
    if (filters.soldBy?.length) {
      filtered = filtered.filter(item => 
        filters.soldBy!.some(seller => 
          item.soldBy?.toLowerCase().includes(seller.toLowerCase())
        )
      );
    }

    return filtered;
  };

  const filteredData = useMemo(() => applyFilters(data || []), [data, filters, activeLocation]);

  const calculateMetrics = (data: ExpirationData[]): MetricCardData[] => {
    const totalMemberships = data.length;
    const activeCount = data.filter(item => item.status === 'Active').length;
    const churnedCount = data.filter(item => item.status === 'Churned').length;
    const frozenCount = data.filter(item => item.status === 'Frozen').length;

    const churnRate = totalMemberships > 0 ? (churnedCount / totalMemberships) * 100 : 0;
    const activeRate = totalMemberships > 0 ? (activeCount / totalMemberships) * 100 : 0;
    const frozenRate = totalMemberships > 0 ? (frozenCount / totalMemberships) * 100 : 0;

    return [
      {
        title: 'Total Memberships',
        value: formatNumber(totalMemberships),
        change: 0, // Would need historical data for comparison
        description: 'All tracked membership records',
        calculation: 'Count of all membership records',
        icon: 'Users',
        rawValue: totalMemberships
      },
      {
        title: 'Active Members',
        value: formatNumber(activeCount),
        change: 0,
        description: `${formatPercentage(activeRate)} of total memberships`,
        calculation: 'Count of active status',
        icon: 'CheckCircle',
        rawValue: activeCount
      },
      {
        title: 'Churned Members',
        value: formatNumber(churnedCount),
        change: 0,
        description: `${formatPercentage(churnRate)} churn rate`,
        calculation: 'Count of churned status',
        icon: 'AlertTriangle',
        rawValue: churnedCount
      },
      {
        title: 'Frozen Members',
        value: formatNumber(frozenCount),
        change: 0,
        description: `${formatPercentage(frozenRate)} of total memberships`,
        calculation: 'Count of frozen status',
        icon: 'Clock',
        rawValue: frozenCount
      }
    ];
  };

  const resetFilters = () => {
    const previousMonth = getPreviousMonthDateRange();
    setFilters({
      dateRange: previousMonth,
      location: [],
      status: [],
      membershipType: [],
      soldBy: []
    });
  };

  const metrics = calculateMetrics(filteredData);

  const handleRowClick = (data: any, type: 'expiration' | 'member' | 'status' = 'expiration') => {
    setDrillDownData(data);
    setDrillDownType(type);
  };

  const getTopBottomData = (data: ExpirationData[]) => {
    // Top membership types by count
    const membershipCounts = data.reduce((acc, item) => {
      const key = item.membershipName || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topMemberships = Object.entries(membershipCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Status distribution
    const statusCounts = data.reduce((acc, item) => {
      const key = item.status || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topStatuses = Object.entries(statusCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { topMemberships, topStatuses };
  };

  const { topMemberships, topStatuses } = getTopBottomData(filteredData);

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 rounded-lg">
      {/* Header Section with Location Tabs */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-slate-200/50 rounded-t-lg">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Expirations & Churn Analytics
            </h1>
            <div className="flex gap-2">
              <AdvancedExportButton 
                additionalData={{ expirations: filteredData }}
                defaultFileName="expirations-analysis"
              />
              <NoteTaker />
            </div>
          </div>

          {/* Location Tabs */}
          <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {locations.map(location => (
                <TabsTrigger 
                  key={location.id} 
                  value={location.id}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  {location.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          {locations.map(location => (
            <TabsContent key={location.id} value={location.id} className="mt-0">
              <div className="space-y-8">
                {/* Filters */}
                <AutoCloseFilterSection
                  filters={filters as any}
                  onFiltersChange={(newFilters: any) => setFilters(newFilters as ExpirationFilterOptions)}
                  onReset={resetFilters}
                />

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metrics.map((metric, index) => (
                     <MetricCard
                       key={index}
                       data={metric}
                       onClick={() => handleRowClick(filteredData.filter(item => {
                         if (metric.title === 'Active Members') return item.status === 'Active';
                         if (metric.title === 'Churned Members') return item.status === 'Churned';
                         if (metric.title === 'Frozen Members') return item.status === 'Frozen';
                         return true;
                       }), 'expiration')}
                     />
                  ))}
                </div>

                {/* Charts Grid */}
                <ExpirationChartsGrid data={filteredData} />

                {/* Top/Bottom Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
                        Top Membership Types
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {topMemberships.slice(0, 5).map((membership, index) => (
                          <div key={membership.name} className="flex justify-between items-center p-2 hover:bg-slate-50/50 rounded cursor-pointer"
                               onClick={() => handleRowClick(filteredData.filter(item => item.membershipName === membership.name), 'expiration')}>
                            <span className="text-sm text-slate-700">{membership.name}</span>
                            <span className="text-sm font-medium text-slate-900">{membership.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
                        Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {topStatuses.map((status, index) => (
                          <div key={status.name} className="flex justify-between items-center p-2 hover:bg-slate-50/50 rounded cursor-pointer"
                               onClick={() => handleRowClick(filteredData.filter(item => item.status === status.name), 'status')}>
                            <span className="text-sm text-slate-700">{status.name}</span>
                            <span className="text-sm font-medium text-slate-900">{status.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Analytics */}
                <ExpirationAdditionalAnalytics data={filteredData} />

                {/* Data Tables */}
                <ExpirationDataTables 
                  data={filteredData} 
                  onRowClick={(item) => handleRowClick([item], 'member')} 
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {drillDownData && (
        <ModernDrillDownModal 
          isOpen={!!drillDownData} 
          onClose={() => setDrillDownData(null)} 
          data={drillDownData} 
          type="member"
        />
      )}
    </div>
  );
};

export default ExpirationAnalyticsSection;