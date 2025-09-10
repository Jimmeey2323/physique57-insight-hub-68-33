import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Package, 
  Users, 
  Calendar,
  MapPin,
  User,
  ShoppingCart,
  CreditCard,
  Eye,
  Filter
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SalesData } from '@/types/dashboard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ExecutiveDiscountsTabProps {
  data: SalesData[];
  selectedLocation: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export const ExecutiveDiscountsTab: React.FC<ExecutiveDiscountsTabProps> = ({
  data,
  selectedLocation
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'details' | 'analytics'>('overview');
  const [showFilters, setShowFilters] = useState(false);

  // Filter data by location if selected
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (!selectedLocation || selectedLocation === 'all') return data;
    return data.filter(item => item.calculatedLocation === selectedLocation);
  }, [data, selectedLocation]);

  // Process discount data with enhanced analytics
  const discountAnalysis = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return {
      totalTransactions: 0,
      discountedTransactions: 0,
      totalRevenue: 0,
      totalDiscounts: 0,
      avgDiscountPercent: 0,
      topDiscountedProducts: [],
      monthlyTrends: [],
      locationBreakdown: [],
      categoryBreakdown: [],
      customerSegments: [],
      staffPerformance: []
    };

    // Calculate discounted transactions with better logic
    const discountedItems = filteredData.filter(item => {
      // Check multiple indicators for discounts
      const hasDiscountAmount = (item.discountAmount || 0) > 0;
      const hasDiscountPercent = (item.discountPercentage || 0) > 0;
      const isPromotional = item.isPromotional === true;
      const hasDiscountType = item.discountType && item.discountType !== '';
      
      return hasDiscountAmount || hasDiscountPercent || isPromotional || hasDiscountType;
    });
    
    const totalTransactions = filteredData.length;
    const discountedTransactions = discountedItems.length;
    const totalRevenue = filteredData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalDiscounts = filteredData.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    
    // Calculate average discount percentage more accurately
    const avgDiscountPercent = discountedItems.length > 0 
      ? discountedItems.reduce((sum, item) => {
          // Calculate discount percentage if not available
          let discountPercent = item.discountPercentage || 0;
          if (discountPercent === 0 && item.discountAmount && item.paymentValue) {
            const originalPrice = item.paymentValue + item.discountAmount;
            discountPercent = originalPrice > 0 ? (item.discountAmount / originalPrice) * 100 : 0;
          }
          return sum + discountPercent;
        }, 0) / discountedItems.length 
      : 0;

    // Enhanced product analysis
    const productDiscounts = filteredData.reduce((acc, item) => {
      const product = item.cleanedProduct || 'Unknown';
      if (!acc[product]) {
        acc[product] = { 
          name: product,
          category: item.cleanedCategory || 'Unknown',
          totalDiscount: 0, 
          transactions: 0,
          discountedTransactions: 0,
          revenue: 0,
          customers: new Set()
        };
      }
      acc[product].totalDiscount += item.discountAmount || 0;
      acc[product].transactions += 1;
      acc[product].revenue += item.paymentValue || 0;
      acc[product].customers.add(item.customerEmail);
      
      if ((item.discountAmount || 0) > 0 || (item.discountPercentage || 0) > 0) {
        acc[product].discountedTransactions += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const topDiscountedProducts = Object.values(productDiscounts)
      .map((product: any) => ({
        ...product,
        uniqueCustomers: product.customers.size,
        discountRate: product.transactions > 0 ? (product.discountedTransactions / product.transactions) * 100 : 0
      }))
      .sort((a: any, b: any) => b.totalDiscount - a.totalDiscount)
      .slice(0, 10);

    // Enhanced monthly trends
    const monthlyData = filteredData.reduce((acc, item) => {
      if (!item.paymentDate) return acc;
      
      let month;
      try {
        // Handle various date formats
        if (item.paymentDate.includes('/')) {
          const [day, monthNum, year] = item.paymentDate.split(' ')[0].split('/');
          month = `${year}-${monthNum.padStart(2, '0')}`;
        } else {
          month = item.paymentDate.substring(0, 7);
        }
      } catch (e) {
        month = 'Unknown';
      }
      
      if (!acc[month]) {
        acc[month] = { 
          month, 
          revenue: 0, 
          discounts: 0, 
          transactions: 0,
          discountedTransactions: 0,
          discountRate: 0
        };
      }
      
      acc[month].revenue += item.paymentValue || 0;
      acc[month].discounts += item.discountAmount || 0;
      acc[month].transactions += 1;
      
      if ((item.discountAmount || 0) > 0 || (item.discountPercentage || 0) > 0) {
        acc[month].discountedTransactions += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const monthlyTrends = Object.values(monthlyData)
      .map((month: any) => ({
        ...month,
        discountRate: month.transactions > 0 ? (month.discountedTransactions / month.transactions) * 100 : 0
      }))
      .sort((a: any, b: any) => a.month.localeCompare(b.month));

    // Enhanced location breakdown
    const locationData = filteredData.reduce((acc, item) => {
      const location = item.calculatedLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = { 
          location, 
          revenue: 0, 
          discounts: 0, 
          transactions: 0,
          discountedTransactions: 0,
          customers: new Set()
        };
      }
      acc[location].revenue += item.paymentValue || 0;
      acc[location].discounts += item.discountAmount || 0;
      acc[location].transactions += 1;
      acc[location].customers.add(item.customerEmail);
      
      if ((item.discountAmount || 0) > 0) {
        acc[location].discountedTransactions += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const locationBreakdown = Object.values(locationData)
      .map((location: any) => ({
        ...location,
        uniqueCustomers: location.customers.size,
        discountRate: location.transactions > 0 ? (location.discountedTransactions / location.transactions) * 100 : 0,
        avgDiscountPerTransaction: location.discountedTransactions > 0 ? location.discounts / location.discountedTransactions : 0
      }));

    // Category breakdown
    const categoryData = filteredData.reduce((acc, item) => {
      const category = item.cleanedCategory || 'Unknown';
      if (!acc[category]) {
        acc[category] = {
          category,
          revenue: 0,
          discounts: 0,
          transactions: 0,
          discountedTransactions: 0
        };
      }
      acc[category].revenue += item.paymentValue || 0;
      acc[category].discounts += item.discountAmount || 0;
      acc[category].transactions += 1;
      
      if ((item.discountAmount || 0) > 0) {
        acc[category].discountedTransactions += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const categoryBreakdown = Object.values(categoryData)
      .map((category: any) => ({
        ...category,
        discountRate: category.transactions > 0 ? (category.discountedTransactions / category.transactions) * 100 : 0
      }))
      .sort((a: any, b: any) => b.discounts - a.discounts);

    // Staff performance
    const staffData = filteredData.reduce((acc, item) => {
      const staff = item.soldBy || 'Unknown';
      if (!acc[staff]) {
        acc[staff] = {
          name: staff,
          totalDiscounts: 0,
          transactions: 0,
          discountedTransactions: 0,
          revenue: 0
        };
      }
      acc[staff].totalDiscounts += item.discountAmount || 0;
      acc[staff].transactions += 1;
      acc[staff].revenue += item.paymentValue || 0;
      
      if ((item.discountAmount || 0) > 0) {
        acc[staff].discountedTransactions += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const staffPerformance = Object.values(staffData)
      .map((staff: any) => ({
        ...staff,
        discountRate: staff.transactions > 0 ? (staff.discountedTransactions / staff.transactions) * 100 : 0,
        avgDiscountPerTransaction: staff.discountedTransactions > 0 ? staff.totalDiscounts / staff.discountedTransactions : 0
      }))
      .sort((a: any, b: any) => b.totalDiscounts - a.totalDiscounts)
      .slice(0, 10);

    return {
      totalTransactions,
      discountedTransactions,
      totalRevenue,
      totalDiscounts,
      avgDiscountPercent,
      topDiscountedProducts,
      monthlyTrends,
      locationBreakdown,
      categoryBreakdown,
      staffPerformance
    };
  }, [filteredData]);

  // Metric Cards
  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(discountAnalysis.totalRevenue),
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      description: 'Total sales revenue',
      change: 12.5
    },
    {
      title: 'Total Discounts',
      value: formatCurrency(discountAnalysis.totalDiscounts),
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-600',
      description: 'Amount saved by customers',
      change: -8.3
    },
    {
      title: 'Discount Rate',
      value: formatPercentage(discountAnalysis.totalRevenue > 0 ? (discountAnalysis.totalDiscounts / discountAnalysis.totalRevenue) * 100 : 0),
      icon: Percent,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Discount as % of revenue',
      change: -2.1
    },
    {
      title: 'Discounted Sales',
      value: `${formatNumber(discountAnalysis.discountedTransactions)} / ${formatNumber(discountAnalysis.totalTransactions)}`,
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-violet-600',
      description: 'Sales with discounts applied',
      change: 5.7
    },
    {
      title: 'Avg Discount %',
      value: formatPercentage(discountAnalysis.avgDiscountPercent),
      icon: Package,
      gradient: 'from-orange-500 to-red-600',
      description: 'Average discount percentage',
      change: -1.2
    },
    {
      title: 'Penetration Rate',
      value: formatPercentage(discountAnalysis.totalTransactions > 0 ? (discountAnalysis.discountedTransactions / discountAnalysis.totalTransactions) * 100 : 0),
      icon: Users,
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Percentage of discounted sales',
      change: 3.4
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with View Tabs */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Percent className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Discounts & Promotions Analytics
                </CardTitle>
                <p className="text-gray-600">
                  Comprehensive discount impact analysis{selectedLocation !== 'all' && ` for ${selectedLocation}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['overview', 'details', 'analytics'] as const).map((view) => (
                <Button
                  key={view}
                  variant={selectedView === view ? 'default' : 'outline'}
                  onClick={() => setSelectedView(view)}
                  className="capitalize"
                >
                  {view}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {metricCards.map((metric, index) => (
          <Card 
            key={metric.title} 
            className="bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
          >
            <CardContent className="p-0">
              <div className={`bg-gradient-to-r ${metric.gradient} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
                  <metric.icon className="w-20 h-20" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <metric.icon className="w-6 h-6" />
                    <h3 className="font-semibold text-sm">{metric.title}</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{metric.value}</p>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm ${metric.change >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                    <span className="text-sm opacity-90">vs last period</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends Chart */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                Monthly Discount Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={discountAnalysis.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: string) => [
                    name === 'discounts' || name === 'revenue' ? formatCurrency(value) : 
                    name === 'discountRate' ? formatPercentage(value) : formatNumber(value),
                    name
                  ]} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                  <Line type="monotone" dataKey="discounts" stroke="#82ca9d" name="Discounts" />
                  <Line type="monotone" dataKey="discountRate" stroke="#ffc658" name="Discount Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Discounted Products */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Top Discounted Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {discountAnalysis.topDiscountedProducts.slice(0, 8).map((product: any, index) => (
                  <div 
                    key={product.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          <Badge variant="secondary" className="text-xs">{formatPercentage(product.discountRate)} discount rate</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(product.totalDiscount)}</p>
                      <p className="text-sm text-gray-600">{formatNumber(product.transactions)} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === 'details' && (
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Detailed Discount Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Discount %</TableHead>
                    <TableHead>Sold By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData
                    .filter(item => (item.discountAmount || 0) > 0)
                    .slice(0, 50)
                    .map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.paymentDate}</TableCell>
                      <TableCell className="font-medium">{item.customerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.cleanedProduct}</Badge>
                      </TableCell>
                      <TableCell>{item.calculatedLocation}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {formatCurrency(item.paymentValue || 0)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">
                          {formatCurrency(item.discountAmount || 0)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          {formatPercentage(item.discountPercentage || 0)}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.soldBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Performance */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Location Discount Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={discountAnalysis.locationBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Bar dataKey="discounts" fill="#8884d8" name="Discounts" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Analysis */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Category Discount Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {discountAnalysis.categoryBreakdown.map((category: any, index) => (
                  <div 
                    key={category.category}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{category.category}</p>
                      <p className="text-sm text-gray-600">
                        {formatNumber(category.transactions)} transactions • {formatPercentage(category.discountRate)} discount rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(category.discounts)}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(category.revenue)} revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staff Performance */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Staff Discount Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {discountAnalysis.staffPerformance.map((staff: any, index) => (
                  <div 
                    key={staff.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{staff.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatNumber(staff.discountedTransactions)} discounted sales • {formatPercentage(staff.discountRate)} rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(staff.totalDiscounts)}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(staff.avgDiscountPerTransaction)} avg</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Discount Rate Trends */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Monthly Discount Rate Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={discountAnalysis.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: string) => [
                    name === 'discountRate' ? formatPercentage(value) : formatNumber(value),
                    name
                  ]} />
                  <Bar dataKey="discountRate" fill="#ffc658" name="Discount Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};