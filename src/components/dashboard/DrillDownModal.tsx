
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Users, ShoppingCart, Calendar, MapPin, BarChart3, DollarSign, Activity, CreditCard } from 'lucide-react';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'metric' | 'product' | 'category' | 'member' | 'soldBy' | 'paymentMethod' | 'client-conversion' | 'trainer' | 'location';
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  data,
  type
}) => {
  if (!data) return null;

  // Helper function to safely convert to number
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  const safeToFixed = (value: any, decimals: number = 2): string => {
    const num = safeNumber(value, 0);
    return num.toFixed(decimals);
  };

  const renderAnalyticsDetails = () => {
    // Better data extraction with multiple fallbacks
    const grossRevenue = safeNumber(
      data.grossRevenue || data.totalValue || data.totalCurrent || data.metricValue || 
      data.revenue || data.totalRevenue || data.amount || data.value || 
      (data.rawData?.reduce((sum: number, item: any) => sum + (item.paymentValue || item.grossRevenue || 0), 0)), 
      0
    );
    
    const transactions = safeNumber(
      data.transactions || data.totalTransactions || data.count || data.totalCount ||
      (data.rawData?.length) || (data.months ? Object.values(data.months).reduce((sum: number, m: any) => sum + (m.transactions || 1), 0) : 0),
      0
    );
    
    const uniqueMembers = safeNumber(
      data.uniqueMembers || data.totalCustomers || data.customers || data.memberCount ||
      (data.rawData ? new Set(data.rawData.map((item: any) => item.memberId || item.customerEmail)).size : 0),
      0
    );
    
    const totalChange = safeNumber(data.totalChange || data.change || data.growth, 0);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Revenue</span>
              </div>
              <div className="text-xl font-bold text-blue-700">{formatCurrency(grossRevenue)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Customers</span>
              </div>
              <div className="text-xl font-bold text-green-700">{formatNumber(uniqueMembers)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Transactions</span>
              </div>
              <div className="text-xl font-bold text-purple-700">{formatNumber(transactions)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Growth</span>
              </div>
              <div className="text-xl font-bold text-orange-700">
                {totalChange !== 0 ? `${totalChange > 0 ? '+' : ''}${safeToFixed(totalChange, 1)}%` : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-4">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader>
                <CardTitle className="text-slate-800">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-slate-600">Total Revenue</span>
                    <span className="font-bold text-blue-600">{formatCurrency(grossRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-slate-600">Average per Transaction</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(transactions > 0 ? Math.round(grossRevenue / transactions) : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-slate-600">Average per Customer</span>
                    <span className="font-bold text-purple-600">
                      {formatCurrency(uniqueMembers > 0 ? Math.round(grossRevenue / uniqueMembers) : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-slate-600">Performance Rating</span>
                    <Badge className={`${grossRevenue > 50000 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {grossRevenue > 100000 ? 'Excellent' : grossRevenue > 50000 ? 'Good' : 'Average'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader>
                <CardTitle className="text-slate-800">Monthly Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {data.months && Object.keys(data.months).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(data.months).slice(-6).map(([month, monthData]: [string, any]) => (
                      <div key={month} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <span className="font-medium text-slate-800">{month}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-blue-600">{formatCurrency(safeNumber(monthData.current, 0))}</span>
                          <Badge className={`${safeNumber(monthData.change, 0) >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {safeNumber(monthData.change, 0) > 0 ? '+' : ''}{safeToFixed(monthData.change, 1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : data.monthlyValues ? (
                  <div className="space-y-3">
                    {Object.entries(data.monthlyValues).slice(-6).map(([month, value]: [string, any]) => (
                      <div key={month} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <span className="font-medium text-slate-800">{month}</span>
                        <span className="text-blue-600">{formatCurrency(safeNumber(value, 0))}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-600">No monthly data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader>
                <CardTitle className="text-slate-800">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="p-3 bg-white rounded-lg border-l-4 border-blue-400">
                    <strong className="text-blue-600">Performance:</strong> 
                    {grossRevenue > 100000 
                      ? ' Exceptional performance with high revenue generation'
                      : grossRevenue > 50000 
                      ? ' Good performance showing steady growth'
                      : ' Moderate performance with room for improvement'
                    }
                  </div>
                  <div className="p-3 bg-white rounded-lg border-l-4 border-green-400">
                    <strong className="text-green-600">Customer Engagement:</strong> 
                    {uniqueMembers > 50 
                      ? ' Strong customer base with good engagement'
                      : uniqueMembers > 20 
                      ? ' Moderate customer engagement'
                      : ' Limited customer base - focus on acquisition'
                    }
                  </div>
                  <div className="p-3 bg-white rounded-lg border-l-4 border-purple-400">
                    <strong className="text-purple-600">Transaction Volume:</strong> 
                    {transactions > 100 
                      ? ' High transaction volume indicating strong sales activity'
                      : transactions > 50 
                      ? ' Moderate transaction activity'
                      : ' Low transaction volume - consider promotional strategies'
                    }
                  </div>
                  <div className="p-3 bg-white rounded-lg border-l-4 border-orange-400">
                    <strong className="text-orange-600">Recommendation:</strong> 
                    {totalChange > 0 
                      ? ' Continue current strategies and consider scaling successful initiatives'
                      : ' Review pricing strategy and focus on customer retention programs'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Raw Data Summary */}
        {data.rawData && data.rawData.length > 0 && (
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <BarChart3 className="w-5 h-5" />
                Data Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-indigo-700">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="font-bold text-lg">{data.rawData.length}</div>
                  <div>Total Records</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="font-bold text-lg">{formatCurrency(data.rawData.reduce((sum: number, item: any) => sum + (item.paymentValue || 0), 0))}</div>
                  <div>Total Value</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="font-bold text-lg">{new Set(data.rawData.map((item: any) => item.memberId)).size}</div>
                  <div>Unique Customers</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="font-bold text-lg">{formatCurrency(data.rawData.reduce((sum: number, item: any) => sum + (item.paymentValue || 0), 0) / data.rawData.length)}</div>
                  <div>Avg Transaction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const getTitle = () => {
    if (type === 'metric') return `${data.title} - Detailed Analysis`;
    if (type === 'soldBy') return `${data.soldBy || data.name} - Sales Performance`;
    if (type === 'paymentMethod') return `${data.paymentMethod || data.name} - Payment Analytics`;
    if (type === 'client-conversion') return `${data.firstName || data.name || 'Client'} ${data.lastName || ''} - Conversion Details`;
    return `${data.name || data.trainer || 'Item'} - Performance Breakdown`;
  };

  const getDescription = () => {
    if (type === 'metric') return 'Comprehensive performance analysis with real-time data insights';
    if (type === 'soldBy') return 'Detailed breakdown of sales associate performance and growth trends';
    if (type === 'paymentMethod') return 'Payment method analysis with transaction patterns and insights';
    if (type === 'client-conversion') return 'Detailed client conversion and retention analysis';
    return 'Detailed breakdown of performance metrics and growth trends';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50/50 to-white">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            {getTitle()}
          </DialogTitle>
          <p className="text-slate-600 mt-2">
            {getDescription()}
          </p>
        </DialogHeader>
        
        <div className="pt-4">
          {renderAnalyticsDetails()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
