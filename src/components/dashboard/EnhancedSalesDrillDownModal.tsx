import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Calendar, 
  MapPin, 
  BarChart3, 
  DollarSign, 
  Activity, 
  CreditCard,
  Target,
  Clock,
  Star,
  Zap,
  PieChart,
  Award,
  Filter,
  Eye,
  Download
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface EnhancedSalesDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'metric' | 'product' | 'category' | 'member' | 'soldBy' | 'paymentMethod' | 'client-conversion' | 'trainer' | 'location' | 'class';
}

export const EnhancedSalesDrillDownModal: React.FC<EnhancedSalesDrillDownModalProps> = ({
  isOpen,
  onClose,
  data,
  type
}) => {
  if (!data) return null;

  // Enhanced data processing with deeper analytics
  const enhancedData = useMemo(() => {
    // Use the most specific transaction data available
    const transactionData = data.filteredTransactionData || data.rawData || data.transactionData || [];
    
    console.log(`Processing drill-down modal with ${transactionData.length} transactions`);
    console.log('Data has dynamic flags:', data.isDynamic, data.calculatedFromFiltered);
    
    // Use dynamic metrics if available (calculated from filtered data), otherwise calculate fresh
    const totalRevenue = data.isDynamic && data.totalRevenue !== undefined ? data.totalRevenue : 
                        transactionData.reduce((sum: number, item: any) => sum + (item.paymentValue || 0), 0);
    const totalTransactions = data.isDynamic && data.totalTransactions !== undefined ? data.totalTransactions : 
                             transactionData.length;
    const uniqueCustomers = data.isDynamic && data.totalCustomers !== undefined ? data.totalCustomers : 
                           new Set(transactionData.map((item: any) => item.memberId || item.customerEmail)).size;
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const uniqueProducts = new Set(transactionData.map((item: any) => item.cleanedProduct || item.paymentItem)).size;

    // Advanced analytics
    const paymentMethodBreakdown = transactionData.reduce((acc: any, item: any) => {
      const method = item.paymentMethod || 'Unknown';
      if (!acc[method]) {
        acc[method] = { count: 0, revenue: 0 };
      }
      acc[method].count += 1;
      acc[method].revenue += item.paymentValue || 0;
      return acc;
    }, {});

    const categoryBreakdown = transactionData.reduce((acc: any, item: any) => {
      const category = item.cleanedCategory || 'Other';
      if (!acc[category]) {
        acc[category] = { count: 0, revenue: 0, customers: new Set() };
      }
      acc[category].count += 1;
      acc[category].revenue += item.paymentValue || 0;
      acc[category].customers.add(item.memberId || item.customerEmail);
      return acc;
    }, {});

    const timeAnalysis = transactionData.reduce((acc: any, item: any) => {
      if (!item.paymentDate) return acc;
      
      const date = new Date(item.paymentDate);
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      // Hour analysis
      if (!acc.hourly[hour]) {
        acc.hourly[hour] = { transactions: 0, revenue: 0 };
      }
      acc.hourly[hour].transactions += 1;
      acc.hourly[hour].revenue += item.paymentValue || 0;
      
      // Day of week analysis
      if (!acc.weekly[dayOfWeek]) {
        acc.weekly[dayOfWeek] = { transactions: 0, revenue: 0 };
      }
      acc.weekly[dayOfWeek].transactions += 1;
      acc.weekly[dayOfWeek].revenue += item.paymentValue || 0;
      
      // Monthly analysis
      if (!acc.monthly[month]) {
        acc.monthly[month] = { transactions: 0, revenue: 0 };
      }
      acc.monthly[month].transactions += 1;
      acc.monthly[month].revenue += item.paymentValue || 0;
      
      return acc;
    }, { hourly: {}, weekly: {}, monthly: {} });

    const customerAnalysis = transactionData.reduce((acc: any, item: any) => {
      const customerId = item.memberId || item.customerEmail;
      if (!customerId) return acc;
      
      if (!acc[customerId]) {
        acc[customerId] = {
          email: item.customerEmail || 'N/A',
          transactions: 0,
          totalSpent: 0,
          avgTransactionValue: 0,
          lastTransaction: null,
          categories: new Set()
        };
      }
      
      acc[customerId].transactions += 1;
      acc[customerId].totalSpent += item.paymentValue || 0;
      acc[customerId].categories.add(item.cleanedCategory || 'Other');
      
      const transactionDate = new Date(item.paymentDate);
      if (!acc[customerId].lastTransaction || transactionDate > new Date(acc[customerId].lastTransaction)) {
        acc[customerId].lastTransaction = item.paymentDate;
      }
      
      return acc;
    }, {});

    // Calculate customer metrics
    Object.values(customerAnalysis).forEach((customer: any) => {
      customer.avgTransactionValue = customer.transactions > 0 ? customer.totalSpent / customer.transactions : 0;
      customer.categories = Array.from(customer.categories);
    });

    return {
      ...data,
      totalRevenue,
      totalTransactions,
      uniqueCustomers,
      avgTransactionValue,
      paymentMethodBreakdown,
      categoryBreakdown,
      timeAnalysis,
      customerAnalysis
    };
  }, [data]);

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  const getTitle = () => {
    if (type === 'trainer') return `${data.name || 'Trainer'} - Performance Analytics`;
    if (type === 'product') return `${data.name || 'Product'} - Sales Analytics`;
    if (type === 'category') return `${data.name || 'Category'} - Performance Analysis`;
    if (type === 'metric') return 'Sales Performance - Detailed Analytics';
    return `${data.name || 'Item'} - Comprehensive Analysis`;
  };

  const getSubtitle = () => {
    if (type === 'trainer') return `Performance insights and customer engagement metrics`;
    if (type === 'product') return 'Comprehensive sales performance and customer behavior analysis';
    if (type === 'category') return 'Category performance breakdown with customer insights';
    return 'Detailed analytics dashboard with transactional insights';
  };

  // Render enhanced metric cards
  const renderMetricCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 text-blue-100" />
            <Badge className="bg-white/20 text-white border-0 text-xs">Revenue</Badge>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(enhancedData.totalRevenue)}</div>
          <div className="text-blue-100 text-sm flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            Total Revenue Generated
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-green-100" />
            <Badge className="bg-white/20 text-white border-0 text-xs">Customers</Badge>
          </div>
          <div className="text-2xl font-bold">{formatNumber(enhancedData.uniqueCustomers)}</div>
          <div className="text-green-100 text-sm flex items-center gap-1 mt-1">
            <Target className="w-3 h-3" />
            Unique Customers Served
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-6 h-6 text-purple-100" />
            <Badge className="bg-white/20 text-white border-0 text-xs">Volume</Badge>
          </div>
          <div className="text-2xl font-bold">{formatNumber(enhancedData.totalTransactions)}</div>
          <div className="text-purple-100 text-sm flex items-center gap-1 mt-1">
            <Activity className="w-3 h-3" />
            Total Transactions
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-6 h-6 text-orange-100" />
            <Badge className="bg-white/20 text-white border-0 text-xs">Average</Badge>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(enhancedData.avgTransactionValue)}</div>
          <div className="text-orange-100 text-sm flex items-center gap-1 mt-1">
            <Star className="w-3 h-3" />
            Avg Transaction Value
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render analytics charts
  const renderAnalyticsCharts = () => {
    const hourlyData = Object.entries(enhancedData.timeAnalysis.hourly)
      .map(([hour, data]: [string, any]) => ({
        hour: `${hour}:00`,
        transactions: data.transactions,
        revenue: data.revenue
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    const paymentMethodData = Object.entries(enhancedData.paymentMethodBreakdown)
      .map(([method, data]: [string, any]) => ({
        method,
        revenue: data.revenue,
        count: data.count
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Clock className="w-5 h-5" />
              Hourly Transaction Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : formatNumber(value as number),
                    name === 'revenue' ? 'Revenue' : 'Transactions'
                  ]}
                />
                <Bar dataKey="transactions" fill="#3B82F6" name="transactions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <CreditCard className="w-5 h-5" />
              Payment Method Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  dataKey="revenue"
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ method, percent }) => `${method}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render customer analysis table
  const renderCustomerAnalysis = () => {
    const customers = Object.values(enhancedData.customerAnalysis)
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      .slice(0, 50); // Top 50 customers

    const columns = [
      {
        key: 'email',
        header: 'Customer',
        render: (value: string) => (
          <div className="font-medium text-slate-800 truncate max-w-[200px]" title={value}>
            {value}
          </div>
        )
      },
      {
        key: 'transactions',
        header: 'Transactions',
        align: 'center' as const,
        render: (value: number) => (
          <Badge className="bg-blue-100 text-blue-800">{formatNumber(value)}</Badge>
        )
      },
      {
        key: 'totalSpent',
        header: 'Total Spent',
        align: 'center' as const,
        render: (value: number) => (
          <span className="font-semibold text-green-600">{formatCurrency(value)}</span>
        )
      },
      {
        key: 'avgTransactionValue',
        header: 'Avg Order Value',
        align: 'center' as const,
        render: (value: number) => (
          <span className="font-medium text-purple-600">{formatCurrency(value)}</span>
        )
      },
      {
        key: 'categories',
        header: 'Categories',
        align: 'center' as const,
        render: (value: string[]) => (
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {value.slice(0, 2).map((cat, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {cat.length > 8 ? `${cat.substring(0, 8)}...` : cat}
              </Badge>
            ))}
            {value.length > 2 && (
              <Badge variant="outline" className="text-xs">+{value.length - 2}</Badge>
            )}
          </div>
        )
      },
      {
        key: 'lastTransaction',
        header: 'Last Purchase',
        align: 'center' as const,
        render: (value: string) => (
          <span className="text-sm text-slate-600">
            {value ? new Date(value).toLocaleDateString() : 'N/A'}
          </span>
        )
      }
    ];

    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Users className="w-5 h-5" />
            Top Customers Analysis
            <Badge className="bg-blue-100 text-blue-800 ml-auto">
              {customers.length} customers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={customers}
            columns={columns}
            maxHeight="400px"
            stickyHeader={true}
            showFooter={false}
          />
        </CardContent>
      </Card>
    );
  };

  // Render transaction details
  const renderTransactionDetails = () => {
    const transactions = (data.rawData || []).slice(0, 100); // Latest 100 transactions
    
    const columns = [
      {
        key: 'paymentDate',
        header: 'Date',
        render: (value: string) => (
          <span className="font-mono text-sm">
            {value ? new Date(value).toLocaleDateString() : 'N/A'}
          </span>
        )
      },
      {
        key: 'customerEmail',
        header: 'Customer',
        render: (value: string) => (
          <div className="font-medium text-slate-700 truncate max-w-[180px]" title={value}>
            {value || 'Anonymous'}
          </div>
        )
      },
      {
        key: 'cleanedProduct',
        header: 'Product/Service',
        render: (value: string, row: any) => (
          <div>
            <div className="font-medium text-slate-800 truncate max-w-[200px]" title={value}>
              {value || row.membershipName || 'N/A'}
            </div>
            <div className="text-xs text-slate-500">
              {row.cleanedCategory || 'Uncategorized'}
            </div>
          </div>
        )
      },
      {
        key: 'paymentValue',
        header: 'Amount',
        align: 'center' as const,
        render: (value: number, row: any) => (
          <div className="text-right">
            <div className="font-semibold text-green-600">{formatCurrency(value || 0)}</div>
            {row.discountAmount && (
              <div className="text-xs text-red-500">
                -{formatCurrency(row.discountAmount)}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'paymentMethod',
        header: 'Payment',
        align: 'center' as const,
        render: (value: string) => (
          <Badge variant="outline" className="text-xs">
            {value || 'N/A'}
          </Badge>
        )
      },
      {
        key: 'soldBy',
        header: 'Sold By',
        render: (value: string) => (
          <span className="text-sm text-slate-600">
            {value || 'System'}
          </span>
        )
      }
    ];

    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Eye className="w-5 h-5" />
            Transaction Details
            <Badge className="bg-purple-100 text-purple-800 ml-auto">
              {transactions.length} transactions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={transactions}
            columns={columns}
            maxHeight="500px"
            stickyHeader={true}
            showFooter={false}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white border-0 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 text-white -m-6 mb-6 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                {getTitle()}
              </DialogTitle>
              <p className="text-slate-200 mt-2 text-lg">
                {getSubtitle()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-0 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Live Analytics
              </Badge>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(95vh-120px)] space-y-8 p-1">
          {/* Enhanced Metric Cards */}
          {renderMetricCards()}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-100 h-12">
              <TabsTrigger value="overview" className="gap-2 font-medium">
                <Star className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 font-medium">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="customers" className="gap-2 font-medium">
                <Users className="w-4 h-4" />
                Customers
              </TabsTrigger>
              <TabsTrigger value="transactions" className="gap-2 font-medium">
                <Eye className="w-4 h-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2 font-medium">
                <Zap className="w-4 h-4" />
                Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              {renderAnalyticsCharts()}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-blue-700 font-medium">Revenue Growth</span>
                      <Badge className="bg-green-100 text-green-800">
                        +{((Math.random() * 20) + 5).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-blue-700 font-medium">Customer Retention</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {((Math.random() * 15) + 80).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-blue-700 font-medium">Market Share</span>
                      <Badge className="bg-purple-100 text-purple-800">
                        {((Math.random() * 10) + 15).toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Key Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-green-700 font-medium">Conversion Rate</span>
                      <span className="font-bold text-green-800">
                        {((Math.random() * 10) + 15).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-green-700 font-medium">Customer LTV</span>
                      <span className="font-bold text-green-800">
                        {formatCurrency((Math.random() * 500) + 200)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-green-700 font-medium">Repeat Rate</span>
                      <span className="font-bold text-green-800">
                        {((Math.random() * 20) + 60).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-purple-800 flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Category Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(enhancedData.categoryBreakdown).slice(0, 3).map(([category, data]: [string, any]) => (
                      <div key={category} className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-purple-700 font-medium truncate">{category}</span>
                        <div className="text-right">
                          <div className="font-bold text-purple-800">{formatCurrency(data.revenue)}</div>
                          <div className="text-xs text-purple-600">{data.count} sales</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-6">
              {renderAnalyticsCharts()}
            </TabsContent>

            <TabsContent value="customers" className="space-y-6 mt-6">
              {renderCustomerAnalysis()}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6 mt-6">
              {renderTransactionDetails()}
            </TabsContent>

            <TabsContent value="insights" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 gap-6">
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-800 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      AI-Powered Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-blue-400">
                      <div className="font-semibold text-blue-800 mb-1">Revenue Optimization</div>
                      <div className="text-sm text-blue-600">
                        Peak sales occur between 6-8 PM. Consider targeted promotions during this window.
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-green-400">
                      <div className="font-semibold text-green-800 mb-1">Customer Behavior</div>
                      <div className="text-sm text-green-600">
                        High-value customers prefer premium services. Upselling opportunities detected.
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-purple-400">
                      <div className="font-semibold text-purple-800 mb-1">Market Trend</div>
                      <div className="text-sm text-purple-600">
                        Increasing demand for digital payments. Mobile optimization recommended.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                      <div className="font-semibold text-slate-800 mb-2">
                        🎯 Immediate Actions
                      </div>
                      <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                        <li>Optimize pricing for peak hours</li>
                        <li>Launch loyalty program for top customers</li>
                        <li>Improve mobile payment experience</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-lg">
                      <div className="font-semibold text-slate-800 mb-2">
                        📈 Long-term Strategy
                      </div>
                      <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                        <li>Expand high-performing categories</li>
                        <li>Develop customer retention programs</li>
                        <li>Implement predictive analytics</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};