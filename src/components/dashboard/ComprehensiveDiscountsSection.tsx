import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingDown, Percent, DollarSign, Package, Target, Calendar, MapPin, 
  Users, ShoppingCart, Tag, Gift, Star, AlertCircle, TrendingUp
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface ComprehensiveDiscountsSectionProps {
  data: any[];
  filters: any;
  onDrillDown: (title: string, data: any[]) => void;
}

const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];

export const ComprehensiveDiscountsSection: React.FC<ComprehensiveDiscountsSectionProps> = ({
  data,
  filters,
  onDrillDown
}) => {
  // Enhanced discount analytics
  const discountAnalytics = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Filter data with actual discounts
    const discountedItems = data.filter(item => 
      (item.discountAmount && item.discountAmount > 0) || 
      (item.discountPercentage && item.discountPercentage > 0)
    );

    // Monthly discount trends
    const monthlyTrends = data.reduce((acc, item) => {
      if (!item.paymentDate) return acc;
      
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          totalSales: 0,
          totalDiscounts: 0,
          discountCount: 0,
          revenue: 0
        };
      }
      
      acc[monthKey].totalSales += 1;
      acc[monthKey].revenue += item.paymentValue || 0;
      
      if ((item.discountAmount || 0) > 0) {
        acc[monthKey].totalDiscounts += item.discountAmount;
        acc[monthKey].discountCount += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Product-wise discount analysis
    const productDiscounts = data.reduce((acc, item) => {
      const product = item.cleanedProduct || 'Unknown';
      
      if (!acc[product]) {
        acc[product] = {
          product,
          totalSales: 0,
          discountedSales: 0,
          totalDiscount: 0,
          avgDiscountPercent: 0,
          revenue: 0
        };
      }
      
      acc[product].totalSales += 1;
      acc[product].revenue += item.paymentValue || 0;
      
      if ((item.discountAmount || 0) > 0) {
        acc[product].discountedSales += 1;
        acc[product].totalDiscount += item.discountAmount;
        acc[product].avgDiscountPercent += item.discountPercentage || 0;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and percentages
    Object.values(productDiscounts).forEach((product: any) => {
      product.discountRate = product.totalSales > 0 ? (product.discountedSales / product.totalSales) * 100 : 0;
      product.avgDiscountPercent = product.discountedSales > 0 ? product.avgDiscountPercent / product.discountedSales : 0;
    });

    // Category-wise analysis
    const categoryDiscounts = data.reduce((acc, item) => {
      const category = item.cleanedCategory || 'Unknown';
      
      if (!acc[category]) {
        acc[category] = {
          category,
          totalSales: 0,
          discountedSales: 0,
          totalDiscount: 0,
          revenue: 0
        };
      }
      
      acc[category].totalSales += 1;
      acc[category].revenue += item.paymentValue || 0;
      
      if ((item.discountAmount || 0) > 0) {
        acc[category].discountedSales += 1;
        acc[category].totalDiscount += item.discountAmount;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Payment method analysis
    const paymentMethodDiscounts = data.reduce((acc, item) => {
      const method = item.paymentMethod || 'Unknown';
      
      if (!acc[method]) {
        acc[method] = {
          method,
          totalSales: 0,
          discountedSales: 0,
          totalDiscount: 0,
          revenue: 0
        };
      }
      
      acc[method].totalSales += 1;
      acc[method].revenue += item.paymentValue || 0;
      
      if ((item.discountAmount || 0) > 0) {
        acc[method].discountedSales += 1;
        acc[method].totalDiscount += item.discountAmount;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return {
      monthlyTrends: Object.values(monthlyTrends).sort((a: any, b: any) => a.month.localeCompare(b.month)),
      productDiscounts: Object.values(productDiscounts).sort((a: any, b: any) => b.totalDiscount - a.totalDiscount),
      categoryDiscounts: Object.values(categoryDiscounts).sort((a: any, b: any) => b.totalDiscount - a.totalDiscount),
      paymentMethodDiscounts: Object.values(paymentMethodDiscounts).sort((a: any, b: any) => b.totalDiscount - a.totalDiscount),
      discountedItems,
      totalDiscounts: data.reduce((sum, item) => sum + (item.discountAmount || 0), 0),
      totalRevenue: data.reduce((sum, item) => sum + (item.paymentValue || 0), 0),
      discountRate: data.length > 0 ? (discountedItems.length / data.length) * 100 : 0
    };
  }, [data]);

  if (!discountAnalytics) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No discount data available for analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-200 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Total Discounts</p>
                <p className="text-xl font-bold text-red-800">{formatCurrency(discountAnalytics.totalDiscounts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Percent className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Discount Rate</p>
                <p className="text-xl font-bold text-blue-800">{discountAnalytics.discountRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Total Revenue</p>
                <p className="text-xl font-bold text-green-800">{formatCurrency(discountAnalytics.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Target className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Discounted Sales</p>
                <p className="text-xl font-bold text-purple-800">{formatNumber(discountAnalytics.discountedItems.length)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="methods" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Monthly Discount Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={discountAnalytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => [
                    String(name).includes('Discount') ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                    name
                  ]} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalDiscounts" fill="#ff6b6b" name="Total Discounts" />
                  <Line yAxisId="right" type="monotone" dataKey="discountCount" stroke="#4ecdc4" strokeWidth={3} name="Discount Count" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Product Discount Analysis
                <Badge variant="outline" className="ml-auto">
                  Top {Math.min(10, discountAnalytics.productDiscounts.length)} Products
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Total Sales</TableHead>
                    <TableHead className="text-center">Discounted Sales</TableHead>
                    <TableHead className="text-center">Discount Rate</TableHead>
                    <TableHead className="text-right">Total Discount</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountAnalytics.productDiscounts.slice(0, 10).map((product: any, index) => (
                    <TableRow 
                      key={product.product} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onDrillDown(`Product: ${product.product}`, data.filter(item => item.cleanedProduct === product.product))}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          {product.product}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{formatNumber(product.totalSales)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{formatNumber(product.discountedSales)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={product.discountRate > 20 ? "destructive" : product.discountRate > 10 ? "default" : "outline"}>
                          {product.discountRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {formatCurrency(product.totalDiscount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={discountAnalytics.categoryDiscounts.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalDiscount"
                    >
                      {discountAnalytics.categoryDiscounts.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  Category Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Sales</TableHead>
                      <TableHead className="text-right">Total Discount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discountAnalytics.categoryDiscounts.slice(0, 6).map((category: any, index) => (
                      <TableRow 
                        key={category.category}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => onDrillDown(`Category: ${category.category}`, data.filter(item => item.cleanedCategory === category.category))}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            {category.category}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{formatNumber(category.totalSales)}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(category.totalDiscount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                Payment Method Discount Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={discountAnalytics.paymentMethodDiscounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name]} />
                  <Legend />
                  <Bar dataKey="totalDiscount" fill="#ff6b6b" name="Total Discount" />
                  <Bar dataKey="revenue" fill="#4ecdc4" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};