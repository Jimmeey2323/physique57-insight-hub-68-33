import React, { useMemo, useState } from 'react';
import { SalesData, YearOnYearMetricType } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { FolderOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface CategoryPerformanceTableProps {
  data: SalesData[];
  onRowClick: (row: any) => void;
  selectedMetric?: YearOnYearMetricType;
}
export const CategoryPerformanceTable: React.FC<CategoryPerformanceTableProps> = ({
  data,
  onRowClick,
  selectedMetric: initialMetric = 'revenue'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<YearOnYearMetricType>(initialMetric);
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
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    // Handle DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Handle other common date formats
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };
  const getMetricValue = (items: SalesData[], metric: YearOnYearMetricType) => {
    if (!items.length) return 0;
    switch (metric) {
      case 'revenue':
        return items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
      case 'transactions':
        return items.length;
      case 'members':
        return new Set(items.map(item => item.memberId)).size;
      case 'units':
        return items.length;
      case 'atv':
        const totalRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        return items.length > 0 ? totalRevenue / items.length : 0;
      case 'auv':
        const revenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        const units = items.length;
        return units > 0 ? revenue / units : 0;
      case 'asv':
        const totalRev = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        const uniqueMembers = new Set(items.map(item => item.memberId)).size;
        return uniqueMembers > 0 ? totalRev / uniqueMembers : 0;
      case 'upt':
        const totalTransactions = items.length;
        const totalUnits = items.length;
        return totalTransactions > 0 ? totalUnits / totalTransactions : 0;
      case 'vat':
        return items.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
      case 'netRevenue':
        return items.reduce((sum, item) => sum + ((item.paymentValue || 0) - (item.paymentVAT || 0)), 0);
      default:
        return 0;
    }
  };
  const formatMetricValue = (value: number, metric: YearOnYearMetricType) => {
    switch (metric) {
      case 'revenue':
      case 'vat':
      case 'netRevenue':
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
    console.log('Processing category data:', data.length, 'records');
    const categoryGroups = data.reduce((acc: Record<string, SalesData[]>, item) => {
      const category = item.cleanedCategory || 'Unknown';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
    console.log('Category groups:', Object.keys(categoryGroups));
    const categoryData = Object.entries(categoryGroups).map(([category, items]) => {
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
      return {
        category,
        metricValue,
        monthlyValues,
        rawData: items,
        // Add comprehensive data for drill-down
        name: category,
        grossRevenue: totalRevenue,
        netRevenue: totalRevenue,
        totalValue: totalRevenue,
        totalCurrent: totalRevenue,
        totalTransactions,
        totalCustomers: uniqueMembers,
        uniqueMembers,
        transactions: totalTransactions,
        months: monthlyData.reduce((acc, {
          key,
          display
        }) => {
          acc[display] = {
            current: monthlyValues[key] || 0,
            change: 0
          };
          return acc;
        }, {} as Record<string, any>)
      };
    });
    console.log('Processed category data:', categoryData.length, 'categories');
    console.log('Sample category data:', categoryData[0]);
    return categoryData.sort((a, b) => b.metricValue - a.metricValue);
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

  // Calculate totals row
  const totalsRow = useMemo(() => {
    const monthlyTotals: Record<string, number> = {};
    monthlyData.forEach(({
      key
    }) => {
      monthlyTotals[key] = processedData.reduce((sum, item) => sum + (item.monthlyValues[key] || 0), 0);
    });
    return {
      category: 'TOTAL',
      metricValue: getMetricValue(data, selectedMetric),
      monthlyValues: monthlyTotals
    };
  }, [processedData, monthlyData, data, selectedMetric]);
  return <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-orange-600" />
                Category Performance
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Monthly performance metrics by category ({data.length} total records)
              </p>
            </div>
          </div>
          
          <YearOnYearMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full bg-white border-t border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-orange-700 to-orange-900 text-white font-semibold text-sm uppercase tracking-wider sticky top-0 z-20">
              <tr className="bg-indigo-900">
                <th className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-left rounded-tl-lg sticky left-0 z-30 bg-violet-900">Category</th>
                {monthlyData.map(({
                key,
                display
              }) => <th key={key} className="text-white font-semibold text-xs uppercase tracking-wider px-3 py-2 border-l border-indigo-600 min-w-32 bg-violet-900">
                    <div className="flex flex-col">
                      <span className="text-sm">{display.split(' ')[0]}</span>
                      <span className="text-xs text-yellow-300">{display.split(' ')[1]}</span>
                    </div>
                  </th>)}
              </tr>
            </thead>
            <tbody>
              {processedData.map(item => <tr key={item.category} onClick={() => onRowClick(item)} className="cursor-pointer border-b border-gray-100 transition-colors duration-200 bg-slate-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 min-w-60">
                    <div className="flex items-center gap-4 min-w-60">
                      <span className="font-bold text-slate-700">{item.category}</span>
                    </div>
                  </td>
                  {monthlyData.map(({
                key,
                year,
                month,
                display
              }, monthIndex) => {
                const current = item.monthlyValues[key] || 0;
                const previous = monthIndex > 0 ? item.monthlyValues[monthlyData[monthIndex - 1].key] || 0 : 0;
                
                return <td 
                  key={key} 
                  className="px-3 py-3 text-center text-sm text-gray-900 font-mono border-l border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    
                    // Filter data for this specific month and category
                    const monthSpecificData = (item.rawData || []).filter((transaction: any) => {
                      const itemDate = parseDate(transaction.paymentDate);
                      if (!itemDate) return false;
                      return itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
                    });
                    
                    const monthRevenue = monthSpecificData.reduce((sum: any, transaction: any) => sum + (transaction.paymentValue || 0), 0);
                    const monthTransactions = monthSpecificData.length;
                    const monthCustomers = new Set(monthSpecificData.map((transaction: any) => transaction.memberId || transaction.customerEmail)).size;
                    
                    const enhancedCellData = {
                      ...item,
                      name: `${item.category} - ${display}`,
                      totalRevenue: monthRevenue,
                      grossRevenue: monthRevenue,
                      netRevenue: monthRevenue,
                      totalValue: monthRevenue,
                      totalCurrent: monthRevenue,
                      metricValue: monthRevenue,
                      transactions: monthTransactions,
                      totalTransactions: monthTransactions,
                      uniqueMembers: monthCustomers,
                      totalCustomers: monthCustomers,
                      rawData: monthSpecificData,
                      filteredTransactionData: monthSpecificData,
                      isDynamic: true,
                      calculatedFromFiltered: true,
                      cellSpecific: true,
                      month: display,
                      monthKey: key
                    };
                    
                    console.log(`Cell click: ${item.category} - ${display}: ${monthTransactions} transactions, ${monthRevenue} revenue`);
                    onRowClick(enhancedCellData);
                  }}
                >
                        <div className="flex items-center justify-center">
                          {formatMetricValue(current, selectedMetric)}
                          {getGrowthIndicator(current, previous)}
                        </div>
                      </td>;
              })}
                </tr>)}
              <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-t-4 border-indigo-800 font-bold">
                <td 
                  className="px-6 py-3 text-sm font-bold text-indigo-900 sticky left-0 border-r border-indigo-200 bg-slate-50 hover:bg-blue-100 cursor-pointer transition-colors"
                  onClick={() => {
                    // Total row click - show all data
                    const totalRevenue = data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
                    const totalTransactions = data.length;
                    const totalCustomers = new Set(data.map(item => item.memberId || item.customerEmail)).size;
                    
                    const totalRowData = {
                      name: 'All Categories - Total',
                      totalRevenue,
                      grossRevenue: totalRevenue,
                      netRevenue: totalRevenue,
                      totalValue: totalRevenue,
                      totalCurrent: totalRevenue,
                      metricValue: totalRevenue,
                      transactions: totalTransactions,
                      totalTransactions,
                      uniqueMembers: totalCustomers,
                      totalCustomers,
                      rawData: data,
                      filteredTransactionData: data,
                      isDynamic: true,
                      calculatedFromFiltered: true,
                      isTotal: true
                    };
                    
                    console.log(`Total row click: All categories - ${totalTransactions} transactions, ${totalRevenue} revenue`);
                    onRowClick(totalRowData);
                  }}
                >
                  TOTAL
                </td>
                {monthlyData.map(({
                key,
                year,
                month,
                display
              }) => <td 
                key={key} 
                className="px-3 py-3 text-center text-sm text-indigo-900 font-mono font-bold border-l border-indigo-200 hover:bg-blue-100 cursor-pointer transition-colors"
                onClick={() => {
                  // Total cell click for specific month
                  const monthSpecificData = data.filter(item => {
                    const itemDate = parseDate(item.paymentDate);
                    if (!itemDate) return false;
                    return itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
                  });
                  
                  const monthRevenue = monthSpecificData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
                  const monthTransactions = monthSpecificData.length;
                  const monthCustomers = new Set(monthSpecificData.map(item => item.memberId || item.customerEmail)).size;
                  
                  const totalCellData = {
                    name: `All Categories - ${display}`,
                    totalRevenue: monthRevenue,
                    grossRevenue: monthRevenue,
                    netRevenue: monthRevenue,
                    totalValue: monthRevenue,
                    totalCurrent: monthRevenue,
                    metricValue: monthRevenue,
                    transactions: monthTransactions,
                    totalTransactions: monthTransactions,
                    uniqueMembers: monthCustomers,
                    totalCustomers: monthCustomers,
                    rawData: monthSpecificData,
                    filteredTransactionData: monthSpecificData,
                    isDynamic: true,
                    calculatedFromFiltered: true,
                    isTotal: true,
                    cellSpecific: true,
                    month: display,
                    monthKey: key
                  };
                  
                  console.log(`Total cell click: All categories - ${display}: ${monthTransactions} transactions, ${monthRevenue} revenue`);
                  onRowClick(totalCellData);
                }}
              >
                    {formatMetricValue(totalsRow.monthlyValues[key] || 0, selectedMetric)}
                  </td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>;
};