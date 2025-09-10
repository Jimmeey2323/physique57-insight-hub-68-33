
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import { Table, CalendarDays, Package, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DisplayedDataExportControls } from '@/components/ui/DisplayedDataExportControls';

interface DiscountDataTableProps {
  data: SalesData[];
  filters?: any;
  onRowClick?: (title: string, data: any[], type: string) => void;
}

export const DiscountDataTable: React.FC<DiscountDataTableProps> = ({ data, filters, onRowClick }) => {
  const [activeTable, setActiveTable] = useState<'transactions' | 'monthly' | 'category' | 'customer'>('transactions');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Transactions Table Data
  const transactionsData = useMemo(() => {
    return data.slice(0, 100).map(item => ({
      ...item,
      displaySoldBy: item.soldBy === '-' ? 'Online/System' : item.soldBy,
      displayDate: formatDate(item.paymentDate)
    }));
  }, [data]);

  // Monthly Aggregated Data
  const monthlyData = useMemo(() => {
    const monthly = data.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          transactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          uniqueCustomers: new Set(),
          avgDiscountPercent: 0,
          totalDiscountPercent: 0
        };
      }
      
      acc[monthKey].transactions += 1;
      acc[monthKey].totalDiscount += item.discountAmount || 0;
      acc[monthKey].totalRevenue += item.paymentValue || 0;
      acc[monthKey].uniqueCustomers.add(item.customerEmail);
      acc[monthKey].totalDiscountPercent += item.discountPercentage || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthly).map((item: any) => ({
      ...item,
      uniqueCustomers: item.uniqueCustomers.size,
      avgDiscountPercent: item.transactions > 0 ? item.totalDiscountPercent / item.transactions : 0
    })).sort((a, b) => b.month.localeCompare(a.month));
  }, [data]);

  // Category Aggregated Data
  const categoryData = useMemo(() => {
    const categories = data.reduce((acc, item) => {
      const category = item.cleanedCategory || 'Unknown';
      
      if (!acc[category]) {
        acc[category] = {
          category,
          transactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          uniqueCustomers: new Set(),
          avgDiscountPercent: 0,
          totalDiscountPercent: 0,
          products: new Set()
        };
      }
      
      acc[category].transactions += 1;
      acc[category].totalDiscount += item.discountAmount || 0;
      acc[category].totalRevenue += item.paymentValue || 0;
      acc[category].uniqueCustomers.add(item.customerEmail);
      acc[category].totalDiscountPercent += item.discountPercentage || 0;
      acc[category].products.add(item.cleanedProduct);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categories).map((item: any) => ({
      ...item,
      uniqueCustomers: item.uniqueCustomers.size,
      productsCount: item.products.size,
      avgDiscountPercent: item.transactions > 0 ? item.totalDiscountPercent / item.transactions : 0
    })).sort((a, b) => b.totalDiscount - a.totalDiscount);
  }, [data]);

  // Customer Aggregated Data
  const customerData = useMemo(() => {
    const customers = data.reduce((acc, item) => {
      const customer = item.customerEmail;
      
      if (!acc[customer]) {
        acc[customer] = {
          customerEmail: customer,
          customerName: item.customerName,
          transactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          avgDiscountPercent: 0,
          totalDiscountPercent: 0,
          lastTransactionDate: item.paymentDate
        };
      }
      
      acc[customer].transactions += 1;
      acc[customer].totalDiscount += item.discountAmount || 0;
      acc[customer].totalRevenue += item.paymentValue || 0;
      acc[customer].totalDiscountPercent += item.discountPercentage || 0;
      
      if (new Date(item.paymentDate) > new Date(acc[customer].lastTransactionDate)) {
        acc[customer].lastTransactionDate = item.paymentDate;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(customers).map((item: any) => ({
      ...item,
      avgDiscountPercent: item.transactions > 0 ? item.totalDiscountPercent / item.transactions : 0,
      displayLastDate: formatDate(item.lastTransactionDate)
    })).sort((a, b) => b.totalDiscount - a.totalDiscount);
  }, [data]);

  const transactionColumns = [
    { key: 'customerName', header: 'Customer', align: 'left' as const },
    { key: 'paymentItem', header: 'Product', align: 'left' as const },
    { key: 'cleanedCategory', header: 'Category', align: 'left' as const,
      render: (value: string) => <Badge variant="outline" className="w-24 justify-center text-xs"><span>{value}</span></Badge>
    },
    { key: 'displayDate', header: 'Date', align: 'center' as const },
    { key: 'paymentMethod', header: 'Payment Method', align: 'center' as const,
      render: (value: string) => <Badge variant="secondary" className="w-20 justify-center text-xs"><span>{value}</span></Badge>
    },
    { key: 'displaySoldBy', header: 'Sold By', align: 'center' as const },
    { key: 'discountAmount', header: 'Discount', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-red-600">{formatCurrency(value)}</span>
    },
    { key: 'discountPercentage', header: 'Discount %', align: 'right' as const,
      render: (value: number) => <span className="font-medium text-orange-600">{value?.toFixed(1)}%</span>
    },
    { key: 'paymentValue', header: 'Revenue', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-green-600">{formatCurrency(value)}</span>
    }
  ];

  const monthlyColumns = [
    { key: 'month', header: 'Month', align: 'left' as const },
    { key: 'transactions', header: 'Transactions', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-blue-100 text-blue-800"><span>{formatNumber(value)}</span></Badge>
    },
    { key: 'uniqueCustomers', header: 'Customers', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-purple-100 text-purple-800"><span>{formatNumber(value)}</span></Badge>
    },
    { key: 'totalDiscount', header: 'Total Discount', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-red-600">{formatCurrency(value)}</span>
    },
    { key: 'avgDiscountPercent', header: 'Avg Discount %', align: 'right' as const,
      render: (value: number) => <span className="font-medium text-orange-600">{value?.toFixed(1)}%</span>
    },
    { key: 'totalRevenue', header: 'Total Revenue', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-green-600">{formatCurrency(value)}</span>
    }
  ];

  const categoryColumns = [
    { key: 'category', header: 'Category', align: 'left' as const },
    { key: 'transactions', header: 'Transactions', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-blue-100 text-blue-800"><span>{formatNumber(value)}</span></Badge>
    },
    { key: 'productsCount', header: 'Products', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-green-100 text-green-800"><span>{formatNumber(value)}</span></Badge>
    },
    { key: 'uniqueCustomers', header: 'Customers', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-purple-100 text-purple-800"><span>{formatNumber(value)}</span></Badge>
    },
    { key: 'totalDiscount', header: 'Total Discount', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-red-600">{formatCurrency(value)}</span>
    },
    { key: 'avgDiscountPercent', header: 'Avg Discount %', align: 'right' as const,
      render: (value: number) => <span className="font-medium text-orange-600">{value?.toFixed(1)}%</span>
    },
    { key: 'totalRevenue', header: 'Total Revenue', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-green-600">{formatCurrency(value)}</span>
    }
  ];

  const customerColumns = [
    { key: 'customerName', header: 'Customer Name', align: 'left' as const },
    { key: 'customerEmail', header: 'Email', align: 'left' as const },
    { key: 'transactions', header: 'Transactions', align: 'center' as const,
      render: (value: number) => <Badge className="w-16 justify-center bg-blue-100 text-blue-800"><span>{formatNumber(value)}</span></Badge>
    },
    { key: 'totalDiscount', header: 'Total Discount', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-red-600">{formatCurrency(value)}</span>
    },
    { key: 'avgDiscountPercent', header: 'Avg Discount %', align: 'right' as const,
      render: (value: number) => <span className="font-medium text-orange-600">{value?.toFixed(1)}%</span>
    },
    { key: 'totalRevenue', header: 'Total Revenue', align: 'right' as const,
      render: (value: number) => <span className="font-bold text-green-600">{formatCurrency(value)}</span>
    },
    { key: 'displayLastDate', header: 'Last Transaction', align: 'center' as const }
  ];

  const tableConfig = {
    transactions: { data: transactionsData, columns: transactionColumns, title: 'Discount Transactions' },
    monthly: { data: monthlyData, columns: monthlyColumns, title: 'Monthly Summary' },
    category: { data: categoryData, columns: categoryColumns, title: 'Category Analysis' },
    customer: { data: customerData, columns: customerColumns, title: 'Customer Analysis' }
  };

  const currentConfig = tableConfig[activeTable];

  return (
    <Card className="bg-white border-0 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Table className="w-8 h-8 text-blue-400" />
            Discount Analytics Tables
          </CardTitle>
          <div className="flex items-center gap-2">
            <DisplayedDataExportControls 
              tableData={currentConfig.data.map(row => {
                const processedRow: Record<string, any> = {};
                currentConfig.columns.forEach(col => {
                  if (col.render) {
                    const value = row[col.key];
                    if (col.key === 'discountAmount' || col.key === 'paymentValue' || col.key === 'totalDiscount' || col.key === 'totalRevenue') {
                      processedRow[col.header] = formatCurrency(value);
                    } else if (col.key === 'discountPercentage' || col.key === 'avgDiscountPercent') {
                      processedRow[col.header] = `${value?.toFixed(1)}%`;
                    } else if (col.key === 'transactions' || col.key === 'uniqueCustomers' || col.key === 'productsCount') {
                      processedRow[col.header] = formatNumber(value);
                    } else {
                      processedRow[col.header] = value;
                    }
                  } else {
                    processedRow[col.header] = row[col.key];
                  }
                });
                return processedRow;
              })}
              tableHeaders={currentConfig.columns.map(col => col.header)}
              tableName={`Discount Analytics - ${currentConfig.title}`}
              filename={`discount-analytics-${activeTable}`}
              size="sm"
              variant="secondary"
              className="text-white"
            />
            <Badge className="bg-blue-600 text-white">
              {formatNumber(data.length)} Records
            </Badge>
          </div>
        </div>
        
        {/* Table Navigation */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant={activeTable === 'transactions' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTable('transactions')}
            className={cn(
              "text-white border-white/20",
              activeTable === 'transactions' && "bg-white/20 text-white"
            )}
          >
            <Table className="w-4 h-4 mr-2" />
            Transactions
          </Button>
          <Button
            variant={activeTable === 'monthly' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTable('monthly')}
            className={cn(
              "text-white border-white/20",
              activeTable === 'monthly' && "bg-white/20 text-white"
            )}
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            Monthly
          </Button>
          <Button
            variant={activeTable === 'category' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTable('category')}
            className={cn(
              "text-white border-white/20",
              activeTable === 'category' && "bg-white/20 text-white"
            )}
          >
            <Package className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button
            variant={activeTable === 'customer' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTable('customer')}
            className={cn(
              "text-white border-white/20",
              activeTable === 'customer' && "bg-white/20 text-white"
            )}
          >
            <Users className="w-4 h-4 mr-2" />
            Customers
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <OptimizedTable
          data={currentConfig.data}
          columns={currentConfig.columns}
          maxHeight="600px"
          stickyHeader={true}
          onRowClick={(item) => onRowClick?.(
            `${currentConfig.title} - Row Details`,
            [item],
            activeTable
          )}
        />
      </CardContent>
      
      {/* Modern Footer */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            Showing {formatNumber(currentConfig.data.length)} {currentConfig.title.toLowerCase()}
          </div>
          <div className="text-xs text-slate-300">
            Click any row for detailed drill-down analysis
          </div>
        </div>
      </div>
    </Card>
  );
};
