import React, { useMemo, useState } from 'react';
import { SalesData, YearOnYearMetricType } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Users, TrendingUp, TrendingDown, Edit3, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { generateDynamicMonths, parseDate } from '@/utils/dateUtils';

interface SoldByMonthOnMonthTableProps {
  data: SalesData[];
  onRowClick: (row: any) => void;
  selectedMetric?: YearOnYearMetricType;
}

export const SoldByMonthOnMonthTable: React.FC<SoldByMonthOnMonthTableProps> = ({
  data,
  onRowClick,
  selectedMetric: initialMetric = 'revenue'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<YearOnYearMetricType>(initialMetric);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('• Sales team performance analysis by individual seller\n• Consistent performers identified for recognition\n• Training opportunities highlighted for underperformers');

  const monthlyData = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get current date for dynamic month calculation
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Generate last 18 months of data including current month
    for (let i = 17; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = monthNames[date.getMonth()];
      months.push({
        key: `${year}-${String(month).padStart(2, '0')}`,
        display: `${monthName} ${year}`,
        year: year,
        month: month,
        quarter: Math.ceil(month / 3)
      });
    }
    
    return months;
  }, []);

  const getMetricValue = (items: SalesData[], metric: YearOnYearMetricType) => {
    if (!items.length) return 0;
    const totalRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalTransactions = items.length;
    const uniqueMembers = new Set(items.map(item => item.memberId)).size;
    const totalUnits = items.length; // Each sale item is a unit

    switch (metric) {
      case 'revenue':
        return totalRevenue;
      case 'transactions':
        return totalTransactions;
      case 'members':
        return uniqueMembers;
      case 'units':
        return totalUnits;
      case 'atv':
        return totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      case 'auv':
        return totalUnits > 0 ? totalRevenue / totalUnits : 0;
      case 'asv':
        return uniqueMembers > 0 ? totalRevenue / uniqueMembers : 0;
      case 'upt':
        return totalTransactions > 0 ? totalUnits / totalTransactions : 0;
      case 'vat':
        return items.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
      default:
        return 0;
    }
  };

  const formatMetricValue = (value: number, metric: YearOnYearMetricType) => {
    switch (metric) {
      case 'revenue':
      case 'vat':
        return formatCurrency(value);
      case 'atv':
      case 'auv':
      case 'asv':
        return formatCurrency(Math.round(value));
      // No decimals
      case 'transactions':
      case 'members':
      case 'units':
        return formatNumber(value);
      case 'upt':
        return value.toFixed(1);
      // 1 decimal
      default:
        return formatNumber(value);
    }
  };

  const processedData = useMemo(() => {
    console.log('Processing sold by data:', data.length, 'records');
    const soldByGroups = data.reduce((acc: Record<string, SalesData[]>, item) => {
      const soldBy = item.soldBy || 'Unknown';
      if (!acc[soldBy]) {
        acc[soldBy] = [];
      }
      acc[soldBy].push(item);
      return acc;
    }, {});
    console.log('Sold by groups:', Object.keys(soldByGroups).length);
    const soldByData = Object.entries(soldByGroups).map(([soldBy, items]) => {
      const monthlyValues: Record<string, number> = {};
      monthlyData.forEach(({
        key,
        year,
        month
      }) => {
        const monthItems = items.filter(item => {
          const itemDate = parseDate(item.paymentDate);
          if (!itemDate) return false;
          return itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
        });
        monthlyValues[key] = getMetricValue(monthItems, selectedMetric);
      });
      const metricValue = getMetricValue(items, selectedMetric);
      const totalRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
      const totalTransactions = items.length;
      const uniqueMembers = new Set(items.map(item => item.memberId)).size;
      const units = items.length;
      const asv = uniqueMembers > 0 ? totalRevenue / uniqueMembers : 0;
      const upt = totalTransactions > 0 ? units / totalTransactions : 0;
      const atv = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      const auv = units > 0 ? totalRevenue / units : 0;
      return {
        soldBy,
        metricValue,
        totalRevenue,
        totalTransactions,
        uniqueMembers,
        units,
        asv,
        upt,
        atv,
        auv,
        monthlyValues,
        rawData: items,
        // Add comprehensive data for drill-down
        name: soldBy,
        grossRevenue: totalRevenue,
        netRevenue: totalRevenue,
        totalValue: totalRevenue,
        totalCurrent: totalRevenue,
        totalCustomers: uniqueMembers,
        totalChange: monthlyData.length >= 2 ? ((monthlyValues[monthlyData[monthlyData.length - 1].key] || 0) - (monthlyValues[monthlyData[monthlyData.length - 2].key] || 0)) / (monthlyValues[monthlyData[monthlyData.length - 2].key] || 1) * 100 : 0,
        months: monthlyData.reduce((acc, {
          key,
          display
        }) => {
          acc[display] = {
            current: monthlyValues[key] || 0,
            change: 0 // Could calculate month-over-month change here
          };
          return acc;
        }, {} as Record<string, any>)
      };
    });
    console.log('Processed sold by data:', soldByData.length, 'sellers');
    console.log('Sample seller data:', soldByData[0]);
    return soldByData.sort((a, b) => b.metricValue - a.metricValue);
  }, [data, selectedMetric, monthlyData]);

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return <TrendingUp className="w-3 h-3 text-green-500 inline ml-1" />;
    const growth = (current - previous) / previous * 100;
    if (growth > 5) {
      return <TrendingUp className="w-3 h-3 text-green-500 inline ml-1" />;
    } else if (growth < -5) {
      return <TrendingDown className="w-3 h-3 text-red-500 inline ml-1" />;
    }
    return null;
  };

  const getSoldByBadge = (soldBy: string) => {
    return <Badge className="text-blue-900 text-xs min-w-40 h-6 flex items-center justify-center bg-indigo-50">
        {soldBy}
      </Badge>;
  };

  const totalsRow = useMemo(() => {
    const monthlyTotals: Record<string, number> = {};
    monthlyData.forEach(({
      key
    }) => {
      monthlyTotals[key] = processedData.reduce((sum, item) => sum + (item.monthlyValues[key] || 0), 0);
    });
    const totalRevenue = processedData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalTransactions = processedData.reduce((sum, item) => sum + item.totalTransactions, 0);
    const totalMembers = new Set(data.map(item => item.memberId)).size;
    const totalUnits = processedData.reduce((sum, item) => sum + item.units, 0);
    const avgAsv = totalMembers > 0 ? totalRevenue / totalMembers : 0;
    const avgUpt = totalTransactions > 0 ? totalUnits / totalTransactions : 0;
    const avgAtv = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const avgAuv = totalUnits > 0 ? totalRevenue / totalUnits : 0;
    return {
      soldBy: 'TOTAL',
      metricValue: getMetricValue(data, selectedMetric),
      totalRevenue,
      totalTransactions,
      asv: avgAsv,
      upt: avgUpt,
      atv: avgAtv,
      auv: avgAuv,
      monthlyValues: monthlyTotals
    };
  }, [processedData, monthlyData, data, selectedMetric]);

  const saveSummary = () => {
    setIsEditingSummary(false);
    localStorage.setItem('soldByMonthOnMonthSummary', summaryText);
  };

  const cancelEdit = () => {
    setIsEditingSummary(false);
    const saved = localStorage.getItem('soldByMonthOnMonthSummary');
    if (saved) setSummaryText(saved);
  };

  return <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Sales Associate Month-on-Month Analysis
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Monthly performance metrics by sales associate ({data.length} total records)
              </p>
            </div>
          </div>
          
          <YearOnYearMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full bg-white border-t border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold text-sm uppercase tracking-wider sticky top-0 z-20">
              <tr>
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-left rounded-tl-lg sticky left-0 bg-blue-800 z-30">Sales Associate</th>
                {monthlyData.map(({
                key,
                display
              }) => <th key={key} className="text-white font-semibold text-xs uppercase tracking-wider px-3 py-2 bg-blue-800 border-l border-blue-600 min-w-32">
                    <div className="flex flex-col">
                      <span className="text-sm">{display.split(' ')[0]}</span>
                      <span className="text-blue-200 text-xs">{display.split(' ')[1]}</span>
                    </div>
                  </th>)}
              </tr>
            </thead>
            <tbody>
              {processedData.map((item, index) => <tr key={item.soldBy} className="hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors duration-200" onClick={() => onRowClick(item)}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 min-w-60">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">#{index + 1}</span>
                      {getSoldByBadge(item.soldBy)}
                    </div>
                  </td>
                  {monthlyData.map(({
                key
              }, monthIndex) => {
                const current = item.monthlyValues[key] || 0;
                const previous = monthIndex > 0 ? item.monthlyValues[monthlyData[monthIndex - 1].key] || 0 : 0;
                return <td key={key} className="px-3 py-3 text-center text-sm text-gray-900 font-mono border-l border-gray-100">
                        <div className="flex items-center justify-center">
                          {formatMetricValue(current, selectedMetric)}
                          {getGrowthIndicator(current, previous)}
                        </div>
                      </td>;
              })}
                </tr>)}
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200 font-bold">
                <td className="px-6 py-3 text-sm font-bold text-blue-900 sticky left-0 bg-blue-100 border-r border-blue-200">
                  TOTAL
                </td>
                {monthlyData.map(({
                key
              }) => <td key={key} className="px-3 py-3 text-center text-sm text-blue-900 font-mono font-bold border-l border-blue-200">
                    {formatMetricValue(totalsRow.monthlyValues[key] || 0, selectedMetric)}
                  </td>)}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary/Insights Section */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-slate-50 to-white rounded-b-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Sales Associate Insights
            </h4>
            {!isEditingSummary ? <Button variant="outline" size="sm" onClick={() => setIsEditingSummary(true)} className="gap-2">
                <Edit3 className="w-4 h-4" />
                Edit
              </Button> : <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveSummary} className="gap-2 text-green-600">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={cancelEdit} className="gap-2 text-red-600">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>}
          </div>
          
          {isEditingSummary ? <Textarea value={summaryText} onChange={e => setSummaryText(e.target.value)} placeholder="Enter sales associate insights using bullet points (• )" className="min-h-32 text-sm" /> : <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {summaryText}
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
};
