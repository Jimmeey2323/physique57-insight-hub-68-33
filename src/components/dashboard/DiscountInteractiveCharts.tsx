
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Calendar, Package } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface DiscountInteractiveChartsProps {
  data: SalesData[];
  filters?: any;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#84cc16'];

export const DiscountInteractiveCharts: React.FC<DiscountInteractiveChartsProps> = ({ data, filters }) => {
  const [activeChart, setActiveChart] = useState('trends');

  const chartData = useMemo(() => {
    let filteredData = data.filter(item => (item.discountAmount || 0) > 0);

    // Apply filters
    if (filters) {
      filteredData = filteredData.filter(item => {
        if (filters.location && item.calculatedLocation !== filters.location) return false;
        if (filters.category && item.cleanedCategory !== filters.category) return false;
        if (filters.product && item.cleanedProduct !== filters.product) return false;
        if (filters.soldBy && (item.soldBy === '-' ? 'Online/System' : item.soldBy) !== filters.soldBy) return false;
        if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) return false;
        if (filters.minDiscountAmount && (item.discountAmount || 0) < filters.minDiscountAmount) return false;
        if (filters.maxDiscountAmount && (item.discountAmount || 0) > filters.maxDiscountAmount) return false;
        if (filters.minDiscountPercent && (item.discountPercentage || 0) < filters.minDiscountPercent) return false;
        if (filters.maxDiscountPercent && (item.discountPercentage || 0) > filters.maxDiscountPercent) return false;
        if (filters.dateRange?.from || filters.dateRange?.to) {
          const itemDate = new Date(item.paymentDate);
          if (filters.dateRange.from && itemDate < filters.dateRange.from) return false;
          if (filters.dateRange.to && itemDate > filters.dateRange.to) return false;
        }
        return true;
      });
    }

    // Monthly trends
    const monthlyData = filteredData.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          transactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          avgDiscount: 0
        };
      }
      
      acc[monthKey].transactions += 1;
      acc[monthKey].totalDiscount += item.discountAmount || 0;
      acc[monthKey].totalRevenue += item.paymentValue || 0;
      
      return acc;
    }, {} as Record<string, any>);

    const monthlyTrends = Object.values(monthlyData)
      .map((item: any) => ({
        ...item,
        avgDiscount: item.transactions > 0 ? item.totalDiscount / item.transactions : 0,
        discountRate: item.totalRevenue > 0 ? (item.totalDiscount / (item.totalRevenue + item.totalDiscount)) * 100 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Category distribution
    const categoryData = filteredData.reduce((acc, item) => {
      const category = item.cleanedCategory || 'Unknown';
      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
          transactions: 0
        };
      }
      acc[category].value += item.discountAmount || 0;
      acc[category].transactions += 1;
      return acc;
    }, {} as Record<string, any>);

    const categoryDistribution = Object.values(categoryData)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 8);

    // Discount range analysis
    const discountRanges = [
      { min: 0, max: 100, label: '₹0-100' },
      { min: 100, max: 500, label: '₹100-500' },
      { min: 500, max: 1000, label: '₹500-1K' },
      { min: 1000, max: 2500, label: '₹1K-2.5K' },
      { min: 2500, max: 5000, label: '₹2.5K-5K' },
      { min: 5000, max: Infinity, label: '₹5K+' }
    ];

    const rangeAnalysis = discountRanges.map(range => {
      const itemsInRange = filteredData.filter(item => {
        const discount = item.discountAmount || 0;
        return discount >= range.min && discount < range.max;
      });

      return {
        range: range.label,
        transactions: itemsInRange.length,
        totalDiscount: itemsInRange.reduce((sum, item) => sum + (item.discountAmount || 0), 0),
        avgDiscount: itemsInRange.length > 0 ? itemsInRange.reduce((sum, item) => sum + (item.discountAmount || 0), 0) / itemsInRange.length : 0,
        totalRevenue: itemsInRange.reduce((sum, item) => sum + (item.paymentValue || 0), 0)
      };
    });

    // Scatter plot data
    const scatterData = filteredData
      .slice(0, 200)
      .map(item => ({
        discountAmount: item.discountAmount || 0,
        discountPercent: item.discountPercentage || 0,
        revenue: item.paymentValue || 0,
        category: item.cleanedCategory || 'Unknown'
      }));

    return {
      monthlyTrends,
      categoryDistribution,
      rangeAnalysis,
      scatterData
    };
  }, [data, filters]);

  return (
    <div className="space-y-6">
      <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200 p-1 rounded-xl shadow-sm h-auto">
          <TabsTrigger value="trends" className="text-sm px-4 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="distribution" className="text-sm px-4 py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <PieChartIcon className="w-4 h-4 mr-2" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="ranges" className="text-sm px-4 py-3 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Ranges
          </TabsTrigger>
          <TabsTrigger value="correlation" className="text-sm px-4 py-3 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2" />
            Correlation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Monthly Discount Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'discountRate' ? `${(value as number).toFixed(1)}%` : formatCurrency(value as number),
                      name === 'totalDiscount' ? 'Total Discount' : 
                      name === 'totalRevenue' ? 'Revenue' : 'Discount Rate'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalDiscount" fill="#3b82f6" name="Total Discount" />
                  <Line yAxisId="right" type="monotone" dataKey="discountRate" stroke="#ef4444" strokeWidth={3} name="Discount Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-purple-50/30 to-violet-50/20 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-700 to-violet-700 bg-clip-text text-transparent flex items-center gap-2">
                <PieChartIcon className="w-6 h-6 text-purple-600" />
                Discount Distribution by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranges" className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-green-600" />
                Discount Range Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.rangeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(value as number),
                      name === 'totalDiscount' ? 'Total Discount' : 'Average Discount'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="totalDiscount" fill="#10b981" name="Total Discount" />
                  <Bar dataKey="avgDiscount" fill="#06b6d4" name="Average Discount" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent flex items-center gap-2">
                <Activity className="w-6 h-6 text-orange-600" />
                Discount Amount vs Percentage Correlation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={chartData.scatterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="discountPercent" 
                    name="Discount %" 
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    dataKey="discountAmount" 
                    name="Discount Amount"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'discountPercent' ? `${value}%` : formatCurrency(value as number),
                      name === 'discountPercent' ? 'Discount %' : 'Discount Amount'
                    ]}
                  />
                  <Scatter dataKey="discountAmount" fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
