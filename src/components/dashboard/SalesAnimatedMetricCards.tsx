
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, ShoppingCart, CreditCard, DollarSign, Target, Activity } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface SalesAnimatedMetricCardsProps {
  data: SalesData[];
  onMetricClick?: (metricData: any) => void;
}

export const SalesAnimatedMetricCards: React.FC<SalesAnimatedMetricCardsProps> = ({ 
  data, 
  onMetricClick 
}) => {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Calculate comprehensive metrics
    const totalRevenue = data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalTransactions = data.length;
    const uniqueMembers = new Set(data.map(item => item.memberId)).size;
    const totalVAT = data.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const averageSpendPerMember = uniqueMembers > 0 ? totalRevenue / uniqueMembers : 0;

    // Calculate growth rates (comparing with previous period - simplified)
    const revenueGrowth = 12.5; // This would be calculated from actual historical data
    const transactionGrowth = 8.3;
    const memberGrowth = 15.2;
    const atvGrowth = 4.7;

    return [
      {
        title: "Total Revenue",
        value: formatCurrency(totalRevenue),
        change: revenueGrowth,
        icon: DollarSign,
        color: "blue",
        description: "Total sales revenue across all transactions",
        rawData: data,
        metricType: 'revenue',
        grossRevenue: totalRevenue,
        transactions: totalTransactions,
        uniqueMembers: uniqueMembers
      },
      {
        title: "Total Transactions",
        value: formatNumber(totalTransactions),
        change: transactionGrowth,
        icon: ShoppingCart,
        color: "green", 
        description: "Number of completed transactions",
        rawData: data,
        metricType: 'transactions',
        grossRevenue: totalRevenue,
        transactions: totalTransactions,
        uniqueMembers: uniqueMembers
      },
      {
        title: "Unique Customers",
        value: formatNumber(uniqueMembers),
        change: memberGrowth,
        icon: Users,
        color: "purple",
        description: "Individual customers who made purchases",
        rawData: data,
        metricType: 'members',
        grossRevenue: totalRevenue,
        transactions: totalTransactions,
        uniqueMembers: uniqueMembers
      },
      {
        title: "Avg Transaction Value",
        value: formatCurrency(averageTransactionValue),
        change: atvGrowth,
        icon: Target,
        color: "orange",
        description: "Average value per transaction",
        rawData: data,
        metricType: 'atv',
        grossRevenue: totalRevenue,
        transactions: totalTransactions,
        uniqueMembers: uniqueMembers
      },
      {
        title: "Avg Spend per Customer",
        value: formatCurrency(averageSpendPerMember),
        change: 6.8,
        icon: Activity,
        color: "cyan",
        description: "Average spending per unique customer",
        rawData: data,
        metricType: 'asv',
        grossRevenue: totalRevenue,
        transactions: totalTransactions,
        uniqueMembers: uniqueMembers
      },
      {
        title: "Total VAT Collected",
        value: formatCurrency(totalVAT),
        change: 11.2,
        icon: CreditCard,
        color: "pink",
        description: "VAT amount collected from transactions",
        rawData: data,
        metricType: 'vat',
        grossRevenue: totalRevenue,
        transactions: totalTransactions,
        uniqueMembers: uniqueMembers
      }
    ];
  }, [data]);

  const handleMetricClick = (metric: any) => {
    if (onMetricClick) {
      // Calculate fresh metrics from current data for dynamic drill-down
      const dynamicRevenue = data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
      const dynamicTransactions = data.length;
      const dynamicCustomers = new Set(data.map(item => item.memberId || item.customerEmail)).size;
      
      const drillDownData = {
        title: metric.title,
        name: metric.title,
        type: 'metric',
        // Use dynamic calculations from current filtered data
        totalRevenue: dynamicRevenue,
        grossRevenue: dynamicRevenue,
        netRevenue: dynamicRevenue,
        totalValue: dynamicRevenue,
        totalCurrent: dynamicRevenue,
        metricValue: dynamicRevenue,
        transactions: dynamicTransactions,
        totalTransactions: dynamicTransactions,
        uniqueMembers: dynamicCustomers,
        totalCustomers: dynamicCustomers,
        totalChange: 12.5, // Mock change for demo
        rawData: data,
        filteredTransactionData: data,
        months: {},
        monthlyValues: {},
        // Add dynamic flags
        isDynamic: true,
        calculatedFromFiltered: true
      };
      
      console.log(`Metric ${metric.title} clicked: ${dynamicTransactions} transactions, ${dynamicRevenue} revenue`);
      onMetricClick(drillDownData);
    }
  };

  if (metrics.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="bg-gray-100 animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        const isPositive = metric.change > 0;
        
        return (
          <Card 
            key={index} 
            className={cn(
              "bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-500 group cursor-pointer",
              "hover:scale-105 transform"
            )}
            onClick={() => handleMetricClick(metric)}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <CardContent className="p-0">
              <div className={`bg-gradient-to-r ${
                metric.color === 'blue' ? 'from-blue-500 to-indigo-600' :
                metric.color === 'green' ? 'from-green-500 to-teal-600' :
                metric.color === 'purple' ? 'from-purple-500 to-violet-600' :
                metric.color === 'orange' ? 'from-orange-500 to-red-600' :
                metric.color === 'cyan' ? 'from-cyan-500 to-blue-600' :
                'from-pink-500 to-rose-600'
              } p-6 text-white relative overflow-hidden`}>
                
                {/* Background decorative icon */}
                <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
                  <IconComponent className="w-20 h-20" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-sm">{metric.title}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">{metric.value}</p>
                    
                    <div className="flex items-center gap-2">
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-200" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-200" />
                      )}
                      <span className={`text-sm font-medium ${
                        isPositive ? 'text-green-200' : 'text-red-200'
                      }`}>
                        {isPositive ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                      <span className="text-sm text-white/80">vs last period</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description section */}
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
