import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
  Zap
} from 'lucide-react';

interface ModernDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'metric' | 'product' | 'category' | 'member' | 'soldBy' | 'paymentMethod' | 'client-conversion' | 'trainer' | 'location' | 'class';
}

export const ModernDrillDownModal: React.FC<ModernDrillDownModalProps> = ({
  isOpen,
  onClose,
  data,
  type
}) => {
  if (!data) return null;

  // Helper functions
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  const getSpecificData = () => {
    // Use the most specific transaction data available (prioritize the new specific data)
    const rawTransactionData = data.filteredTransactionData || data.rawData || data.transactionData || [];
    
    // Extract targeted data based on the clicked element
    if (type === 'product' && data.name) {
      // For product drill-down, use already filtered data or filter by product name
      const productName = data.name;
      let filteredData = rawTransactionData;
      
      // If we don't already have filtered data, filter it ourselves
      if (!data.filteredTransactionData && rawTransactionData.length > 0) {
        filteredData = rawTransactionData.filter((item: any) => 
          item.productName === productName || 
          item.membershipName === productName ||
          item.itemName === productName ||
          item.cleanedProduct === productName ||
          item.paymentItem === productName
        );
      }
      
      console.log(`ModernDrillDownModal: Using ${filteredData.length} filtered transactions for product ${productName}`);
      
      return {
        ...data,
        filteredData,
        specificRevenue: data.specificRevenue || filteredData.reduce((sum: number, item: any) => sum + (item.paymentValue || 0), 0),
        specificTransactions: data.specificTransactions || filteredData.length,
        specificCustomers: data.specificCustomers || new Set(filteredData.map((item: any) => item.memberId || item.customerEmail)).size
      };
    }
    
    if (type === 'category' && data.name) {
      // For category drill-down, use already filtered data or filter by category name
      const categoryName = data.name;
      let filteredData = rawTransactionData;
      
      // If we don't already have filtered data, filter it ourselves
      if (!data.filteredTransactionData && rawTransactionData.length > 0) {
        filteredData = rawTransactionData.filter((item: any) => 
          item.cleanedCategory === categoryName ||
          item.category === categoryName
        );
      }
      
      console.log(`ModernDrillDownModal: Using ${filteredData.length} filtered transactions for category ${categoryName}`);
      
      return {
        ...data,
        filteredData,
        specificRevenue: data.specificRevenue || filteredData.reduce((sum: number, item: any) => sum + (item.paymentValue || 0), 0),
        specificTransactions: data.specificTransactions || filteredData.length,
        specificCustomers: data.specificCustomers || new Set(filteredData.map((item: any) => item.memberId || item.customerEmail)).size
      };
    }

    if (type === 'trainer' && data.teacherName) {
      // For trainer drill-down, focus on that specific trainer
      const trainerData = {
        name: data.teacherName,
        location: data.location,
        classType: data.classType || 'Mixed',
        totalSessions: data.sessions || data.totalSessions || 0,
        totalRevenue: data.revenue || data.totalPaid || 0,
        totalCustomers: data.customers || data.totalCustomers || 0,
        utilization: data.utilization || 0,
        avgCheckedIn: data.avgCheckedIn || 0,
        cancellationRate: data.cancellationRate || 0
      };
      return trainerData;
    }

    // Default case - return data with specific metrics if available
    return {
      ...data,
      filteredData: rawTransactionData,
      specificRevenue: data.specificRevenue,
      specificTransactions: data.specificTransactions,
      specificCustomers: data.specificCustomers
    };
  };

  const specificData = getSpecificData();

  const renderMetricCards = () => {
    const revenue = safeNumber(specificData.specificRevenue || specificData.totalRevenue || specificData.revenue || specificData.grossRevenue);
    const transactions = safeNumber(specificData.specificTransactions || specificData.transactions || specificData.totalTransactions);
    const customers = safeNumber(specificData.specificCustomers || specificData.uniqueMembers || specificData.totalCustomers || specificData.customers);
    const growth = safeNumber(specificData.totalChange || specificData.change || specificData.growth);

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-blue-100" />
              <Badge className="bg-white/20 text-white border-0">Revenue</Badge>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>
            <div className="text-blue-100 text-sm">Total Revenue</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-green-100" />
              <Badge className="bg-white/20 text-white border-0">Customers</Badge>
            </div>
            <div className="text-2xl font-bold">{formatNumber(customers)}</div>
            <div className="text-green-100 text-sm">Unique Customers</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-5 h-5 text-purple-100" />
              <Badge className="bg-white/20 text-white border-0">Volume</Badge>
            </div>
            <div className="text-2xl font-bold">{formatNumber(transactions)}</div>
            <div className="text-purple-100 text-sm">Transactions</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              {growth >= 0 ? (
                <TrendingUp className="w-5 h-5 text-orange-100" />
              ) : (
                <TrendingDown className="w-5 h-5 text-orange-100" />
              )}
              <Badge className="bg-white/20 text-white border-0">Growth</Badge>
            </div>
            <div className="text-2xl font-bold">
              {growth !== 0 ? `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-orange-100 text-sm">Performance</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTrainerSpecificData = () => {
    if (type !== 'trainer') return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Activity className="w-5 h-5" />
              Class Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-slate-600">Total Sessions</div>
                <div className="text-xl font-bold text-slate-800">{formatNumber(specificData.totalSessions)}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-slate-600">Avg Check-in</div>
                <div className="text-xl font-bold text-blue-600">{formatNumber(specificData.avgCheckedIn)}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-slate-600">Utilization</div>
                <div className={`text-xl font-bold ${specificData.utilization >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                  {formatPercentage(specificData.utilization / 100)}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-slate-600">Cancellation Rate</div>
                <div className={`text-xl font-bold ${specificData.cancellationRate <= 10 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(specificData.cancellationRate / 100)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Target className="w-5 h-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white rounded-lg border-l-4 border-blue-400">
              <div className="text-sm font-medium text-blue-800">Class Type</div>
              <div className="text-blue-600">{specificData.classType}</div>
            </div>
            <div className="p-3 bg-white rounded-lg border-l-4 border-green-400">
              <div className="text-sm font-medium text-green-800">Revenue/Session</div>
              <div className="text-green-600">
                {formatCurrency(specificData.totalSessions > 0 ? specificData.totalRevenue / specificData.totalSessions : 0)}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border-l-4 border-purple-400">
              <div className="text-sm font-medium text-purple-800">Customer/Session</div>
              <div className="text-purple-600">
                {(specificData.totalSessions > 0 ? specificData.totalCustomers / specificData.totalSessions : 0).toFixed(1)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTransactionHistory = () => {
    const transactionData = specificData.filteredData || specificData.rawData || [];
    
    if (transactionData.length === 0) return null;

    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <BarChart3 className="w-5 h-5" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {transactionData.slice(0, 20).map((transaction: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-slate-800">
                    {transaction.membershipName || transaction.productName || transaction.itemName || 'Transaction'}
                  </div>
                  <div className="text-sm text-slate-600">
                    {transaction.customerEmail || transaction.memberId} • {transaction.date || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">
                    {formatCurrency(transaction.paymentValue || transaction.amount || 0)}
                  </div>
                  <div className="text-sm text-slate-600">
                    {transaction.paymentMethod || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {transactionData.length > 20 && (
            <div className="mt-4 text-center text-sm text-slate-600">
              Showing 20 of {transactionData.length} transactions
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const getTitle = () => {
    if (type === 'trainer') return `${specificData.name} - Trainer Performance`;
    if (type === 'product') return `${specificData.name} - Product Analysis`;
    if (type === 'class') return `${specificData.classType || 'Class'} - Detailed Analytics`;
    return `${specificData.name || 'Item'} - Performance Analysis`;
  };

  const getSubtitle = () => {
    if (type === 'trainer') return `${specificData.location} • ${specificData.classType} Classes`;
    if (type === 'product') return 'Comprehensive product performance and customer insights';
    return 'Detailed performance breakdown and analytics';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {getTitle()}
              </DialogTitle>
              <p className="text-slate-600 mt-2 text-lg">
                {getSubtitle()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 border-0">
                {type === 'trainer' ? 'Trainer' : type === 'product' ? 'Product' : 'Analytics'}
              </Badge>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="pt-6 space-y-8">
          {/* Metric Cards */}
          {renderMetricCards()}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100">
              <TabsTrigger value="overview" className="gap-2">
                <Star className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2">
                <Zap className="w-4 h-4" />
                Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {renderTrainerSpecificData()}
              
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardHeader>
                  <CardTitle className="text-indigo-800">Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(specificData.specificRevenue || specificData.totalRevenue || 0)}
                      </div>
                      <div className="text-sm text-indigo-600">Total Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(specificData.specificTransactions || specificData.transactions || 0)}
                      </div>
                      <div className="text-sm text-green-600">Transactions</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatNumber(specificData.specificCustomers || specificData.customers || 0)}
                      </div>
                      <div className="text-sm text-purple-600">Customers</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(
                          (specificData.specificTransactions || specificData.transactions) > 0 
                            ? (specificData.specificRevenue || specificData.totalRevenue || 0) / (specificData.specificTransactions || specificData.transactions || 1)
                            : 0
                        )}
                      </div>
                      <div className="text-sm text-orange-600">Avg Transaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-green-700">Revenue Growth</span>
                      <Badge className="bg-green-200 text-green-800">
                        {specificData.totalChange > 0 ? '+' : ''}{specificData.totalChange?.toFixed(1) || 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-green-700">Performance Rating</span>
                      <Badge className="bg-green-200 text-green-800">
                        {(specificData.specificRevenue || specificData.totalRevenue || 0) > 50000 ? 'Excellent' : 'Good'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800">Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border-l-4 border-blue-400">
                      <div className="text-sm font-medium text-blue-800">Market Position</div>
                      <div className="text-blue-600">Strong performer in category</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border-l-4 border-green-400">
                      <div className="text-sm font-medium text-green-800">Customer Loyalty</div>
                      <div className="text-green-600">High retention rate</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details">
              {renderTransactionHistory()}
            </TabsContent>

            <TabsContent value="insights">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">AI-Powered Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-purple-400">
                      <h4 className="font-medium text-purple-800 mb-2">Strengths</h4>
                      <ul className="text-sm text-purple-600 space-y-1">
                        <li>• Consistent revenue performance</li>
                        <li>• Strong customer engagement</li>
                        <li>• Effective conversion rates</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white rounded-lg border-l-4 border-orange-400">
                      <h4 className="font-medium text-orange-800 mb-2">Opportunities</h4>
                      <ul className="text-sm text-orange-600 space-y-1">
                        <li>• Expand successful programs</li>
                        <li>• Optimize capacity utilization</li>
                        <li>• Enhance retention strategies</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};