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
    return [{
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
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }];
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
        totalChange: 12.5,
        // Mock change for demo
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
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => <Card key={index} className="bg-gray-100 animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>)}
      </div>;
  }
  return;
};