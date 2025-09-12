
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Award, AlertTriangle, Eye, BarChart3, Users, Package, Tag, UserCheck } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface UnifiedTopBottomSellersProps {
  data: SalesData[];
  onRowClick?: (row: any) => void;
}

export const UnifiedTopBottomSellers: React.FC<UnifiedTopBottomSellersProps> = ({ data, onRowClick }) => {
  const [activeType, setActiveType] = useState('product');

  const getGroupedData = (type: 'product' | 'category' | 'member' | 'seller') => {
    const grouped = data.reduce((acc, item) => {
      let key = '';
      switch (type) {
        case 'product':
          key = item.cleanedProduct;
          break;
        case 'category':
          key = item.cleanedCategory;
          break;
        case 'member':
          key = item.customerName;
          break;
        case 'seller':
          key = item.soldBy;
          break;
      }
      
      if (!acc[key]) {
        acc[key] = {
          name: key,
          totalValue: 0,
          unitsSold: 0,
          transactions: 0,
          uniqueMembers: new Set(),
          atv: 0,
          auv: 0,
          asv: 0,
          upt: 0
        };
      }
      
      acc[key].totalValue += item.paymentValue;
      acc[key].unitsSold += 1; // Each sale item is one unit
      acc[key].transactions += 1;
      acc[key].uniqueMembers.add(item.memberId);
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate metrics correctly
    Object.values(grouped).forEach((item: any) => {
      const uniqueMembersCount = item.uniqueMembers.size;
      item.uniqueMembers = uniqueMembersCount;
      item.atv = item.transactions > 0 ? item.totalValue / item.transactions : 0; // ATV = Revenue/Transactions
      item.auv = item.unitsSold > 0 ? item.totalValue / item.unitsSold : 0; // AUV = Revenue/Units
      item.asv = uniqueMembersCount > 0 ? item.totalValue / uniqueMembersCount : 0; // ASV = Revenue/Members
      item.upt = item.transactions > 0 ? item.unitsSold / item.transactions : 0; // UPT = Units/Transactions
    });
    
    return Object.values(grouped).sort((a: any, b: any) => b.totalValue - a.totalValue);
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'product':
        return { icon: Package, label: 'Products', description: 'Individual product performance' };
      case 'category':
        return { icon: Tag, label: 'Categories', description: 'Category-wise performance' };
      case 'member':
        return { icon: Users, label: 'Members', description: 'Customer spending patterns' };
      case 'seller':
        return { icon: UserCheck, label: 'Associates', description: 'Sales representative performance' };
      default:
        return { icon: Package, label: 'Products', description: 'Performance data' };
    }
  };

  const renderSellerCard = (sellers: any[], isTop: boolean, type: string) => {
    const config = getTypeConfig(type);
    const IconComponent = config.icon;

    return (
      <Card className="bg-gradient-to-br from-white via-slate-50/50 to-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            {isTop ? (
              <>
                <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Top 5 {config.label}
                  </span>
                  <p className="text-sm text-slate-600 font-normal">{config.description}</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-gradient-to-r from-red-400 to-rose-500">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    Bottom 5 {config.label}
                  </span>
                  <p className="text-sm text-slate-600 font-normal">Areas for improvement</p>
                </div>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sellers.map((seller, index) => (
            <div 
              key={seller.name} 
              className="group flex items-center justify-between p-4 rounded-xl bg-white shadow-sm border hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => onRowClick?.(seller)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                  isTop 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-red-400 to-rose-600 text-white'
                )}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 whitespace-normal break-words group-hover:text-blue-600 transition-colors">
                    {seller.name}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {formatNumber(seller.transactions)} txns
                    </Badge>
                    <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                      ATV: {formatCurrency(seller.atv)}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                      AUV: {formatCurrency(seller.auv)}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                      ASV: {formatCurrency(seller.asv)}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-slate-200 text-slate-700">
                      UPT: {seller.upt.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                  {formatCurrency(seller.totalValue)}
                </p>
                <p className="text-sm text-slate-500">{formatNumber(seller.unitsSold)} units</p>
                <p className="text-xs text-slate-400">{formatNumber(seller.uniqueMembers)} customers</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => {
                    e.stopPropagation();
                    // Filter data for this seller only
                    const filtered = data.filter(item => {
                      switch (type) {
                        case 'product': return item.cleanedProduct === seller.name;
                        case 'category': return item.cleanedCategory === seller.name;
                        case 'member': return item.customerName === seller.name;
                        case 'seller': return item.soldBy === seller.name;
                        default: return false;
                      }
                    });
                    onRowClick?.({ 
                      ...seller, 
                      rawData: filtered, 
                      type,
                      title: seller.name,
                      name: seller.name,
                      grossRevenue: seller.totalValue,
                      totalValue: seller.totalValue,
                      totalCurrent: seller.totalValue,
                      metricValue: seller.totalValue,
                      transactions: seller.transactions,
                      totalTransactions: seller.transactions,
                      uniqueMembers: seller.uniqueMembers,
                      totalCustomers: seller.uniqueMembers,
                      totalChange: 0,
                      months: {},
                      monthlyValues: {}
                    });
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance Summary
            </h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Average revenue: {formatCurrency(sellers.reduce((sum, s) => sum + s.totalValue, 0) / sellers.length)}</li>
              <li>• Total transactions: {formatNumber(sellers.reduce((sum, s) => sum + s.transactions, 0))}</li>
              <li>• Combined customer reach: {formatNumber(sellers.reduce((sum, s) => sum + s.uniqueMembers, 0))} unique customers</li>
              <li>• Performance spread: {((sellers[0]?.totalValue / sellers[sellers.length - 1]?.totalValue || 1) - 1).toFixed(1)}x variance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  const groupedData = getGroupedData(activeType as 'product' | 'category' | 'member' | 'seller');
  const topSellers = groupedData.slice(0, 5);
  const bottomSellers = groupedData.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Enhanced Tab Navigation */}
      <Card className="bg-gradient-to-br from-white via-slate-50/20 to-white border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeType} onValueChange={setActiveType} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 p-2 rounded-2xl shadow-lg border border-slate-200/30">
              <TabsTrigger 
                value="product" 
                className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
              >
                <Package className="w-4 h-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger 
                value="category" 
                className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
              >
                <Tag className="w-4 h-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger 
                value="member" 
                className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
              >
                <Users className="w-4 h-4 mr-2" />
                Members
              </TabsTrigger>
              <TabsTrigger 
                value="seller" 
                className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Associates
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeType} className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderSellerCard(topSellers, true, activeType)}
                {renderSellerCard(bottomSellers, false, activeType)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
