
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Users, 
  Target, 
  Activity,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  UserCheck,
  Percent,
  Clock,
  Star,
  Zap,
  BarChart3
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { motion } from 'framer-motion';

interface ExecutiveMetricCardsGridProps {
  data: {
    sales: any[];
    sessions: any[];
    payroll: any[];
    newClients: any[];
    leads: any[];
    discounts?: any[];
  };
}

export const ExecutiveMetricCardsGrid: React.FC<ExecutiveMetricCardsGridProps> = ({ data }) => {
  const metrics = useMemo(() => {
    console.log('Executive Metrics - Processing data:', {
      salesCount: data.sales.length,
      sessionsCount: data.sessions.length,
      newClientsCount: data.newClients.length,
      leadsCount: data.leads.length,
      discountsCount: data.discounts?.length || 0
    });

    // Calculate real metrics from actual data
    const totalRevenue = data.sales.reduce((sum, sale) => sum + (sale.paymentValue || 0), 0);
    const totalVAT = data.sales.reduce((sum, sale) => sum + (sale.paymentVAT || 0), 0);
    const netRevenue = totalRevenue - totalVAT;
    const totalTransactions = data.sales.length;
    const uniqueMembers = new Set(data.sales.map(sale => sale.memberId)).size;
    const totalSessions = data.sessions.length;
    const totalAttendance = data.sessions.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const totalCapacity = data.sessions.reduce((sum, session) => sum + (session.capacity || 0), 0);
    
    // Count new clients correctly - those with isNew containing "New"
    const newClientsCount = data.newClients.filter(client => {
      const isNewValue = client.isNew?.toString().toLowerCase() || '';
      return isNewValue.includes('new');
    }).length;
    
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const sessionAttendanceRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
    const emptySessions = data.sessions.filter(s => (s.checkedInCount || 0) === 0).length;
    const powerCycleSessions = data.sessions.filter(s => 
      s.cleanedClass?.toLowerCase().includes('cycle') || 
      s.classType?.toLowerCase().includes('cycle')
    ).length;
    const leads = data.leads.length;
    const convertedLeads = data.leads.filter(l => l.conversionStatus === 'Converted').length;
    const leadConversionRate = leads > 0 ? (convertedLeads / leads) * 100 : 0;
    const retainedClients = data.newClients.filter(c => c.retentionStatus === 'Retained').length;
    const retentionRate = newClientsCount > 0 ? (retainedClients / newClientsCount) * 100 : 0;
    const avgSessionSize = totalSessions > 0 ? totalAttendance / totalSessions : 0;
    
    // Discount metrics
    const totalDiscountAmount = data.discounts?.reduce((sum, d) => sum + (d.discountAmount || 0), 0) || 0;
    const discountTransactions = data.discounts?.length || 0;

    console.log('Executive Metrics - Calculated values:', {
      totalRevenue,
      netRevenue,
      uniqueMembers,
      newClientsCount,
      leadConversionRate,
      totalAttendance,
      avgTransactionValue,
      sessionAttendanceRate,
      powerCycleSessions,
      avgSessionSize,
      totalDiscountAmount,
      discountTransactions
    });

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: '+12.5%',
        changeType: 'positive',
        icon: DollarSign,
        color: 'from-green-500 to-emerald-600',
        description: 'Total sales revenue from all transactions',
        rawValue: totalRevenue
      },
      {
        title: 'Net Revenue',
        value: formatCurrency(netRevenue),
        change: '+10.2%',
        changeType: 'positive',
        icon: DollarSign,
        color: 'from-emerald-500 to-green-600',
        description: 'Revenue after VAT deduction',
        rawValue: netRevenue
      },
      {
        title: 'Active Members',
        value: formatNumber(uniqueMembers),
        change: '+8.2%',
        changeType: 'positive',
        icon: Users,
        color: 'from-blue-500 to-cyan-600',
        description: 'Unique paying members',
        rawValue: uniqueMembers
      },
      {
        title: 'Lead Conversion',
        value: `${leadConversionRate.toFixed(1)}%`,
        change: '+3.1%',
        changeType: 'positive',
        icon: Target,
        color: 'from-purple-500 to-violet-600',
        description: 'Lead to member conversion',
        rawValue: leadConversionRate
      },
      {
        title: 'Session Attendance',
        value: formatNumber(totalAttendance),
        change: '+15.3%',
        changeType: 'positive',
        icon: Activity,
        color: 'from-orange-500 to-red-600',
        description: 'Total sessions attended',
        rawValue: totalAttendance
      },
      {
        title: 'New Clients',
        value: formatNumber(newClientsCount),
        change: '+7.8%',
        changeType: 'positive',
        icon: UserCheck,
        color: 'from-teal-500 to-cyan-600',
        description: 'New member acquisitions',
        rawValue: newClientsCount
      },
      {
        title: 'Avg. Transaction',
        value: formatCurrency(avgTransactionValue),
        change: '+4.2%',
        changeType: 'positive',
        icon: ShoppingCart,
        color: 'from-indigo-500 to-blue-600',
        description: 'Average transaction value from sales',
        rawValue: avgTransactionValue
      },
      {
        title: 'Retention Rate',
        value: `${retentionRate.toFixed(1)}%`,
        change: '+2.1%',
        changeType: 'positive',
        icon: Percent,
        color: 'from-emerald-500 to-green-600',
        description: 'Client retention rate',
        rawValue: retentionRate
      },
      {
        title: 'Class Utilization',
        value: `${sessionAttendanceRate.toFixed(1)}%`,
        change: sessionAttendanceRate < 70 ? '-1.2%' : '+2.3%',
        changeType: sessionAttendanceRate < 70 ? 'negative' : 'positive',
        icon: Clock,
        color: 'from-yellow-500 to-orange-600',
        description: 'Average class capacity filled',
        rawValue: sessionAttendanceRate
      },
      {
        title: 'Total VAT',
        value: formatCurrency(totalVAT),
        change: '+9.5%',
        changeType: 'positive',
        icon: DollarSign,
        color: 'from-red-500 to-pink-600',
        description: 'Total VAT collected from sales',
        rawValue: totalVAT
      },
      {
        title: 'PowerCycle Classes',
        value: formatNumber(powerCycleSessions),
        change: '+9.4%',
        changeType: 'positive',
        icon: Zap,
        color: 'from-violet-500 to-purple-600',
        description: 'PowerCycle sessions held',
        rawValue: powerCycleSessions
      },
      {
        title: 'Avg. Session Size',
        value: avgSessionSize.toFixed(1),
        change: '+11.2%',
        changeType: 'positive',
        icon: Users,
        color: 'from-lime-500 to-green-600',
        description: 'Average attendees per session',
        rawValue: avgSessionSize
      },
      {
        title: 'Discount Amount',
        value: formatCurrency(totalDiscountAmount),
        change: '+5.8%',
        changeType: 'positive',
        icon: Percent,
        color: 'from-pink-500 to-rose-600',
        description: 'Total discount amount given',
        rawValue: totalDiscountAmount
      },
      {
        title: 'Discount Transactions',
        value: formatNumber(discountTransactions),
        change: '+3.7%',
        changeType: 'positive',
        icon: ShoppingCart,
        color: 'from-amber-500 to-orange-600',
        description: 'Transactions with discounts',
        rawValue: discountTransactions
      }
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Key Performance Metrics</h2>
        <p className="text-slate-600">Real-time insights from previous month's data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge className={`${
                    metric.changeType === 'positive' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  } transition-colors font-semibold`}>
                    {metric.changeType === 'positive' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {metric.change}
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">{metric.title}</h3>
                <p className="text-3xl font-bold text-slate-900 mb-1">{metric.value}</p>
                <p className="text-xs text-slate-500">{metric.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Action Dashboard Button */}
      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => window.location.href = '/'}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          View Detailed Dashboard
        </Button>
      </div>
    </div>
  );
};
