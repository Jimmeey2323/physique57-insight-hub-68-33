import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye, Download, Filter, Search, TrendingUp, TrendingDown, ChevronDown, Edit3, Save, SortAsc, SortDesc, RefreshCw, Archive, FileSpreadsheet } from 'lucide-react';
import { SalesData, FilterOptions } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';
interface DataTableProps {
  title: string;
  data: SalesData[];
  type: 'product' | 'category' | 'yearly' | 'monthly' | 'yoy-analysis';
  filters?: FilterOptions;
  onRowClick?: (row: any) => void;
}
export const DataTable: React.FC<DataTableProps> = ({
  title,
  data,
  type,
  filters,
  onRowClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('grossRevenue');
  const [sortField, setSortField] = useState<string>('grossRevenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [editingSummary, setEditingSummary] = useState(false);
  const [customSummary, setCustomSummary] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const itemsPerPage = 20;

  // Helper function to safely parse dates with multiple format support
  const parseDate = (dateString: string): Date | null => {
    if (!dateString || typeof dateString !== 'string') return null;
    const cleanDateString = dateString.trim();

    // Try DD/MM/YYYY format first (most common in the data)
    const ddmmyyyy = cleanDateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime()) && date.getFullYear() == parseInt(year)) return date;
    }

    // Try MM/DD/YYYY format
    const mmddyyyy = cleanDateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const [, month, day, year] = mmddyyyy;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime()) && date.getFullYear() == parseInt(year)) return date;
    }

    // Try YYYY-MM-DD format
    const yyyymmdd = cleanDateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmdd) {
      const [, year, month, day] = yyyymmdd;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }

    // Try other common formats
    const formats = [new Date(cleanDateString), new Date(cleanDateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')), new Date(cleanDateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'))];
    for (const date of formats) {
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        return date;
      }
    }
    return null;
  };

  // Type guard function to ensure arrays
  const ensureArray = (value: unknown): any[] => {
    return Array.isArray(value) ? value : [];
  };

  // Filter data by date range and other filters - ONLY for current year in YoY analysis
  const filterDataByDateAndFilters = (rawData: SalesData[], forCurrentYearOnly: boolean = false) => {
    let filtered = ensureArray(rawData);

    // For YoY analysis, only apply filters to current year data
    if (type === 'yoy-analysis' && forCurrentYearOnly) {
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter(item => {
        const itemDate = parseDate(item.paymentDate);
        return itemDate && itemDate.getFullYear() === currentYear;
      });
    }

    // Apply date range filter only if not YoY analysis or if filtering current year
    if (type !== 'yoy-analysis' || forCurrentYearOnly) {
      if (filters?.dateRange?.start || filters?.dateRange?.end) {
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        filtered = filtered.filter(item => {
          const itemDate = parseDate(item.paymentDate);
          if (!itemDate) return false;
          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
          return true;
        });
      }
    }

    // Apply other filters only to current year data for YoY analysis
    if (type !== 'yoy-analysis' || forCurrentYearOnly) {
      if (filters?.category?.length) {
        filtered = filtered.filter(item => filters.category!.some(cat => item.cleanedCategory?.toLowerCase().includes(cat.toLowerCase())));
      }
      if (filters?.paymentMethod?.length) {
        filtered = filtered.filter(item => filters.paymentMethod!.some(method => item.paymentMethod?.toLowerCase().includes(method.toLowerCase())));
      }
      if (filters?.soldBy?.length) {
        filtered = filtered.filter(item => filters.soldBy!.some(seller => item.soldBy?.toLowerCase().includes(seller.toLowerCase())));
      }
      if (filters?.minAmount) {
        filtered = filtered.filter(item => (item.paymentValue || 0) >= filters.minAmount!);
      }
      if (filters?.maxAmount) {
        filtered = filtered.filter(item => (item.paymentValue || 0) <= filters.maxAmount!);
      }
    }
    return filtered;
  };
  const processedData = useMemo(() => {
    if (type === 'monthly') {
      let filteredData = filterDataByDateAndFilters(data);

      // Get all unique products
      const products = [...new Set(filteredData.map(item => item.cleanedProduct))].filter(Boolean);

      // Get all unique month-years and sort them in DESCENDING order (most recent first)
      const monthYearsSet = new Set(filteredData.map(item => {
        const date = parseDate(item.paymentDate);
        if (!date) return null;
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }).filter(Boolean));
      const monthYears = Array.from(monthYearsSet) as string[];
      monthYears.sort((a, b) => b.localeCompare(a)); // Descending order

      return products.map(product => {
        const row: any = {
          name: product,
          category: filteredData.find(item => item.cleanedProduct === product)?.cleanedCategory || 'Unknown',
          rawData: filteredData.filter(item => item.cleanedProduct === product)
        };
        monthYears.forEach(monthYear => {
          const [year, month] = monthYear.split('-');
          const monthData = filteredData.filter(item => {
            const date = parseDate(item.paymentDate);
            if (!date) return false;
            return item.cleanedProduct === product && date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(month) - 1;
          });
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', {
            month: 'short',
            year: '2-digit'
          });
          const grossRevenue = monthData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
          const vat = monthData.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
          const transactions = monthData.length;
          const uniqueMembers = new Set(monthData.map(item => item.memberId)).size;
          const unitsSold = monthData.length;
          row[`${monthName}_grossRevenue`] = grossRevenue;
          row[`${monthName}_vat`] = vat;
          row[`${monthName}_netRevenue`] = grossRevenue - vat;
          row[`${monthName}_transactions`] = transactions;
          row[`${monthName}_uniqueMembers`] = uniqueMembers;
          row[`${monthName}_units`] = unitsSold;
          row[`${monthName}_atv`] = transactions > 0 ? Math.round(grossRevenue / transactions) : 0;
          row[`${monthName}_auv`] = unitsSold > 0 ? Math.round(grossRevenue / unitsSold) : 0;
          row[`${monthName}_asv`] = uniqueMembers > 0 ? Math.round(grossRevenue / uniqueMembers) : 0;
          row[`${monthName}_upt`] = transactions > 0 ? (unitsSold / transactions).toFixed(1) : '0.0';
          row[`${monthName}_rawData`] = monthData;
        });
        return row;
      });
    }
    if (type === 'yoy-analysis') {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      const analyzeYoY = (groupKey: keyof SalesData, displayName: string) => {
        const groupsSet = new Set(data.map(item => item[groupKey]));
        const groups = Array.from(groupsSet).filter(Boolean);
        return groups.map(group => {
          // For current year, apply filters
          const currentYearData = filterDataByDateAndFilters(data.filter(item => {
            const date = parseDate(item.paymentDate);
            return date && date.getFullYear() === currentYear && item[groupKey] === group;
          }), true);

          // For last year, get ALL data without filters
          const lastYearData = data.filter(item => {
            const date = parseDate(item.paymentDate);
            return date && date.getFullYear() === lastYear && item[groupKey] === group;
          });
          const currentRevenue = currentYearData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
          const lastRevenue = lastYearData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
          const growth = lastRevenue > 0 ? (currentRevenue - lastRevenue) / lastRevenue * 100 : 0;
          const currentTransactions = currentYearData.length;
          const lastTransactions = lastYearData.length;
          const transactionGrowth = lastTransactions > 0 ? (currentTransactions - lastTransactions) / lastTransactions * 100 : 0;
          const currentMembers = new Set(currentYearData.map(item => item.memberId)).size;
          const lastMembers = new Set(lastYearData.map(item => item.memberId)).size;
          const memberGrowth = lastMembers > 0 ? (currentMembers - lastMembers) / lastMembers * 100 : 0;
          return {
            name: group as string,
            category: displayName,
            currentYearRevenue: currentRevenue,
            lastYearRevenue: lastRevenue,
            revenueGrowth: growth,
            currentYearTransactions: currentTransactions,
            lastYearTransactions: lastTransactions,
            transactionGrowth: transactionGrowth,
            currentYearMembers: currentMembers,
            lastYearMembers: lastMembers,
            memberGrowth: memberGrowth,
            type: groupKey,
            // Include ALL raw data for drill-down (both years)
            rawData: [...currentYearData, ...lastYearData],
            currentYearRawData: currentYearData,
            lastYearRawData: lastYearData
          };
        });
      };
      const productAnalysis = analyzeYoY('cleanedProduct', 'Product');
      const categoryAnalysis = analyzeYoY('cleanedCategory', 'Category');
      const soldByAnalysis = analyzeYoY('soldBy', 'Sales Rep');
      const paymentMethodAnalysis = analyzeYoY('paymentMethod', 'Payment Method');
      return [...productAnalysis, ...categoryAnalysis, ...soldByAnalysis, ...paymentMethodAnalysis].sort((a, b) => Math.abs(b.revenueGrowth) - Math.abs(a.revenueGrowth));
    }

    // For product and category tables
    let filteredData = filterDataByDateAndFilters(data);
    const groupingField = type === 'product' ? 'cleanedProduct' : 'cleanedCategory';
    const grouped = filteredData.reduce((acc, item) => {
      const key = item[groupingField] || 'Unknown';
      const category = item.cleanedCategory || 'Unknown';
      if (!acc[key]) {
        acc[key] = {
          name: key,
          category: category,
          grossRevenue: 0,
          vat: 0,
          netRevenue: 0,
          unitsSold: 0,
          transactions: 0,
          uniqueMembers: new Set(),
          atv: 0,
          auv: 0,
          asv: 0,
          upt: 0,
          rawData: []
        };
      }
      acc[key].grossRevenue += item.paymentValue || 0;
      acc[key].vat += item.paymentVAT || 0;
      acc[key].netRevenue += (item.paymentValue || 0) - (item.paymentVAT || 0);
      acc[key].unitsSold += 1;
      acc[key].transactions += 1;
      acc[key].uniqueMembers.add(item.memberId);
      acc[key].rawData.push(item);
      return acc;
    }, {} as Record<string, any>);
    return Object.values(grouped).map((item: any) => ({
      ...item,
      uniqueMembers: item.uniqueMembers.size,
      atv: item.transactions > 0 ? Math.round(item.grossRevenue / item.transactions) : 0,
      auv: item.unitsSold > 0 ? Math.round(item.grossRevenue / item.unitsSold) : 0,
      asv: item.uniqueMembers.size > 0 ? Math.round(item.grossRevenue / item.uniqueMembers.size) : 0,
      upt: item.transactions > 0 ? (item.unitsSold / item.transactions).toFixed(1) : '0.0'
    }));
  }, [data, type, filters]);

  // Group data by category for collapsible display
  const groupedData = useMemo(() => {
    if (type === 'yoy-analysis') return processedData;
    const groups = ensureArray(processedData).reduce((acc, item) => {
      const category = item.category || 'Unknown';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, any[]>);
    return groups;
  }, [processedData, type]);

  // Get unique month-years for monthly table headers (in descending order)
  const monthYears = useMemo(() => {
    if (type !== 'monthly') return [];
    const filteredData = filterDataByDateAndFilters(data);
    const monthsSet = new Set(filteredData.map(item => {
      const date = parseDate(item.paymentDate);
      if (!date) return null;
      return new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('en-IN', {
        month: 'short',
        year: '2-digit'
      });
    }).filter(Boolean));
    const months = Array.from(monthsSet) as string[];
    months.sort((a, b) => {
      // Convert month names back to dates for proper sorting
      const dateA = new Date(parseInt('20' + a.split(' ')[1]), ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(a.split(' ')[0]));
      const dateB = new Date(parseInt('20' + b.split(' ')[1]), ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(b.split(' ')[0]));
      return dateB.getTime() - dateA.getTime(); // Descending order (most recent first)
    });
    return months;
  }, [data, type, filters]);

  // Group months into quarters (maintaining descending order)
  const quarterGroups = useMemo(() => {
    if (type !== 'monthly') return {};
    const quarters: Record<string, string[]> = {};
    monthYears.forEach(month => {
      const [monthName, year] = month.split(' ');
      const quarterMap: Record<string, string> = {
        'Jan': 'Q1',
        'Feb': 'Q1',
        'Mar': 'Q1',
        'Apr': 'Q2',
        'May': 'Q2',
        'Jun': 'Q2',
        'Jul': 'Q3',
        'Aug': 'Q3',
        'Sep': 'Q3',
        'Oct': 'Q4',
        'Nov': 'Q4',
        'Dec': 'Q4'
      };
      const quarter = `${quarterMap[monthName]} ${year}`;
      if (!quarters[quarter]) quarters[quarter] = [];
      quarters[quarter].push(month);
    });
    return quarters;
  }, [monthYears, type]);

  // Apply search and filters
  const filteredAndSearchedData = useMemo(() => {
    let result = type === 'yoy-analysis' ? ensureArray(processedData) : Object.values(groupedData).flat();
    if (searchTerm) {
      result = result.filter(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterCategory !== 'all') {
      result = result.filter(item => item.category?.toLowerCase().includes(filterCategory.toLowerCase()));
    }

    // Apply sorting
    if (sortField && type !== 'monthly') {
      result.sort((a, b) => {
        const aVal = a[sortField] || 0;
        const bVal = b[sortField] || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    return result;
  }, [processedData, groupedData, searchTerm, filterCategory, sortField, sortDirection, type]);
  const totalPages = Math.ceil(filteredAndSearchedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = type === 'yoy-analysis' ? filteredAndSearchedData.slice(startIndex, endIndex) : filteredAndSearchedData;

  // Calculate totals with safe array operations
  const totals = useMemo(() => {
    const safeData = ensureArray(filteredAndSearchedData);
    if (type === 'monthly') {
      const monthTotals: any = {};
      monthYears.forEach(month => {
        monthTotals[`${month}_grossRevenue`] = 0;
        monthTotals[`${month}_netRevenue`] = 0;
        monthTotals[`${month}_vat`] = 0;
        monthTotals[`${month}_transactions`] = 0;
        monthTotals[`${month}_uniqueMembers`] = 0;
        monthTotals[`${month}_units`] = 0;
      });
      ensureArray(processedData).forEach(item => {
        monthYears.forEach(month => {
          monthTotals[`${month}_grossRevenue`] += item[`${month}_grossRevenue`] || 0;
          monthTotals[`${month}_netRevenue`] += item[`${month}_netRevenue`] || 0;
          monthTotals[`${month}_vat`] += item[`${month}_vat`] || 0;
          monthTotals[`${month}_transactions`] += item[`${month}_transactions`] || 0;
          monthTotals[`${month}_uniqueMembers`] += item[`${month}_uniqueMembers`] || 0;
          monthTotals[`${month}_units`] += item[`${month}_units`] || 0;
        });
      });
      return monthTotals;
    }
    if (type === 'yoy-analysis') {
      return safeData.reduce((acc, item) => ({
        currentYearRevenue: acc.currentYearRevenue + (item.currentYearRevenue || 0),
        lastYearRevenue: acc.lastYearRevenue + (item.lastYearRevenue || 0),
        currentYearTransactions: acc.currentYearTransactions + (item.currentYearTransactions || 0),
        lastYearTransactions: acc.lastYearTransactions + (item.lastYearTransactions || 0),
        currentYearMembers: acc.currentYearMembers + (item.currentYearMembers || 0),
        lastYearMembers: acc.lastYearMembers + (item.lastYearMembers || 0)
      }), {
        currentYearRevenue: 0,
        lastYearRevenue: 0,
        currentYearTransactions: 0,
        lastYearTransactions: 0,
        currentYearMembers: 0,
        lastYearMembers: 0
      });
    }
    return safeData.reduce((acc, item) => ({
      grossRevenue: acc.grossRevenue + (item.grossRevenue || 0),
      netRevenue: acc.netRevenue + (item.netRevenue || 0),
      vat: acc.vat + (item.vat || 0),
      unitsSold: acc.unitsSold + (item.unitsSold || 0),
      transactions: acc.transactions + (item.transactions || 0),
      uniqueMembers: acc.uniqueMembers + (item.uniqueMembers || 0)
    }), {
      grossRevenue: 0,
      netRevenue: 0,
      vat: 0,
      unitsSold: 0,
      transactions: 0,
      uniqueMembers: 0
    });
  }, [filteredAndSearchedData, type, monthYears, processedData]);
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  const toggleGroupCollapse = (category: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedGroups(newCollapsed);
  };
  const saveSummary = () => {
    localStorage.setItem(`table-summary-${type}`, customSummary);
    setEditingSummary(false);
  };
  const getTableTitle = () => {
    switch (type) {
      case 'monthly':
        return 'Month-on-Month Product Performance Matrix';
      case 'yoy-analysis':
        return `Year-on-Year Growth Analysis (${new Date().getFullYear() - 1} vs ${new Date().getFullYear()})`;
      case 'yearly':
        return 'Year-on-Year Performance';
      default:
        return title;
    }
  };
  const handleRowClick = (row: any) => {
    // Include raw transaction data for drill-down with proper data structure
    const enrichedRow = {
      ...row,
      transactionData: row.rawData || [],
      // For monthly data, include month-specific transaction data
      ...(type === 'monthly' && {
        monthlyTransactionData: monthYears.reduce((acc, month) => {
          acc[month] = row[`${month}_rawData`] || [];
          return acc;
        }, {} as Record<string, any[]>)
      }),
      // For YoY data, include year-specific transaction data
      ...(type === 'yoy-analysis' && {
        currentYearTransactionData: row.currentYearRawData || [],
        lastYearTransactionData: row.lastYearRawData || []
      })
    };
    console.log('Row clicked with enriched data:', enrichedRow);
    onRowClick?.(enrichedRow);
  };
  const renderMonthlyTable = () => <div className="rounded-3xl border border-slate-200/30 bg-white shadow-2xl overflow-hidden">
      {/* Enhanced Tab Navigation */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/50 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 p-2 rounded-2xl shadow-lg border border-slate-200/30">
            <TabsTrigger value="grossRevenue" className="text-xs font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
              Gross Revenue
            </TabsTrigger>
            <TabsTrigger value="netRevenue" className="text-xs font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
              Net Revenue
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="uniqueMembers" className="text-xs font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
              Members
            </TabsTrigger>
            <TabsTrigger value="units" className="text-xs font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
              Units
            </TabsTrigger>
            <TabsTrigger value="atv" className="text-xs font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
              ATV
            </TabsTrigger>
            <TabsTrigger value="auv" className="text-xs font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
              AUV
            </TabsTrigger>
            <TabsTrigger value="asv" className="text-xs font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
              ASV
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Enhanced Table with Additional Features */}
      <div className="relative">
        

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 z-10 shadow-lg">
              <TableRow className="border-0">
                <TableHead className="font-bold text-white text-sm sticky left-0 bg-gradient-to-r from-blue-500 to-purple-600 backdrop-blur-sm border-r border-white/20 min-w-[200px] shadow-lg">
                  Product
                </TableHead>
                {Object.entries(quarterGroups).map(([quarter, months]) => <TableHead key={quarter} colSpan={months.length} className="text-center font-bold text-white text-sm border-r border-white/20">
                    {quarter}
                  </TableHead>)}
              </TableRow>
              <TableRow className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 border-0">
                <TableHead className="font-bold text-white text-sm sticky left-0 bg-gradient-to-r from-blue-400 to-purple-500 backdrop-blur-sm border-r border-white/20">
                  &nbsp;
                </TableHead>
                {monthYears.map(month => <TableHead key={month} className="text-center font-bold text-white text-sm min-w-[120px] border-r border-white/10">
                    {month}
                  </TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {Object.entries(groupedData).map(([category, items]) => <React.Fragment key={category}>
                  <TableRow className="bg-gradient-to-r from-slate-100/60 to-slate-200/60 font-bold border-b border-slate-300/50 cursor-pointer hover:from-slate-200/70 hover:to-slate-300/70 transition-all duration-300" onClick={() => toggleGroupCollapse(category)}>
                    <TableCell className="font-bold text-slate-800 sticky left-0 bg-gradient-to-r from-slate-100/90 to-slate-200/90 backdrop-blur-sm border-r border-slate-300/50 shadow-sm">
                      <div className="flex items-center gap-2">
                        <ChevronDown className={cn("w-4 h-4 transition-transform", collapsedGroups.has(category) && "rotate-180")} />
                        {category} ({ensureArray(items).length} items)
                      </div>
                    </TableCell>
                    {monthYears.map(month => {
                  const categoryTotal = ensureArray(items).reduce((sum, item) => sum + (item[`${month}_${activeTab}`] || 0), 0);
                  return <TableCell key={month} className="text-center font-bold text-blue-700 border-r border-slate-200/30 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                          {activeTab.includes('Revenue') || activeTab === 'atv' || activeTab === 'auv' || activeTab === 'asv' ? formatCurrency(categoryTotal) : activeTab === 'upt' ? (categoryTotal / ensureArray(items).length).toFixed(1) : formatNumber(categoryTotal)}
                        </TableCell>;
                })}
                  </TableRow>
                  {!collapsedGroups.has(category) && ensureArray(items).map((row: any, index: number) => <TableRow key={`${category}-${index}`} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 cursor-pointer transition-all duration-300 border-b border-slate-200/20 bg-white" onClick={() => handleRowClick(row)}>
                      <TableCell className="font-semibold text-slate-800 sticky left-0 bg-white backdrop-blur-sm border-r border-slate-200/30 text-sm pl-8 shadow-sm">
                        {row.name}
                      </TableCell>
                      {monthYears.map(month => <TableCell key={month} className="text-center font-medium text-sm border-r border-slate-200/10">
                          {activeTab === 'grossRevenue' && formatCurrency(row[`${month}_grossRevenue`] || 0)}
                          {activeTab === 'netRevenue' && formatCurrency(row[`${month}_netRevenue`] || 0)}
                          {activeTab === 'transactions' && formatNumber(row[`${month}_transactions`] || 0)}
                          {activeTab === 'uniqueMembers' && formatNumber(row[`${month}_uniqueMembers`] || 0)}
                          {activeTab === 'units' && formatNumber(row[`${month}_units`] || 0)}
                          {activeTab === 'atv' && `₹${row[`${month}_atv`] || 0}`}
                          {activeTab === 'auv' && `₹${row[`${month}_auv`] || 0}`}
                          {activeTab === 'asv' && `₹${row[`${month}_asv`] || 0}`}
                        </TableCell>)}
                    </TableRow>)}
                </React.Fragment>)}
            </TableBody>
            <TableFooter className="sticky bottom-0 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-500 shadow-lg">
              <TableRow className="border-0">
                <TableCell className="font-bold text-white sticky left-0 bg-gradient-to-r from-emerald-500 to-teal-600 backdrop-blur-sm border-r border-white/20">
                  GRAND TOTALS
                </TableCell>
                {monthYears.map(month => <TableCell key={month} className="text-center font-bold text-white border-r border-white/10">
                    {activeTab === 'grossRevenue' && formatCurrency(totals[`${month}_grossRevenue`] || 0)}
                    {activeTab === 'netRevenue' && formatCurrency(totals[`${month}_netRevenue`] || 0)}
                    {activeTab === 'transactions' && formatNumber(totals[`${month}_transactions`] || 0)}
                    {activeTab === 'uniqueMembers' && formatNumber(totals[`${month}_uniqueMembers`] || 0)}
                    {activeTab === 'units' && formatNumber(totals[`${month}_units`] || 0)}
                    {(activeTab === 'atv' || activeTab === 'auv' || activeTab === 'asv') && '-'}
                  </TableCell>)}
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>;
  const renderYoYTable = () => <div className="rounded-3xl border border-slate-200/30 bg-white shadow-2xl overflow-hidden">
      <div className="relative">
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export
          </Button>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 z-10 shadow-lg">
              <TableRow className="border-0">
                <TableHead className="font-bold text-white">Category</TableHead>
                <TableHead className="font-bold text-white">Name</TableHead>
                <TableHead className="text-center font-bold text-white">{new Date().getFullYear()} Revenue</TableHead>
                <TableHead className="text-center font-bold text-white">{new Date().getFullYear() - 1} Revenue</TableHead>
                <TableHead className="text-center font-bold text-white">Revenue Growth</TableHead>
                <TableHead className="text-center font-bold text-white">{new Date().getFullYear()} Transactions</TableHead>
                <TableHead className="text-center font-bold text-white">{new Date().getFullYear() - 1} Transactions</TableHead>
                <TableHead className="text-center font-bold text-white">Transaction Growth</TableHead>
                <TableHead className="text-center font-bold text-white">Member Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {currentData.map((row, index) => <TableRow key={index} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 cursor-pointer transition-all duration-300 border-b border-slate-200/20" onClick={() => handleRowClick(row)}>
                  <TableCell>
                    <Badge variant="outline" className="capitalize font-semibold">
                      {row.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800">{row.name}</TableCell>
                  <TableCell className="text-center font-medium">{formatCurrency(row.currentYearRevenue)}</TableCell>
                  <TableCell className="text-center">{formatCurrency(row.lastYearRevenue)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {row.revenueGrowth > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                      <span className={cn("font-bold", row.revenueGrowth > 0 ? "text-green-600" : "text-red-600")}>
                        {formatPercentage(row.revenueGrowth)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{formatNumber(row.currentYearTransactions)}</TableCell>
                  <TableCell className="text-center">{formatNumber(row.lastYearTransactions)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {row.transactionGrowth > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                      <span className={cn("font-bold", row.transactionGrowth > 0 ? "text-green-600" : "text-red-600")}>
                        {formatPercentage(row.transactionGrowth)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {row.memberGrowth > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                      <span className={cn("font-bold", row.memberGrowth > 0 ? "text-green-600" : "text-red-600")}>
                        {formatPercentage(row.memberGrowth)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>)}
            </TableBody>
            <TableFooter className="sticky bottom-0 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-500 shadow-lg">
              <TableRow className="border-0">
                <TableCell colSpan={2} className="font-bold text-white">TOTALS</TableCell>
                <TableCell className="text-center font-bold text-white">{formatCurrency(totals.currentYearRevenue)}</TableCell>
                <TableCell className="text-center font-bold text-white">{formatCurrency(totals.lastYearRevenue)}</TableCell>
                <TableCell className="text-center font-bold text-white">
                  {formatPercentage(totals.lastYearRevenue > 0 ? (totals.currentYearRevenue - totals.lastYearRevenue) / totals.lastYearRevenue * 100 : 0)}
                </TableCell>
                <TableCell className="text-center font-bold text-white">{formatNumber(totals.currentYearTransactions)}</TableCell>
                <TableCell className="text-center font-bold text-white">{formatNumber(totals.lastYearTransactions)}</TableCell>
                <TableCell className="text-center font-bold text-white">
                  {formatPercentage(totals.lastYearTransactions > 0 ? (totals.currentYearTransactions - totals.lastYearTransactions) / totals.lastYearTransactions * 100 : 0)}
                </TableCell>
                <TableCell className="text-center font-bold text-white">
                  {formatPercentage(totals.lastYearMembers > 0 ? (totals.currentYearMembers - totals.lastYearMembers) / totals.lastYearMembers * 100 : 0)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>;
  const renderStandardTable = () => <div className="rounded-3xl border border-slate-200/30 bg-white shadow-2xl overflow-hidden">
      <div className="relative">
        

        <Table>
          <TableHeader className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 z-10 shadow-lg">
            <TableRow className="border-0">
              <TableHead className="font-bold text-white">Name</TableHead>
              <TableHead className="text-center font-bold text-white cursor-pointer" onClick={() => handleSort('grossRevenue')}>
                <div className="flex items-center justify-center gap-1">
                  Gross Revenue 
                  {sortField === 'grossRevenue' ? sortDirection === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3" />}
                </div>
              </TableHead>
              <TableHead className="text-center font-bold text-white">VAT</TableHead>
              <TableHead className="text-center font-bold text-white">Net Revenue</TableHead>
              <TableHead className="text-center font-bold text-white">Units</TableHead>
              <TableHead className="text-center font-bold text-white">Transactions</TableHead>
              <TableHead className="text-center font-bold text-white">Members</TableHead>
              <TableHead className="text-center font-bold text-white">ATV</TableHead>
              <TableHead className="text-center font-bold text-white">AUV</TableHead>
              <TableHead className="text-center font-bold text-white">ASV</TableHead>
              <TableHead className="text-center font-bold text-white">UPT</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {Object.entries(groupedData).map(([category, items]) => <React.Fragment key={category}>
                <TableRow className="bg-gradient-to-r from-slate-100/60 to-slate-200/60 font-bold border-b border-slate-300/50 cursor-pointer hover:from-slate-200/70 hover:to-slate-300/70 transition-all duration-300" onClick={() => toggleGroupCollapse(category)}>
                  <TableCell className="font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <ChevronDown className={cn("w-4 h-4 transition-transform", collapsedGroups.has(category) && "rotate-180")} />
                      {category} ({ensureArray(items).length} items)
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-blue-700">
                    {formatCurrency(ensureArray(items).reduce((sum, item) => sum + (item.grossRevenue || 0), 0))}
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700">
                    {formatCurrency(ensureArray(items).reduce((sum, item) => sum + (item.vat || 0), 0))}
                  </TableCell>
                  <TableCell className="text-center font-bold text-green-700">
                    {formatCurrency(ensureArray(items).reduce((sum, item) => sum + (item.netRevenue || 0), 0))}
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700">
                    {formatNumber(ensureArray(items).reduce((sum, item) => sum + (item.unitsSold || 0), 0))}
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700">
                    {formatNumber(ensureArray(items).reduce((sum, item) => sum + (item.transactions || 0), 0))}
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700">
                    {formatNumber(ensureArray(items).reduce((sum, item) => sum + (item.uniqueMembers || 0), 0))}
                  </TableCell>
                  <TableCell className="text-center text-slate-500">-</TableCell>
                  <TableCell className="text-center text-slate-500">-</TableCell>
                  <TableCell className="text-center text-slate-500">-</TableCell>
                  <TableCell className="text-center text-slate-500">-</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                {!collapsedGroups.has(category) && ensureArray(items).map((row: any, index: number) => <TableRow key={`${category}-${index}`} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 cursor-pointer transition-all duration-300 border-b border-slate-200/20 bg-white" onClick={() => handleRowClick(row)}>
                    <TableCell className="font-semibold text-slate-800 pl-8">{row.name}</TableCell>
                    <TableCell className="text-center font-medium">{formatCurrency(row.grossRevenue || 0)}</TableCell>
                    <TableCell className="text-center">{formatCurrency(row.vat || 0)}</TableCell>
                    <TableCell className="text-center font-medium">{formatCurrency(row.netRevenue || 0)}</TableCell>
                    <TableCell className="text-center">{formatNumber(row.unitsSold || 0)}</TableCell>
                    <TableCell className="text-center">{formatNumber(row.transactions || 0)}</TableCell>
                    <TableCell className="text-center">{formatNumber(row.uniqueMembers || 0)}</TableCell>
                    <TableCell className="text-center">₹{row.atv || 0}</TableCell>
                    <TableCell className="text-center">₹{row.auv || 0}</TableCell>
                    <TableCell className="text-center">₹{row.asv || 0}</TableCell>
                    <TableCell className="text-center">{row.upt || '0.0'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleRowClick(row)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>)}
              </React.Fragment>)}
          </TableBody>
          <TableFooter className="sticky bottom-0 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-500 shadow-lg">
            <TableRow className="border-0">
              <TableCell className="font-bold text-white">GRAND TOTALS</TableCell>
              <TableCell className="text-center font-bold text-white">{formatCurrency(totals.grossRevenue)}</TableCell>
              <TableCell className="text-center font-bold text-white">{formatCurrency(totals.vat)}</TableCell>
              <TableCell className="text-center font-bold text-white">{formatCurrency(totals.netRevenue)}</TableCell>
              <TableCell className="text-center font-bold text-white">{formatNumber(totals.unitsSold)}</TableCell>
              <TableCell className="text-center font-bold text-white">{formatNumber(totals.transactions)}</TableCell>
              <TableCell className="text-center font-bold text-white">{formatNumber(totals.uniqueMembers)}</TableCell>
              <TableCell className="text-center text-white">-</TableCell>
              <TableCell className="text-center text-white">-</TableCell>
              <TableCell className="text-center text-white">-</TableCell>
              <TableCell className="text-center text-white">-</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>;
  return <Card className="bg-gradient-to-br from-white via-slate-50/20 to-white border-0 shadow-2xl backdrop-blur-sm">
      
      
      
    </Card>;
};