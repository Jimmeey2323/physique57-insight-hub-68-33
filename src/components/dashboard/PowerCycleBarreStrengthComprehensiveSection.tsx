import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PowerCycleBarreStrengthEnhancedFilterSection } from './PowerCycleBarreStrengthEnhancedFilterSection';
import { PowerCycleBarreStrengthComprehensiveMetrics } from './PowerCycleBarreStrengthComprehensiveMetrics';
import { PowerCycleBarreStrengthComprehensiveComparison } from './PowerCycleBarreStrengthComprehensiveComparison';
import { PowerCycleBarreStrengthComprehensiveRankings } from './PowerCycleBarreStrengthComprehensiveRankings';
import { PowerCycleBarreStrengthDetailedAnalytics } from './PowerCycleBarreStrengthDetailedAnalytics';
import { PowerCycleBarreStrengthComprehensiveCharts } from './PowerCycleBarreStrengthComprehensiveCharts';
import { PowerCycleBarreStrengthInsightsSection } from './PowerCycleBarreStrengthInsightsSection';
import { PowerCycleBarreStrengthDrillDownModal } from './PowerCycleBarreStrengthDrillDownModal';
import { PayrollData } from '@/types/dashboard';
import { 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Users, 
  Eye, 
  Zap, 
  Dumbbell,
  Target
} from 'lucide-react';

interface PowerCycleBarreStrengthComprehensiveSectionProps {
  data: PayrollData[];
}

export const PowerCycleBarreStrengthComprehensiveSection: React.FC<PowerCycleBarreStrengthComprehensiveSectionProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [drillDownData, setDrillDownData] = useState<any>(null);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = [...data];
    
    // Apply location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }
    
    // Apply trainer filter
    if (selectedTrainer !== 'all') {
      filtered = filtered.filter(item => item.teacherName === selectedTrainer);
    }
    
    // Apply timeframe filter
    if (selectedTimeframe !== 'all') {
      if (selectedTimeframe === 'custom' && (dateRange.start || dateRange.end)) {
        filtered = filtered.filter(item => {
          if (!item.monthYear) return false;
          
          const [monthName, year] = item.monthYear.split(' ');
          const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
          const itemDate = new Date(parseInt(year), monthIndex, 1);
          
          let isInRange = true;
          
          if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            startDate.setDate(1);
            isInRange = isInRange && itemDate >= startDate;
          }
          
          if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setMonth(endDate.getMonth() + 1, 0);
            isInRange = isInRange && itemDate <= endDate;
          }
          
          return isInRange;
        });
      } else if (selectedTimeframe !== 'custom') {
        const now = new Date();
        let startDate = new Date();
        
        switch (selectedTimeframe) {
          case '3m':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case '6m':
            startDate.setMonth(now.getMonth() - 6);
            break;
          case '1y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            break;
        }
        
        if (selectedTimeframe !== 'all') {
          filtered = filtered.filter(item => {
            if (!item.monthYear) return false;
            const [monthName, year] = item.monthYear.split(' ');
            const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
            const itemDate = new Date(parseInt(year), monthIndex, 1);
            return itemDate >= startDate && itemDate <= now;
          });
        }
      }
    }
    
    return filtered;
  }, [data, selectedLocation, selectedTimeframe, selectedTrainer, dateRange]);

  const handleItemClick = (item: any) => {
    setDrillDownData(item);
  };

  if (!data || data.length === 0) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <p className="text-yellow-600">No PowerCycle vs Barre vs Strength Lab data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Filter Section */}
      <PowerCycleBarreStrengthEnhancedFilterSection
        data={data}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedTrainer={selectedTrainer}
        onTrainerChange={setSelectedTrainer}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Comprehensive Metrics Overview */}
      <PowerCycleBarreStrengthComprehensiveMetrics 
        data={filteredData} 
        onItemClick={handleItemClick}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              PowerCycle vs Barre vs Strength Lab Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="dashboard" className="text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="comparison" className="text-sm font-medium">
                <Target className="w-4 h-4 mr-2" />
                Comparison
              </TabsTrigger>
              <TabsTrigger value="rankings" className="text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                Rankings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                Detailed Analytics
              </TabsTrigger>
              <TabsTrigger value="charts" className="text-sm font-medium">
                <Activity className="w-4 h-4 mr-2" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-sm font-medium">
                <Eye className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="dashboard" className="space-y-8">
          <PowerCycleBarreStrengthComprehensiveComparison 
            data={filteredData} 
            onItemClick={handleItemClick}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-8">
          <PowerCycleBarreStrengthComprehensiveComparison 
            data={filteredData} 
            onItemClick={handleItemClick}
            showDetailed={true}
          />
        </TabsContent>

        <TabsContent value="rankings" className="space-y-8">
          <PowerCycleBarreStrengthComprehensiveRankings 
            data={filteredData} 
            onItemClick={handleItemClick}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8">
          <PowerCycleBarreStrengthDetailedAnalytics 
            data={filteredData} 
            onItemClick={handleItemClick}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-8">
          <PowerCycleBarreStrengthComprehensiveCharts 
            data={filteredData} 
            onItemClick={handleItemClick}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-8">
          <PowerCycleBarreStrengthInsightsSection 
            data={filteredData} 
            onItemClick={handleItemClick}
          />
        </TabsContent>
      </Tabs>

      {/* Drill Down Modal */}
      {drillDownData && (
        <PowerCycleBarreStrengthDrillDownModal
          isOpen={!!drillDownData}
          onClose={() => setDrillDownData(null)}
          data={drillDownData}
          allData={filteredData}
        />
      )}
    </div>
  );
};

