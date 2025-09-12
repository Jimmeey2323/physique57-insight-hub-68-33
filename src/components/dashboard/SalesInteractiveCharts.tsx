import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar } from 'lucide-react';

interface SalesInteractiveChartsProps {
  data: SalesData[];
}

export const SalesInteractiveCharts: React.FC<SalesInteractiveChartsProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState('6m');
  const [activeChart, setActiveChart] = useState('revenue');
  const [productMetric, setProductMetric] = useState('revenue');

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      if (!item.paymentDate) return false;
      const itemDate = new Date(item.paymentDate);
      return itemDate >= startDate && itemDate <= now;
    });
  }, [data, timeRange]);

  // Monthly revenue trend data
  const monthlyRevenueData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const monthlyGroups = filteredData.reduce((acc, item) => {
      if (!item.paymentDate) return acc;
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: date.toLocaleDateString('en', { month: 'short', year: 'numeric' }),
          revenue: 0,
          transactions: 0,
          customers: new Set()
        };
      }
      
      acc[monthKey].revenue += item.paymentValue || 0;
      acc[monthKey].transactions += 1;
      acc[monthKey].customers.add(item.memberId);
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(monthlyGroups).map((group: any) => ({
      ...group,
      customers: group.customers.size
    })).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [filteredData]);

  // Top 10 products data
  const topProductsData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const productGroups = filteredData.reduce((acc, item) => {
      const product = item.cleanedProduct || 'Unknown Product';
      
      if (!acc[product]) {
        acc[product] = {
          name: product,
          revenue: 0,
          transactions: 0,
          customers: new Set(),
          units: 0
        };
      }
      
      acc[product].revenue += item.paymentValue || 0;
      acc[product].transactions += 1;
      acc[product].customers.add(item.memberId);
      acc[product].units += 1; // Each sale item is one unit
      
      return acc;
    }, {} as Record<string, any>);
    
    const products = Object.values(productGroups).map((product: any) => ({
      ...product,
      customers: product.customers.size
    }));
    
    // Sort by the selected metric
    let sortedProducts;
    switch (productMetric) {
      case 'transactions':
        sortedProducts = products.sort((a: any, b: any) => b.transactions - a.transactions);
        break;
      case 'customers':
        sortedProducts = products.sort((a: any, b: any) => b.customers - a.customers);
        break;
      case 'units':
        sortedProducts = products.sort((a: any, b: any) => b.units - a.units);
        break;
      default: // revenue
        sortedProducts = products.sort((a: any, b: any) => b.revenue - a.revenue);
    }
    
    return sortedProducts.slice(0, 10);
  }, [filteredData, productMetric]);

  // Category distribution data
  const categoryData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const categoryGroups = filteredData.reduce((acc, item) => {
      const category = item.cleanedCategory || 'Uncategorized';
      
      if (!acc[category]) {
        acc[category] = 0;
      }
      
      acc[category] += item.paymentValue || 0;
      
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryGroups)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#FFD700', '#FF6347', '#98FB98'];

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'revenue' || name === 'value') {
      return formatCurrency(Number(value));
    }
    return String(value);
  };

  const handleTimeRangeChange = useCallback((newRange: string) => {
    console.log('Time range changed to:', newRange);
    setTimeRange(newRange);
  }, []);

  const handleChartChange = useCallback((newChart: string) => {
    console.log('Chart changed to:', newChart);
    setActiveChart(newChart);
  }, []);

  const handleProductMetricChange = useCallback((newMetric: string) => {
    console.log('Product metric changed to:', newMetric);
    setProductMetric(newMetric);
  }, []);

  // Show loading state or empty state if no data
  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Interactive Sales Charts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-slate-600">No data available for charts</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (activeChart) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={formatTooltipValue} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'products':
        return (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={productMetric === 'revenue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleProductMetricChange('revenue')}
              >
                Revenue
              </Button>
              <Button
                variant={productMetric === 'transactions' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleProductMetricChange('transactions')}
              >
                Transactions
              </Button>
              <Button
                variant={productMetric === 'customers' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleProductMetricChange('customers')}
              >
                Customers
              </Button>
              <Button
                variant={productMetric === 'units' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleProductMetricChange('units')}
              >
                Units Sold
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topProductsData} margin={{ left: 20, right: 20, top: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis tickFormatter={(value) => {
                  if (productMetric === 'revenue') return formatCurrency(value);
                  return formatNumber(value);
                }} />
                <Tooltip formatter={(value, name) => {
                  if (productMetric === 'revenue') return formatCurrency(Number(value));
                  return formatNumber(Number(value));
                }} />
                <Bar dataKey={productMetric} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'categories':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltipValue} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Interactive Sales Charts
            </CardTitle>
          </div>
          
          {/* Time Range Buttons */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Time Range:
            </span>
            {[
              { key: '1m', label: 'Last Month' },
              { key: '3m', label: 'Last 3 Months' },
              { key: '6m', label: 'Last 6 Months' },
              { key: '1y', label: 'Last Year' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={timeRange === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          
          {/* Chart Type Buttons */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Chart Type:
            </span>
            <Button
              variant={activeChart === 'revenue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartChange('revenue')}
              className="flex items-center gap-1"
            >
              <LineChartIcon className="w-4 h-4" />
              Revenue Trend
            </Button>
            <Button
              variant={activeChart === 'products' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartChange('products')}
              className="flex items-center gap-1"
            >
              <BarChart3 className="w-4 h-4" />
              Top 10 Products
            </Button>
            <Button
              variant={activeChart === 'categories' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChartChange('categories')}
              className="flex items-center gap-1"
            >
              <PieChartIcon className="w-4 h-4" />
              Categories
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};
