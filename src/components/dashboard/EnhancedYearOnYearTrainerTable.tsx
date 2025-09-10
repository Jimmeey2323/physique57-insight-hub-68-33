import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Users,
  Activity,
  DollarSign,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { ProcessedTrainerData } from './TrainerDataProcessor';
import { cn } from '@/lib/utils';

interface YearOnYearTrainerTableProps {
  data: ProcessedTrainerData[];
  onExport?: () => void;
}

export const EnhancedYearOnYearTrainerTable: React.FC<YearOnYearTrainerTableProps> = ({
  data,
  onExport
}) => {
  const yearOnYearData = useMemo(() => {
    const yearlyData = data.reduce((acc, record) => {
      const [monthName, year] = (record.monthYear || '').split(' ');
      const yearNum = parseInt(year);
      
      if (!isNaN(yearNum) && monthName) {
        if (!acc[record.trainerName]) {
          acc[record.trainerName] = {};
        }
        if (!acc[record.trainerName][monthName]) {
          acc[record.trainerName][monthName] = {};
        }
        
        acc[record.trainerName][monthName][yearNum] = {
          totalSessions: record.totalSessions,
          totalCustomers: record.totalCustomers,
          totalRevenue: record.totalPaid,
          conversionRate: record.conversionRate,
          retentionRate: record.retentionRate,
          classAverage: record.classAverageExclEmpty
        };
      }
      
      return acc;
    }, {} as any);

    // Calculate year-on-year growth
    return Object.entries(yearlyData).map(([trainerName, months]: [string, any]) => {
      const monthlyGrowth = Object.entries(months).map(([month, years]: [string, any]) => {
        const yearKeys = Object.keys(years).map(y => parseInt(y)).sort((a, b) => b - a);
        
        if (yearKeys.length >= 2) {
          const currentYear = years[yearKeys[0]];
          const previousYear = years[yearKeys[1]];
          
          const sessionGrowth = previousYear.totalSessions > 0 
            ? ((currentYear.totalSessions - previousYear.totalSessions) / previousYear.totalSessions) * 100 
            : 0;
          const customerGrowth = previousYear.totalCustomers > 0 
            ? ((currentYear.totalCustomers - previousYear.totalCustomers) / previousYear.totalCustomers) * 100 
            : 0;
          const revenueGrowth = previousYear.totalRevenue > 0 
            ? ((currentYear.totalRevenue - previousYear.totalRevenue) / previousYear.totalRevenue) * 100 
            : 0;
            
          return {
            month,
            currentYear: yearKeys[0],
            previousYear: yearKeys[1],
            currentData: currentYear,
            previousData: previousYear,
            sessionGrowth,
            customerGrowth,
            revenueGrowth
          };
        }
        return null;
      }).filter(Boolean);

      return {
        trainerName,
        monthlyGrowth: monthlyGrowth.filter(g => g !== null)
      };
    }).filter(trainer => trainer.monthlyGrowth.length > 0);
  }, [data]);

  const getGrowthColor = (growth: number) => {
    if (growth > 10) return 'text-emerald-600 bg-emerald-50';
    if (growth > 0) return 'text-green-600 bg-green-50';
    if (growth === 0) return 'text-gray-600 bg-gray-50';
    if (growth > -10) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  if (yearOnYearData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No year-on-year comparison data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {yearOnYearData.map((trainer) => (
        <Card 
          key={trainer.trainerName} 
          className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Users className="w-5 h-5" />
                {trainer.trainerName} - Year-on-Year Performance
              </CardTitle>
              <Button
                onClick={onExport}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid gap-4">
              {trainer.monthlyGrowth.map((monthData, index) => (
                <div key={`${monthData.month}-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 border-b">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {monthData.month} ({monthData.previousYear} vs {monthData.currentYear})
                    </h4>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Sessions Growth */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Sessions</span>
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{monthData.previousYear}:</span>
                            <span className="font-medium">{formatNumber(monthData.previousData.totalSessions)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{monthData.currentYear}:</span>
                            <span className="font-medium">{formatNumber(monthData.currentData.totalSessions)}</span>
                          </div>
                          <div className={cn(
                            "flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            getGrowthColor(monthData.sessionGrowth)
                          )}>
                            {React.createElement(getGrowthIcon(monthData.sessionGrowth), { className: "w-3 h-3" })}
                            {formatPercentage(Math.abs(monthData.sessionGrowth))}
                          </div>
                        </div>
                      </div>

                      {/* Customers Growth */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Customers</span>
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{monthData.previousYear}:</span>
                            <span className="font-medium">{formatNumber(monthData.previousData.totalCustomers)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{monthData.currentYear}:</span>
                            <span className="font-medium">{formatNumber(monthData.currentData.totalCustomers)}</span>
                          </div>
                          <div className={cn(
                            "flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            getGrowthColor(monthData.customerGrowth)
                          )}>
                            {React.createElement(getGrowthIcon(monthData.customerGrowth), { className: "w-3 h-3" })}
                            {formatPercentage(Math.abs(monthData.customerGrowth))}
                          </div>
                        </div>
                      </div>

                      {/* Revenue Growth */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Revenue</span>
                          <DollarSign className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{monthData.previousYear}:</span>
                            <span className="font-medium">{formatCurrency(monthData.previousData.totalRevenue)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{monthData.currentYear}:</span>
                            <span className="font-medium">{formatCurrency(monthData.currentData.totalRevenue)}</span>
                          </div>
                          <div className={cn(
                            "flex items-center justify-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            getGrowthColor(monthData.revenueGrowth)
                          )}>
                            {React.createElement(getGrowthIcon(monthData.revenueGrowth), { className: "w-3 h-3" })}
                            {formatPercentage(Math.abs(monthData.revenueGrowth))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Metrics Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Conversion Rate</div>
                        <div className="font-medium text-sm">{monthData.currentData.conversionRate.toFixed(1)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Retention Rate</div>
                        <div className="font-medium text-sm">{monthData.currentData.retentionRate.toFixed(1)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Class Average</div>
                        <div className="font-medium text-sm">{monthData.currentData.classAverage.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Revenue/Session</div>
                        <div className="font-medium text-sm">
                          {formatCurrency(monthData.currentData.totalSessions > 0 
                            ? monthData.currentData.totalRevenue / monthData.currentData.totalSessions 
                            : 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};