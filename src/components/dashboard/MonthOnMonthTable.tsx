import React, { useMemo, useState, useCallback } from 'react';
import { SalesData, FilterOptions, YearOnYearMetricType } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Calendar, TrendingUp, TrendingDown, ChevronDown, ChevronRight, Edit3, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
interface MonthOnMonthTableProps {
  data: SalesData[];
  filters?: FilterOptions;
  onRowClick: (row: any) => void;
  collapsedGroups: Set<string>;
  onGroupToggle: (groupKey: string) => void;
  selectedMetric?: YearOnYearMetricType;
}
export const MonthOnMonthTable: React.FC<MonthOnMonthTableProps> = ({
  data,
  filters = {
    dateRange: {
      start: '',
      end: ''
    },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  },
  onRowClick,
  collapsedGroups,
  onGroupToggle,
  selectedMetric: initialMetric = 'revenue'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<YearOnYearMetricType>(initialMetric);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('• Month-on-month analysis shows seasonal patterns\n• Strong performance in peak months with growth opportunities identified\n• Consistent upward trend in key metrics');
  // All groups expanded by default
  const [localCollapsedGroups, setLocalCollapsedGroups] = useState<Set<string>>(new Set());

  // Ensure all groups are expanded on mount
  React.useEffect(() => {
    setLocalCollapsedGroups(new Set());
  }, []);
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };
  const getMetricValue = (items: SalesData[], metric: YearOnYearMetricType) => {
    if (!items.length) return 0;
    const totalRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalTransactions = items.length;
    const uniqueMembers = new Set(items.map(item => item.memberId)).size;
    const totalUnits = items.length;
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
      case 'auv':
      case 'atv':
      case 'asv':
      case 'vat':
        return formatCurrency(value);
      case 'transactions':
      case 'members':
      case 'units':
        return formatNumber(value);
      case 'upt':
        return value.toFixed(2);
      default:
        return formatNumber(value);
    }
  };
  const handleQuickFilter = useCallback((filterType: string, value: string) => {
    console.log('Quick filter applied:', filterType, value);
  }, []);

  // Generate monthly data dynamically from current date backwards
  const monthlyData = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Generate months from current month backwards to 18 months ago
    for (let i = 0; i < 18; i++) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthName = monthNames[month];
      const monthNum = month + 1;
      months.push({
        key: `${year}-${String(monthNum).padStart(2, '0')}`,
        display: `${monthName} ${year}`,
        year: year,
        month: monthNum,
        quarter: Math.ceil(monthNum / 3)
      });
    }
    return months;
  }, []);
  const processedData = useMemo(() => {
    const categoryGroups = data.reduce((acc: Record<string, SalesData[]>, item) => {
      const category = item.cleanedCategory || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
    const categoryData = Object.entries(categoryGroups).map(([category, categoryItems]) => {
      const productGroups = categoryItems.reduce((acc: Record<string, SalesData[]>, item) => {
        const product = item.cleanedProduct || 'Unspecified';
        if (!acc[product]) {
          acc[product] = [];
        }
        acc[product].push(item);
        return acc;
      }, {});
      const products = Object.entries(productGroups).map(([product, items]) => {
        const monthlyValues: Record<string, number> = {};
        monthlyData.forEach(({
          key,
          year,
          month
        }) => {
          const monthItems = items.filter(item => {
            const itemDate = parseDate(item.paymentDate);
            return itemDate && itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
          });
          monthlyValues[key] = getMetricValue(monthItems, selectedMetric);
        });
        const metricValue = getMetricValue(items, selectedMetric);
        return {
          product,
          category,
          metricValue,
          monthlyValues,
          rawData: items
        };
      });
      const categoryMonthlyValues: Record<string, number> = {};
      monthlyData.forEach(({
        key
      }) => {
        categoryMonthlyValues[key] = products.reduce((sum, product) => sum + (product.monthlyValues[key] || 0), 0);
      });
      return {
        category,
        products: products.sort((a, b) => b.metricValue - a.metricValue),
        metricValue: getMetricValue(categoryItems, selectedMetric),
        monthlyValues: categoryMonthlyValues,
        rawData: categoryItems
      };
    });
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
  const totalsRow = useMemo(() => {
    const monthlyTotals: Record<string, number> = {};
    monthlyData.forEach(({
      key
    }) => {
      monthlyTotals[key] = processedData.reduce((sum, category) => sum + (category.monthlyValues[key] || 0), 0);
    });
    return {
      category: 'TOTAL',
      metricValue: getMetricValue(data, selectedMetric),
      monthlyValues: monthlyTotals
    };
  }, [processedData, monthlyData, data, selectedMetric]);
  const saveSummary = () => {
    setIsEditingSummary(false);
    localStorage.setItem('monthOnMonthSummary', summaryText);
  };
  const cancelEdit = () => {
    setIsEditingSummary(false);
    const saved = localStorage.getItem('monthOnMonthSummary');
    if (saved) setSummaryText(saved);
  };
  const groupedMonths = useMemo(() => {
    const quarters: Record<string, typeof monthlyData> = {};
    monthlyData.forEach(month => {
      const quarterKey = `${month.year}-Q${month.quarter}`;
      if (!quarters[quarterKey]) quarters[quarterKey] = [];
      quarters[quarterKey].push(month);
    });
    return quarters;
  }, [monthlyData]);
  const toggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(localCollapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setLocalCollapsedGroups(newCollapsed);
  };
  const handleRowClickWithDrillDown = (productData: any) => {
    console.log('Product row clicked with data:', productData);
    console.log('Raw data length:', productData.rawData?.length);
    
    // Calculate dynamic metrics from the specific product's raw data
    const specificData = productData.rawData || [];
    const dynamicRevenue = specificData.reduce((sum: any, item: any) => sum + (item.paymentValue || 0), 0);
    const dynamicTransactions = specificData.length;
    const dynamicCustomers = new Set(specificData.map((item: any) => item.memberId || item.customerEmail)).size;
    
    // Enhanced drill-down data with comprehensive analytics
    const drillDownData = {
      ...productData,
      title: productData.product,
      name: productData.product,
      type: 'product',
      // Override static values with dynamic calculations
      totalRevenue: dynamicRevenue,
      grossRevenue: dynamicRevenue,
      netRevenue: dynamicRevenue,
      totalValue: dynamicRevenue,
      totalCurrent: dynamicRevenue,
      metricValue: dynamicRevenue,
      transactions: dynamicTransactions,
      totalTransactions: dynamicTransactions,
      uniqueMembers: dynamicCustomers,
      totalCustomers: dynamicCustomers,
      months: productData.monthlyValues,
      monthlyValues: productData.monthlyValues,
      rawData: specificData,
      filteredTransactionData: specificData,
      // Add dynamic flags
      isDynamic: true,
      calculatedFromFiltered: true
    };
    
    console.log(`Drill-down for ${productData.product}: ${dynamicTransactions} transactions, ${dynamicRevenue} revenue`);
    onRowClick(drillDownData);
  };
  return <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-0 shadow-2xl rounded-2xl">
  <CardHeader className="pb-4 bg-gradient-to-r from-blue-700 to-blue-900 rounded-t-2xl shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-bold flex items-center gap-2 text-white text-2xl">
                <Calendar className="w-5 h-5 text-blue-600 bg-yellow-300" />
                Product Month-on-Month Analysis
              </CardTitle>
              <p className="mt-1 font-semibold text-left text-sm text-amber-300">
                Monthly performance metrics by product (Last 18 months from current date)
              </p>
            </div>
          </div>
          
          <YearOnYearMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-b-2xl">
          <table className="min-w-full bg-white border-t border-blue-200 rounded-b-2xl shadow-md">
            <thead className="bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold text-sm uppercase tracking-wider sticky top-0 z-30">
              <tr className="bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold text-sm uppercase tracking-wider px-4 py-2 rounded-md">
                <th rowSpan={2} className="text-white font-semibold uppercase tracking-wider px-6 py-3 text-left rounded-tl-lg sticky left-0 bg-blue-800 z-30">
                  Category / Product
                </th>
                {Object.entries(groupedMonths).map(([quarterKey, months]) => <th key={quarterKey} colSpan={months.length} className="text-white font-semibold text-sm uppercase tracking-wider px-4 py-2 text-center border-l border-blue-600">
                    {quarterKey}
                  </th>)}
              </tr>
              <tr>
                {monthlyData.map(({
                key,
                display
              }) => <th key={key} className="text-white font-semibold text-xs uppercase tracking-wider px-3 py-2 bg-blue-800 border-l border-blue-600">
                    <div className="flex flex-col">
                      <span className="text-sm">{display.split(' ')[0]}</span>
                      <span className="text-blue-200 text-xs">{display.split(' ')[1]}</span>
                    </div>
                  </th>)}
              </tr>
            </thead>
            <tbody>
              {processedData.map((categoryData, categoryIndex) => <React.Fragment key={categoryData.category}>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300 font-bold">
                    <td 
                      className="text-sm font-bold text-gray-800 sticky left-0 bg-gradient-to-r from-gray-100 to-gray-200 border-r border-gray-300 z-20 hover:bg-blue-100 cursor-pointer transition-colors"
                      onClick={(e) => {
                        // Check if click is on toggle button
                        const target = e.target as HTMLElement;
                        if (target.closest('button')) {
                          // Let the toggle button handle the click
                          return;
                        }
                        
                        // Category row click - show all data for this category
                        const categoryData = data.filter(item => item.cleanedCategory === categoryData.category);
                        const categoryRevenue = categoryData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
                        const categoryTransactions = categoryData.length;
                        const categoryCustomers = new Set(categoryData.map(item => item.memberId || item.customerEmail)).size;
                        
                        const categoryRowData = {
                          name: `${categoryData.category} - All Months`,
                          category: categoryData.category,
                          totalRevenue: categoryRevenue,
                          grossRevenue: categoryRevenue,
                          netRevenue: categoryRevenue,
                          totalValue: categoryRevenue,
                          totalCurrent: categoryRevenue,
                          metricValue: categoryRevenue,
                          transactions: categoryTransactions,
                          totalTransactions: categoryTransactions,
                          uniqueMembers: categoryCustomers,
                          totalCustomers: categoryCustomers,
                          rawData: categoryData,
                          filteredTransactionData: categoryData,
                          isDynamic: true,
                          calculatedFromFiltered: true,
                          isGroup: true
                        };
                        
                        console.log(`Category group click: ${categoryData.category} - ${categoryTransactions} transactions, ${categoryRevenue} revenue`);
                        onRowClick(categoryRowData);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => toggleGroup(categoryData.category)} className="p-1 h-6 w-6 text-gray-600 hover:text-gray-800">
                          {localCollapsedGroups.has(categoryData.category) ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <span className="font-bold">#{categoryIndex + 1} {categoryData.category}</span>
                        <Badge variant="outline" className="text-xs bg-gray-900 rounded-md text-yellow-300">
                          {categoryData.products.length} products
                        </Badge>
                      </div>
                    </td>
                     {monthlyData.map(({
                  key,
                  year,
                  month,
                  display
                }, monthIndex) => {
                  const current = categoryData.monthlyValues[key] || 0;
                  const previous = monthIndex > 0 ? categoryData.monthlyValues[monthlyData[monthIndex - 1].key] || 0 : 0;
                  
                  return <td 
                    key={key} 
                    className="px-3 py-3 text-center text-sm text-gray-800 font-mono font-bold border-l border-gray-300 hover:bg-blue-100 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent toggle
                      
                      // Category group cell click for specific month
                      const categoryMonthData = data.filter(item => {
                        const itemDate = parseDate(item.paymentDate);
                        if (!itemDate) return false;
                        const matchesCategory = item.cleanedCategory === categoryData.category;
                        const matchesMonth = itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
                        return matchesCategory && matchesMonth;
                      });
                      
                      const monthRevenue = categoryMonthData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
                      const monthTransactions = categoryMonthData.length;
                      const monthCustomers = new Set(categoryMonthData.map(item => item.memberId || item.customerEmail)).size;
                      
                      const categoryCellData = {
                        name: `${categoryData.category} - ${display}`,
                        category: categoryData.category,
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
                        rawData: categoryMonthData,
                        filteredTransactionData: categoryMonthData,
                        isDynamic: true,
                        calculatedFromFiltered: true,
                        isGroupCell: true,
                        cellSpecific: true,
                        month: display,
                        monthKey: key
                      };
                      
                      console.log(`Category group cell click: ${categoryData.category} - ${display}: ${monthTransactions} transactions, ${monthRevenue} revenue`);
                      onRowClick(categoryCellData);
                    }}
                  >
                          <div className="flex items-center justify-center">
                            {formatMetricValue(current, selectedMetric)}
                            {getGrowthIndicator(current, previous)}
                          </div>
                        </td>;
                })}
                  </tr>
                  
                  {!localCollapsedGroups.has(categoryData.category) && categoryData.products.map((product, productIndex) => <tr key={`${categoryData.category}-${product.product}`} onClick={() => handleRowClickWithDrillDown(product)} className="hover:bg-gray-100/60 cursor-pointer border-b border-gray-100 transition-colors duration-200 group">
                      <td className="px-2 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 min-w-96 z-10">
                        <div className="flex items-center gap-2 pl-8">
                          <span className="text-gray-500">#{productIndex + 1}</span>
                          <span className="whitespace-normal break-words font-semibold group-hover:text-blue-700 transition-all duration-150">{product.product}</span>
                        </div>
                      </td>
                      {monthlyData.map(({
                  key,
                  year,
                  month,
                  display
                }, monthIndex) => {
                  const current = product.monthlyValues[key] || 0;
                  const previous = monthIndex > 0 ? product.monthlyValues[monthlyData[monthIndex - 1].key] || 0 : 0;
                  
                  return <td 
                    key={key} 
                    className="px-3 py-3 text-center text-sm text-gray-900 font-mono border-l border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      
                      // Filter data for this specific month and product
                      const monthSpecificData = (product.rawData || []).filter((transaction: any) => {
                        const itemDate = parseDate(transaction.paymentDate);
                        if (!itemDate) return false;
                        return itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
                      });
                      
                      const monthRevenue = monthSpecificData.reduce((sum: any, transaction: any) => sum + (transaction.paymentValue || 0), 0);
                      const monthTransactions = monthSpecificData.length;
                      const monthCustomers = new Set(monthSpecificData.map((transaction: any) => transaction.memberId || transaction.customerEmail)).size;
                      
                      const enhancedCellData = {
                        ...product,
                        name: `${product.product} - ${display}`,
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
                      
                      console.log(`Cell click: ${product.product} - ${display}: ${monthTransactions} transactions, ${monthRevenue} revenue`);
                      onRowClick && onRowClick(enhancedCellData);
                    }}
                  >
                            <div className="flex items-center justify-center">
                              {formatMetricValue(current, selectedMetric)}
                              {getGrowthIndicator(current, previous)}
                            </div>
                          </td>;
                })}
                    </tr>)}
                </React.Fragment>)}
              
              <tr className="bg-gradient-to-r from-blue-200 to-blue-300 border-t-4 border-gray-800 font-bold">
                <td 
                  className="px-6 py-3 text-sm font-bold text-blue-900 sticky left-0 border-r border-blue-300 z-20 bg-slate-50 hover:bg-blue-100 cursor-pointer transition-colors"
                  onClick={() => {
                    // Total row click - show all data
                    const totalRevenue = data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
                    const totalTransactions = data.length;
                    const totalCustomers = new Set(data.map(item => item.memberId || item.customerEmail)).size;
                    
                    const totalRowData = {
                      name: 'All Products & Categories - Total',
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
                    
                    console.log(`Total row click: All products & categories - ${totalTransactions} transactions, ${totalRevenue} revenue`);
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
                className="px-3 py-3 text-center text-sm text-blue-900 font-mono font-bold border-l border-gray-200 bg-white hover:bg-blue-100 cursor-pointer transition-colors"
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
                    name: `All Products & Categories - ${display}`,
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
                  
                  console.log(`Total cell click: All products & categories - ${display}: ${monthTransactions} transactions, ${monthRevenue} revenue`);
                  onRowClick(totalCellData);
                }}
              >
                    {formatMetricValue(totalsRow.monthlyValues[key] || 0, selectedMetric)}
                  </td>)}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-slate-50 to-white rounded-b-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Product Month-on-Month Insights
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
          
          {isEditingSummary ? <Textarea value={summaryText} onChange={e => setSummaryText(e.target.value)} placeholder="Enter month-on-month insights using bullet points (• )" className="min-h-32 text-sm" /> : <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {summaryText}
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
};