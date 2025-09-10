
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Users, Package, CreditCard, User, ArrowUpDown, Crown, Target } from 'lucide-react';

interface DiscountInteractiveTopBottomListsProps {
  data: SalesData[];
  filters?: any;
  onDrillDown?: (title: string, data: any[], type: string) => void;
}

export const DiscountInteractiveTopBottomLists: React.FC<DiscountInteractiveTopBottomListsProps> = ({ 
  data, 
  filters,
  onDrillDown 
}) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const processedData = useMemo(() => {
    // Group by different dimensions
    const byCategory = data.reduce((acc, item) => {
      const key = item.cleanedCategory || 'Unknown';
      if (!acc[key]) acc[key] = { totalDiscount: 0, count: 0, totalRevenue: 0, avgPercent: 0 };
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].count += 1;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].avgPercent += item.discountPercentage || 0;
      return acc;
    }, {} as Record<string, any>);

    const byProduct = data.reduce((acc, item) => {
      const key = item.cleanedProduct || 'Unknown';
      if (!acc[key]) acc[key] = { totalDiscount: 0, count: 0, totalRevenue: 0, avgPercent: 0 };
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].count += 1;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].avgPercent += item.discountPercentage || 0;
      return acc;
    }, {} as Record<string, any>);

    const bySoldBy = data.reduce((acc, item) => {
      const key = item.soldBy === '-' ? 'Online/System' : item.soldBy;
      if (!acc[key]) acc[key] = { totalDiscount: 0, count: 0, totalRevenue: 0, avgPercent: 0 };
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].count += 1;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].avgPercent += item.discountPercentage || 0;
      return acc;
    }, {} as Record<string, any>);

    const byPaymentMethod = data.reduce((acc, item) => {
      const key = item.paymentMethod || 'Unknown';
      if (!acc[key]) acc[key] = { totalDiscount: 0, count: 0, totalRevenue: 0, avgPercent: 0 };
      acc[key].totalDiscount += item.discountAmount || 0;
      acc[key].count += 1;
      acc[key].totalRevenue += item.paymentValue || 0;
      acc[key].avgPercent += item.discountPercentage || 0;
      return acc;
    }, {} as Record<string, any>);

    // Convert to arrays and calculate averages
    const processArray = (obj: Record<string, any>) => {
      return Object.entries(obj).map(([name, data]) => ({
        name,
        totalDiscount: data.totalDiscount,
        count: data.count,
        totalRevenue: data.totalRevenue,
        avgPercent: data.count > 0 ? data.avgPercent / data.count : 0,
        avgDiscount: data.count > 0 ? data.totalDiscount / data.count : 0
      })).sort((a, b) => sortOrder === 'desc' ? b.totalDiscount - a.totalDiscount : a.totalDiscount - b.totalDiscount);
    };

    return {
      categories: processArray(byCategory),
      products: processArray(byProduct),
      soldBy: processArray(bySoldBy),
      paymentMethods: processArray(byPaymentMethod)
    };
  }, [data, sortOrder]);

  const renderTopBottomList = (items: any[], icon: React.ReactNode, title: string, type: string) => {
    const topItems = items.slice(0, 5);
    const bottomItems = items.slice(-5).reverse();
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Top {title} by Discount
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="ml-auto"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topItems.map((item, index) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between p-4 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-300 cursor-pointer hover:scale-102 group"
                onClick={() => onDrillDown?.(
                  `${item.name} - Discount Details`, 
                  data.filter(d => (type === 'category' ? d.cleanedCategory : 
                                   type === 'product' ? d.cleanedProduct :
                                   type === 'soldBy' ? (d.soldBy === '-' ? 'Online/System' : d.soldBy) :
                                   d.paymentMethod) === item.name),
                  type
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-orange-500 to-amber-600' :
                    'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-800 truncate group-hover:text-slate-900">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>{formatNumber(item.count)} transactions</span>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {item.avgPercent.toFixed(1)}% avg
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-bold text-red-600 text-sm">
                    {formatCurrency(item.totalDiscount)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatCurrency(item.avgDiscount)}/txn
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Lowest {title} by Discount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bottomItems.map((item, index) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between p-4 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-300 cursor-pointer hover:scale-102 group"
                onClick={() => onDrillDown?.(
                  `${item.name} - Discount Details`, 
                  data.filter(d => (type === 'category' ? d.cleanedCategory : 
                                   type === 'product' ? d.cleanedProduct :
                                   type === 'soldBy' ? (d.soldBy === '-' ? 'Online/System' : d.soldBy) :
                                   d.paymentMethod) === item.name),
                  type
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    #{bottomItems.length - index}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-800 truncate group-hover:text-slate-900">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>{formatNumber(item.count)} transactions</span>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {item.avgPercent.toFixed(1)}% avg
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-bold text-blue-600 text-sm">
                    {formatCurrency(item.totalDiscount)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatCurrency(item.avgDiscount)}/txn
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Top & Bottom Performers</h2>
        <Badge variant="outline" className="text-sm">
          {formatNumber(data.length)} total discounted transactions
        </Badge>
      </div>
      
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-white shadow-sm">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="soldBy" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Sold By
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Method
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          {renderTopBottomList(processedData.categories, <Package className="w-5 h-5" />, "Categories", "category")}
        </TabsContent>

        <TabsContent value="products">
          {renderTopBottomList(processedData.products, <Package className="w-5 h-5" />, "Products", "product")}
        </TabsContent>

        <TabsContent value="soldBy">
          {renderTopBottomList(processedData.soldBy, <User className="w-5 h-5" />, "Staff", "soldBy")}
        </TabsContent>

        <TabsContent value="payment">
          {renderTopBottomList(processedData.paymentMethods, <CreditCard className="w-5 h-5" />, "Payment Methods", "paymentMethod")}
        </TabsContent>
      </Tabs>
    </div>
  );
};
