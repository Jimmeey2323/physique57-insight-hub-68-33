
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { TrendingDown, Users, Package, CreditCard, Percent, DollarSign, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscountMetricCardsProps {
  data: SalesData[];
  filters?: any;
  onDrillDown?: (title: string, data: any[], type: string) => void;
}

export const DiscountMetricCards: React.FC<DiscountMetricCardsProps> = ({ data, filters, onDrillDown }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalDiscountAmount: { value: 0, change: 0, breakdown: [] },
        totalTransactions: { value: 0, change: 0, breakdown: [] },
        avgDiscountPercentage: { value: 0, change: 0, breakdown: [] },
        uniqueCustomers: { value: 0, change: 0, breakdown: [] },
        topCategory: { value: 'N/A', amount: 0, breakdown: [] },
        topPaymentMethod: { value: 'N/A', amount: 0, breakdown: [] }
      };
    }

    const totalDiscountAmount = data.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalTransactions = data.length;
    const uniqueCustomers = new Set(data.map(item => item.customerEmail)).size;
    const avgDiscountPercentage = data.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / totalTransactions;

    // Category breakdown
    const categoryBreakdown = data.reduce((acc, item) => {
      const category = item.cleanedCategory || 'Unknown';
      if (!acc[category]) acc[category] = { amount: 0, count: 0 };
      acc[category].amount += item.discountAmount || 0;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const topCategory = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b.amount - a.amount)[0];

    // Payment method breakdown
    const paymentBreakdown = data.reduce((acc, item) => {
      const method = item.paymentMethod || 'Unknown';
      if (!acc[method]) acc[method] = { amount: 0, count: 0 };
      acc[method].amount += item.discountAmount || 0;
      acc[method].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const topPaymentMethod = Object.entries(paymentBreakdown)
      .sort(([,a], [,b]) => b.amount - a.amount)[0];

    return {
      totalDiscountAmount: {
        value: totalDiscountAmount,
        change: Math.random() * 20 - 10, // Mock change for demo
        breakdown: Object.entries(categoryBreakdown).map(([name, data]) => ({
          name,
          value: data.amount,
          count: data.count
        }))
      },
      totalTransactions: {
        value: totalTransactions,
        change: Math.random() * 15 - 7.5,
        breakdown: Object.entries(paymentBreakdown).map(([name, data]) => ({
          name,
          value: data.count,
          amount: data.amount
        }))
      },
      avgDiscountPercentage: {
        value: avgDiscountPercentage,
        change: Math.random() * 10 - 5,
        breakdown: []
      },
      uniqueCustomers: {
        value: uniqueCustomers,
        change: Math.random() * 25 - 12.5,
        breakdown: []
      },
      topCategory: {
        value: topCategory?.[0] || 'N/A',
        amount: topCategory?.[1]?.amount || 0,
        breakdown: Object.entries(categoryBreakdown).slice(0, 5)
      },
      topPaymentMethod: {
        value: topPaymentMethod?.[0] || 'N/A',
        amount: topPaymentMethod?.[1]?.amount || 0,
        breakdown: Object.entries(paymentBreakdown).slice(0, 3)
      }
    };
  }, [data]);

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    color, 
    gradient,
    breakdown,
    onClick,
    hoverContent,
    cardKey
  }: any) => (
    <Card 
      className={cn(
        "relative overflow-hidden border-0 shadow-xl transition-all duration-300 cursor-pointer group",
        gradient,
        hoveredCard === cardKey ? "scale-105 shadow-2xl" : "hover:scale-102"
      )}
      onMouseEnter={() => setHoveredCard(cardKey)}
      onMouseLeave={() => setHoveredCard(null)}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon className={cn("w-5 h-5", color)} />
            {title}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-medium">{title} Details</p>
                  {hoverContent}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="text-3xl font-bold text-slate-900">
            {value}
          </div>
          <div className="flex items-center gap-2">
            {change >= 0 ? (
              <ArrowUp className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-600" />
            )}
            <span className={cn(
              "text-sm font-medium",
              change >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatPercentage(Math.abs(change))}
            </span>
            <span className="text-xs text-slate-500">vs last month</span>
          </div>
        </div>

        {hoveredCard === cardKey && breakdown && breakdown.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            <div className="text-xs font-medium text-slate-600 border-t pt-2">
              Top Contributors:
            </div>
            {breakdown.slice(0, 3).map((item: any, index: number) => (
              <div key={item.name || index} className="flex items-center justify-between text-xs">
                <span className="text-slate-700 truncate">{item.name}</span>
                <Badge variant="outline" className="text-xs">
                  {typeof item.value === 'number' ? formatCurrency(item.value) : item.value}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Decorative overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        title="Total Discount Amount"
        value={formatCurrency(metrics.totalDiscountAmount.value)}
        icon={DollarSign}
        change={metrics.totalDiscountAmount.change}
        color="text-red-600"
        gradient="bg-gradient-to-br from-white via-red-50/30 to-rose-50/20"
        breakdown={metrics.totalDiscountAmount.breakdown}
        cardKey="totalDiscount"
        onClick={() => onDrillDown?.('Discount Breakdown', data, 'discount-breakdown')}
        hoverContent={
          <div>
            <p>Total amount discounted across all transactions</p>
            <p className="text-xs text-slate-500">Click to view detailed breakdown</p>
          </div>
        }
      />

      <MetricCard
        title="Discounted Transactions"
        value={formatNumber(metrics.totalTransactions.value)}
        icon={TrendingDown}
        change={metrics.totalTransactions.change}
        color="text-blue-600"
        gradient="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20"
        breakdown={metrics.totalTransactions.breakdown}
        cardKey="transactions"
        onClick={() => onDrillDown?.('Transaction Details', data, 'transactions')}
        hoverContent={
          <div>
            <p>Number of transactions with discounts applied</p>
            <p className="text-xs text-slate-500">Click to view transaction details</p>
          </div>
        }
      />

      <MetricCard
        title="Average Discount %"
        value={`${metrics.avgDiscountPercentage.value.toFixed(1)}%`}
        icon={Percent}
        change={metrics.avgDiscountPercentage.change}
        color="text-green-600"
        gradient="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20"
        breakdown={[]}
        cardKey="avgDiscount"
        onClick={() => onDrillDown?.('Discount Percentage Analysis', data, 'percentage-analysis')}
        hoverContent={
          <div>
            <p>Average discount percentage across all discounted transactions</p>
            <p className="text-xs text-slate-500">Click for percentage distribution analysis</p>
          </div>
        }
      />

      <MetricCard
        title="Unique Customers"
        value={formatNumber(metrics.uniqueCustomers.value)}
        icon={Users}
        change={metrics.uniqueCustomers.change}
        color="text-purple-600"
        gradient="bg-gradient-to-br from-white via-purple-50/30 to-violet-50/20"
        breakdown={[]}
        cardKey="customers"
        onClick={() => onDrillDown?.('Customer Analysis', data, 'customers')}
        hoverContent={
          <div>
            <p>Number of unique customers who received discounts</p>
            <p className="text-xs text-slate-500">Click to view customer details</p>
          </div>
        }
      />

      <MetricCard
        title="Top Discounted Category"
        value={metrics.topCategory.value}
        icon={Package}
        change={0}
        color="text-orange-600"
        gradient="bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20"
        breakdown={metrics.topCategory.breakdown}
        cardKey="topCategory"
        onClick={() => onDrillDown?.('Category Analysis', data, 'categories')}
        hoverContent={
          <div>
            <p>Category with highest total discount amount</p>
            <p className="font-medium">{formatCurrency(metrics.topCategory.amount)}</p>
            <p className="text-xs text-slate-500">Click for category breakdown</p>
          </div>
        }
      />

      <MetricCard
        title="Top Payment Method"
        value={metrics.topPaymentMethod.value}
        icon={CreditCard}
        change={0}
        color="text-teal-600"
        gradient="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/20"
        breakdown={metrics.topPaymentMethod.breakdown}
        cardKey="topPayment"
        onClick={() => onDrillDown?.('Payment Method Analysis', data, 'payment-methods')}
        hoverContent={
          <div>
            <p>Payment method with highest discount usage</p>
            <p className="font-medium">{formatCurrency(metrics.topPaymentMethod.amount)}</p>
            <p className="text-xs text-slate-500">Click for payment method analysis</p>
          </div>
        }
      />
    </div>
  );
};
