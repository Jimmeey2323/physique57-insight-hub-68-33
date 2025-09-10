import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SalesData } from '@/types/dashboard';
import { 
  TrendingDown, DollarSign, Package, Users, CreditCard, 
  Calendar, MapPin, Percent, ShoppingCart
} from 'lucide-react';

interface DiscountDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: SalesData[];
  type: string;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#84cc16'];

export const DiscountDrillDownModal: React.FC<DiscountDrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
  type
}) => {
  const analysisData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalDiscount = data.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalRevenue = data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalUnits = data.length;
    const uniqueCustomers = new Set(data.map(item => item.customerEmail)).size;
    const avgDiscount = totalDiscount / data.length;
    const avgDiscountPercent = data.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / data.length;

    // Category breakdown
    const categoryBreakdown = data.reduce((acc, item) => {
      const category = item.cleanedCategory || 'Unknown';
      if (!acc[category]) {
        acc[category] = { 
          discountAmount: 0, 
          revenue: 0, 
          units: 0, 
          customers: new Set() 
        };
      }
      acc[category].discountAmount += item.discountAmount || 0;
      acc[category].revenue += item.paymentValue || 0;
      acc[category].units += 1;
      acc[category].customers.add(item.customerEmail);
      return acc;
    }, {} as Record<string, any>);

    // Product breakdown
    const productBreakdown = data.reduce((acc, item) => {
      const product = item.cleanedProduct || 'Unknown';
      if (!acc[product]) {
        acc[product] = { 
          discountAmount: 0, 
          revenue: 0, 
          units: 0, 
          customers: new Set() 
        };
      }
      acc[product].discountAmount += item.discountAmount || 0;
      acc[product].revenue += item.paymentValue || 0;
      acc[product].units += 1;
      acc[product].customers.add(item.customerEmail);
      return acc;
    }, {} as Record<string, any>);

    // Location breakdown
    const locationBreakdown = data.reduce((acc, item) => {
      const location = item.calculatedLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = { 
          discountAmount: 0, 
          revenue: 0, 
          units: 0, 
          customers: new Set() 
        };
      }
      acc[location].discountAmount += item.discountAmount || 0;
      acc[location].revenue += item.paymentValue || 0;
      acc[location].units += 1;
      acc[location].customers.add(item.customerEmail);
      return acc;
    }, {} as Record<string, any>);

    // Payment method breakdown
    const paymentBreakdown = data.reduce((acc, item) => {
      const method = item.paymentMethod || 'Unknown';
      if (!acc[method]) {
        acc[method] = { 
          discountAmount: 0, 
          revenue: 0, 
          units: 0, 
          customers: new Set() 
        };
      }
      acc[method].discountAmount += item.discountAmount || 0;
      acc[method].revenue += item.paymentValue || 0;
      acc[method].units += 1;
      acc[method].customers.add(item.customerEmail);
      return acc;
    }, {} as Record<string, any>);

    // Monthly trend
    const monthlyTrend = data.reduce((acc, item) => {
      if (!item.paymentDate) return acc;
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          discountAmount: 0,
          revenue: 0,
          units: 0,
          customers: new Set()
        };
      }
      acc[monthKey].discountAmount += item.discountAmount || 0;
      acc[monthKey].revenue += item.paymentValue || 0;
      acc[monthKey].units += 1;
      acc[monthKey].customers.add(item.customerEmail);
      return acc;
    }, {} as Record<string, any>);

    // Convert to arrays and calculate additional metrics
    const processBreakdown = (breakdown: Record<string, any>) => {
      return Object.entries(breakdown).map(([name, data]) => ({
        name,
        discountAmount: data.discountAmount,
        revenue: data.revenue,
        units: data.units,
        customers: data.customers.size,
        avgDiscount: data.units > 0 ? data.discountAmount / data.units : 0,
        discountRate: data.revenue > 0 ? (data.discountAmount / data.revenue) * 100 : 0
      })).sort((a, b) => b.discountAmount - a.discountAmount);
    };

    return {
      summary: {
        totalDiscount,
        totalRevenue,
        totalUnits,
        uniqueCustomers,
        avgDiscount,
        avgDiscountPercent,
        discountRate: totalRevenue > 0 ? (totalDiscount / totalRevenue) * 100 : 0
      },
      categoryBreakdown: processBreakdown(categoryBreakdown),
      productBreakdown: processBreakdown(productBreakdown),
      locationBreakdown: processBreakdown(locationBreakdown),
      paymentBreakdown: processBreakdown(paymentBreakdown),
      monthlyTrend: Object.values(monthlyTrend).map((data: any) => ({
        ...data,
        customers: data.customers.size,
        avgDiscount: data.units > 0 ? data.discountAmount / data.units : 0,
        discountRate: data.revenue > 0 ? (data.discountAmount / data.revenue) * 100 : 0
      })).sort((a: any, b: any) => a.month.localeCompare(b.month))
    };
  }, [data]);

  if (!analysisData) return null;

  const renderSummaryCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
        <CardContent className="p-4 text-center">
          <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-700">Total Discount</p>
          <p className="text-xl font-bold text-red-800">
            {formatCurrency(analysisData.summary.totalDiscount)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4 text-center">
          <ShoppingCart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-blue-700">Units Sold</p>
          <p className="text-xl font-bold text-blue-800">
            {formatNumber(analysisData.summary.totalUnits)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4 text-center">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-700">Revenue</p>
          <p className="text-xl font-bold text-green-800">
            {formatCurrency(analysisData.summary.totalRevenue)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
        <CardContent className="p-4 text-center">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-purple-700">Customers</p>
          <p className="text-xl font-bold text-purple-800">
            {formatNumber(analysisData.summary.uniqueCustomers)}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'categories':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysisData.categoryBreakdown.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="discountAmount" fill="#ef4444" name="Discount Amount" />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'monthly-trend':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analysisData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="discountAmount" stroke="#ef4444" name="Discount Amount" />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'payment-methods':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analysisData.paymentBreakdown.slice(0, 8)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="discountAmount"
              >
                {analysisData.paymentBreakdown.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const renderDetailedTable = () => {
    let tableData = [];
    let columns = [];

    switch (type) {
      case 'categories':
        tableData = analysisData.categoryBreakdown;
        columns = [
          { key: 'name', label: 'Category', icon: Package },
          { key: 'discountAmount', label: 'Discount Amount', format: formatCurrency },
          { key: 'revenue', label: 'Revenue', format: formatCurrency },
          { key: 'units', label: 'Units Sold', format: formatNumber },
          { key: 'customers', label: 'Customers', format: formatNumber },
          { key: 'discountRate', label: 'Discount Rate', format: (v: number) => `${v.toFixed(1)}%` }
        ];
        break;
      
      case 'locations':
        tableData = analysisData.locationBreakdown;
        columns = [
          { key: 'name', label: 'Location', icon: MapPin },
          { key: 'discountAmount', label: 'Discount Amount', format: formatCurrency },
          { key: 'revenue', label: 'Revenue', format: formatCurrency },
          { key: 'units', label: 'Units Sold', format: formatNumber },
          { key: 'customers', label: 'Customers', format: formatNumber },
          { key: 'discountRate', label: 'Discount Rate', format: (v: number) => `${v.toFixed(1)}%` }
        ];
        break;
      
      case 'payment-methods':
        tableData = analysisData.paymentBreakdown;
        columns = [
          { key: 'name', label: 'Payment Method', icon: CreditCard },
          { key: 'discountAmount', label: 'Discount Amount', format: formatCurrency },
          { key: 'revenue', label: 'Revenue', format: formatCurrency },
          { key: 'units', label: 'Units Sold', format: formatNumber },
          { key: 'customers', label: 'Customers', format: formatNumber },
          { key: 'discountRate', label: 'Discount Rate', format: (v: number) => `${v.toFixed(1)}%` }
        ];
        break;
      
      case 'monthly-trend':
        tableData = analysisData.monthlyTrend;
        columns = [
          { key: 'month', label: 'Month', icon: Calendar },
          { key: 'discountAmount', label: 'Discount Amount', format: formatCurrency },
          { key: 'revenue', label: 'Revenue', format: formatCurrency },
          { key: 'units', label: 'Units Sold', format: formatNumber },
          { key: 'customers', label: 'Customers', format: formatNumber },
          { key: 'discountRate', label: 'Discount Rate', format: (v: number) => `${v.toFixed(1)}%` }
        ];
        break;
      
      default:
        return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Detailed Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key} className="font-semibold">
                      <div className="flex items-center gap-2">
                        {col.icon && <col.icon className="w-4 h-4" />}
                        {col.label}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.slice(0, 20).map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {col.format ? col.format(item[col.key]) : item[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {title} - Detailed Analysis
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {renderSummaryCards()}
            
            {renderChart() && (
              <Card>
                <CardHeader>
                  <CardTitle>Visual Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderChart()}
                </CardContent>
              </Card>
            )}
            
            {renderDetailedTable()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};