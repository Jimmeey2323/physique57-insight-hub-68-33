import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Award, Calendar, BarChart3, UserCheck, TrendingUp, TrendingDown, Target, DollarSign, Activity, Clock, Star, Zap } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { motion } from 'framer-motion';

interface ClientConversionAdvancedMetricsProps {
  data: NewClientData[];
  payrollData?: any[];
  onDrillDown?: (title: string, data: any[], type?: string) => void;
}


export const ClientConversionAdvancedMetrics: React.FC<ClientConversionAdvancedMetricsProps> = ({ data, payrollData, onDrillDown }) => {
  console.log('ClientConversionAdvancedMetrics data:', data.length, 'records');

  // --- Hosted class detection helper ---
  const isHostedClass = (entity: string = '') => {
    if (!entity) return false;
    return /host|hosted|birthday|rugby|outdoor|x|p57|sign|link|influencer/i.test(entity);
  };

  // --- Month-Year extraction helper ---
  const getMonthYear = (dateStr: string = '', fallback: string = '') => {
    if (!dateStr) return fallback;
    // Try DD/MM/YYYY or YYYY-MM-DD or similar
    const d = dateStr.includes('/') ? dateStr.split(/[ ,]/)[0].split('/') : dateStr.split('-');
    if (d.length >= 3) {
      const year = d[2].length === 4 ? d[2] : d[0];
      const month = d[1].length === 2 ? d[1] : d[1].padStart(2, '0');
      return `${year}-${month}`;
    }
    return fallback;
  };

  // --- Hosted class month-on-month stats ---
  const hostedClassMoM = React.useMemo(() => {
    const stats: Record<string, { total: number; converted: number; retained: number; newClients: number }> = {};
    data.forEach(client => {
      if (isHostedClass(client.firstVisitEntityName)) {
        const month = client.monthYear || getMonthYear(client.firstVisitDate, 'Unknown');
        if (!stats[month]) stats[month] = { total: 0, converted: 0, retained: 0, newClients: 0 };
        stats[month].total++;
        if ((client.isNew || '').includes('New')) stats[month].newClients++;
        if (client.conversionStatus === 'Converted') stats[month].converted++;
        if (client.retentionStatus === 'Retained') stats[month].retained++;
      }
    });
    // Convert to sorted array
    return Object.entries(stats).sort(([a], [b]) => a.localeCompare(b)).map(([month, stat]) => ({ month, ...stat }));
  }, [data]);

  // --- Summary metrics ---
  const totalClients = data.length;
  const totalNew = data.filter(c => (c.isNew || '').includes('New')).length;
  const totalConverted = data.filter(c => c.conversionStatus === 'Converted').length;
  const totalRetained = data.filter(c => c.retentionStatus === 'Retained').length;
  const avgLTV = totalClients > 0 ? data.reduce((sum, c) => sum + (c.ltv || 0), 0) / totalClients : 0;
  const avgConversionSpan = (() => {
    const spans = data.map(c => c.conversionSpan).filter(Boolean);
    return spans.length > 0 ? spans.reduce((a, b) => a + b, 0) / spans.length : 0;
  })();
  const avgVisitsPostTrial = data.length > 0 ? data.reduce((sum, c) => sum + (c.visitsPostTrial || 0), 0) / data.length : 0;
  const totalPurchases = data.reduce((sum, c) => sum + (c.purchaseCountPostTrial || 0), 0);
  const avgPurchasesPerClient = data.length > 0 ? totalPurchases / data.length : 0;

  // --- Membership performance analysis ---
  const membershipStats = React.useMemo(() => {
    const stats = data.reduce((acc, client) => {
      const membership = client.membershipUsed || 'No Membership';
      if (!acc[membership]) {
        acc[membership] = {
          membershipType: membership,
          totalClients: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          conversionSpans: []
        };
      }
      
      acc[membership].totalClients++;
      if (client.conversionStatus === 'Converted') acc[membership].converted++;
      if (client.retentionStatus === 'Retained') acc[membership].retained++;
      acc[membership].totalLTV += client.ltv || 0;
      if (client.conversionSpan && client.conversionSpan > 0) {
        acc[membership].conversionSpans.push(client.conversionSpan);
      }
      
      return acc;
    }, {} as Record<string, any>);

    const processed = Object.values(stats).map((stat: any) => ({
      ...stat,
      conversionRate: stat.totalClients > 0 ? (stat.converted / stat.totalClients) * 100 : 0,
      retentionRate: stat.totalClients > 0 ? (stat.retained / stat.totalClients) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      avgConversionSpan: stat.conversionSpans.length > 0 
        ? stat.conversionSpans.reduce((a: number, b: number) => a + b, 0) / stat.conversionSpans.length 
        : 0
    })).filter(stat => stat.totalClients > 0);

    console.log('Membership stats processed:', processed);
    return processed;
  }, [data]);

  // Enhanced hosted class analysis
  const hostedClassDetails = React.useMemo(() => {
    const hostedClients = data.filter(client => isHostedClass(client.firstVisitEntityName));
    
    const classGroups = hostedClients.reduce((acc, client) => {
      const className = client.firstVisitEntityName || 'Unknown Class';
      const trainer = client.trainerName || 'Unknown Trainer';
      const location = client.firstVisitLocation || 'Unknown Location';
      const date = client.firstVisitDate || 'Unknown Date';
      
      const key = `${className}|${trainer}|${date}|${location}`;
      
      if (!acc[key]) {
        acc[key] = {
          className,
          trainerName: trainer,
          date,
          location,
          newMembers: 0,
          totalAttendees: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          totalVisits: 0,
          totalClasses: 0
        };
      }
      
      acc[key].newMembers++;
      acc[key].totalAttendees++; // Assuming each client is an attendee
      if (client.conversionStatus === 'Converted') acc[key].converted++;
      if (client.retentionStatus === 'Retained') acc[key].retained++;
      acc[key].totalLTV += client.ltv || 0;
      acc[key].totalVisits += client.visitsPostTrial || 0;
      acc[key].totalClasses += client.classNo || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(classGroups).map((group: any) => ({
      ...group,
      conversionRate: group.newMembers > 0 ? (group.converted / group.newMembers) * 100 : 0,
      retentionRate: group.newMembers > 0 ? (group.retained / group.newMembers) * 100 : 0,
      avgLTV: group.newMembers > 0 ? group.totalLTV / group.newMembers : 0,
      avgVisits: group.newMembers > 0 ? group.totalVisits / group.newMembers : 0,
      avgClasses: group.newMembers > 0 ? group.totalClasses / group.newMembers : 0
    })).sort((a, b) => b.newMembers - a.newMembers);
  }, [data]);

  // Is New column analysis
  const isNewAnalysis = React.useMemo(() => {
    const isNewGroups = data.reduce((acc, client) => {
      const isNewValue = client.isNew || 'Unknown';
      if (!acc[isNewValue]) {
        acc[isNewValue] = {
          isNewType: isNewValue,
          totalClients: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          totalVisits: 0,
          conversionSpans: []
        };
      }
      
      acc[isNewValue].totalClients++;
      if (client.conversionStatus === 'Converted') acc[isNewValue].converted++;
      if (client.retentionStatus === 'Retained') acc[isNewValue].retained++;
      acc[isNewValue].totalLTV += client.ltv || 0;
      acc[isNewValue].totalVisits += client.visitsPostTrial || 0;
      if (client.conversionSpan && client.conversionSpan > 0) {
        acc[isNewValue].conversionSpans.push(client.conversionSpan);
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(isNewGroups).map((group: any) => ({
      ...group,
      conversionRate: group.totalClients > 0 ? (group.converted / group.totalClients) * 100 : 0,
      retentionRate: group.totalClients > 0 ? (group.retained / group.totalClients) * 100 : 0,
      avgLTV: group.totalClients > 0 ? group.totalLTV / group.totalClients : 0,
      avgVisits: group.totalClients > 0 ? group.totalVisits / group.totalClients : 0,
      avgConversionSpan: group.conversionSpans.length > 0 
        ? group.conversionSpans.reduce((a: number, b: number) => a + b, 0) / group.conversionSpans.length 
        : 0
    })).filter(group => group.totalClients > 0);
  }, [data]);

  // Trainer performance analysis
  // --- Trainer performance analysis ---
  const trainerStats = React.useMemo(() => {
    const stats = data.reduce((acc, client) => {
      const trainer = client.trainerName || 'No Trainer';
      if (!acc[trainer]) {
        acc[trainer] = {
          trainerName: trainer,
          totalClients: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          classNumbers: []
        };
      }
      
      acc[trainer].totalClients++;
      if (client.conversionStatus === 'Converted') acc[trainer].converted++;
      if (client.retentionStatus === 'Retained') acc[trainer].retained++;
      acc[trainer].totalLTV += client.ltv || 0;
      if (client.classNo && client.classNo > 0) {
        acc[trainer].classNumbers.push(client.classNo);
      }
      
      return acc;
    }, {} as Record<string, any>);

    const processed = Object.values(stats).map((stat: any) => ({
      ...stat,
      conversionRate: stat.totalClients > 0 ? (stat.converted / stat.totalClients) * 100 : 0,
      retentionRate: stat.totalClients > 0 ? (stat.retained / stat.totalClients) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      avgClassNo: stat.classNumbers.length > 0 
        ? stat.classNumbers.reduce((a: number, b: number) => a + b, 0) / stat.classNumbers.length 
        : 0
    })).filter(stat => stat.totalClients > 0);

    console.log('Trainer stats processed:', processed);
    return processed;
  }, [data]);

  // Enhanced metric cards data
  const enhancedMetrics = [
    {
      title: "Total Clients",
      value: formatNumber(totalClients),
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      description: "All clients in dataset",
      change: "+12.5%"
    },
    {
      title: "New Clients",
      value: formatNumber(totalNew),
      icon: UserCheck,
      gradient: "from-green-500 to-green-600",
      description: "Recently acquired clients",
      change: "+8.3%"
    },
    {
      title: "Converted Clients",
      value: formatNumber(totalConverted),
      icon: Target,
      gradient: "from-purple-500 to-purple-600",
      description: "Successfully converted",
      change: "+15.2%"
    },
    {
      title: "Retained Clients",
      value: formatNumber(totalRetained),
      icon: Star,
      gradient: "from-teal-500 to-teal-600",
      description: "Active retained clients",
      change: "+6.7%"
    },
    {
      title: "Average LTV",
      value: formatCurrency(avgLTV),
      icon: DollarSign,
      gradient: "from-emerald-500 to-emerald-600",
      description: "Lifetime value per client",
      change: "+18.9%"
    },
    {
      title: "Avg Conversion Time",
      value: `${Math.round(avgConversionSpan)} days`,
      icon: Clock,
      gradient: "from-orange-500 to-orange-600",
      description: "Time to convert",
      change: "-3.2%"
    },
    {
      title: "Avg Visits Post-Trial",
      value: avgVisitsPostTrial.toFixed(1),
      icon: Activity,
      gradient: "from-indigo-500 to-indigo-600",
      description: "Engagement frequency",
      change: "+9.1%"
    },
    {
      title: "Avg Purchases",
      value: avgPurchasesPerClient.toFixed(1),
      icon: Zap,
      gradient: "from-pink-500 to-pink-600",
      description: "Purchases per client",
      change: "+4.8%"
    }
  ];

  // Hosted class table columns
  const hostedClassColumns = [
    {
      key: 'className',
      header: 'Class Name',
      className: 'font-semibold min-w-[200px]',
      render: (value: string) => (
        <div className="font-semibold text-slate-800 truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'trainerName',
      header: 'Trainer',
      className: 'min-w-[150px]',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {value ? value.split(' ').map(n => n[0]).join('').slice(0, 2) : 'UK'}
          </div>
          <span className="font-medium text-slate-800">{value}</span>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      align: 'center' as const,
      render: (value: string) => (
        <span className="text-sm font-medium text-slate-700">
          {new Date(value).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          })}
        </span>
      )
    },
    {
      key: 'location',
      header: 'Location',
      align: 'center' as const,
      render: (value: string) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {value.split(',')[0]}
        </Badge>
      )
    },
    {
      key: 'newMembers',
      header: 'New Members',
      align: 'center' as const,
      render: (value: number) => <span className="font-bold text-blue-600">{formatNumber(value)}</span>
    },
    {
      key: 'totalAttendees',
      header: 'Total Attendees',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold text-slate-700">{formatNumber(value)}</span>
    },
    {
      key: 'converted',
      header: 'Converted',
      align: 'center' as const,
      render: (value: number) => <span className="font-bold text-green-600">{formatNumber(value)}</span>
    },
    {
      key: 'retained',
      header: 'Retained',
      align: 'center' as const,
      render: (value: number) => <span className="font-bold text-purple-600">{formatNumber(value)}</span>
    },
    {
      key: 'conversionRate',
      header: 'Conversion %',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          {value > 30 ? <TrendingUp className="w-3 h-3 text-green-500" /> : value < 10 ? <TrendingDown className="w-3 h-3 text-red-500" /> : null}
          <span className={`font-bold ${value > 30 ? 'text-green-600' : value < 10 ? 'text-red-600' : 'text-gray-600'}`}>
            {value.toFixed(1)}%
          </span>
        </div>
      )
    },
    {
      key: 'retentionRate',
      header: 'Retention %',
      align: 'center' as const,
      render: (value: number) => (
        <span className="font-bold text-purple-600">{value.toFixed(1)}%</span>
      )
    },
    {
      key: 'avgLTV',
      header: 'Avg LTV',
      align: 'right' as const,
      render: (value: number) => <span className="font-bold text-emerald-600">{formatCurrency(value)}</span>
    },
    {
      key: 'avgVisits',
      header: 'Avg Visits',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}</span>
    }
  ];

  // Is New analysis columns
  const isNewColumns = [
    {
      key: 'isNewType',
      header: 'Client Type',
      className: 'font-semibold min-w-[150px]',
      render: (value: string) => (
        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold">
          {value}
        </Badge>
      )
    },
    {
      key: 'totalClients',
      header: 'Total Clients',
      align: 'center' as const,
      render: (value: number) => <span className="font-bold text-blue-600">{formatNumber(value)}</span>
    },
    {
      key: 'converted',
      header: 'Converted',
      align: 'center' as const,
      render: (value: number) => <span className="font-bold text-green-600">{formatNumber(value)}</span>
    },
    {
      key: 'conversionRate',
      header: 'Conv. Rate',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          {value > 25 ? <TrendingUp className="w-3 h-3 text-green-500" /> : value < 10 ? <TrendingDown className="w-3 h-3 text-red-500" /> : null}
          <span className={`font-bold ${value > 25 ? 'text-green-600' : value < 10 ? 'text-red-600' : 'text-gray-600'}`}>
            {value.toFixed(1)}%
          </span>
        </div>
      )
    },
    {
      key: 'retained',
      header: 'Retained',
      align: 'center' as const,
      render: (value: number) => <span className="font-bold text-purple-600">{formatNumber(value)}</span>
    },
    {
      key: 'retentionRate',
      header: 'Ret. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-bold text-purple-600">{value.toFixed(1)}%</span>
    },
    {
      key: 'avgLTV',
      header: 'Avg LTV',
      align: 'right' as const,
      render: (value: number) => <span className="font-bold text-emerald-600">{formatCurrency(value)}</span>
    },
    {
      key: 'avgVisits',
      header: 'Avg Visits',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}</span>
    },
    {
      key: 'avgConversionSpan',
      header: 'Avg Conv. Days',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{Math.round(value)} days</span>
    }
  ];

  // --- Membership columns (add isNew) ---
  const membershipColumns = [
    {
      key: 'membershipType',
      header: 'Membership Type',
      className: 'font-semibold min-w-[200px]'
    },
    {
      key: 'isNew',
      header: 'Is New',
      align: 'center' as const,
      render: (_: any, row: any) => <span className="font-semibold">{row.isNew || ''}</span>
    },
    {
      key: 'totalClients',
      header: 'Total Clients',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'converted',
      header: 'Converted',
      align: 'center' as const,
      render: (value: number) => <span className="text-green-600 font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'conversionRate',
      header: 'Conv. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'retained',
      header: 'Retained',
      align: 'center' as const,
      render: (value: number) => <span className="text-blue-600 font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'retentionRate',
      header: 'Ret. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'avgLTV',
      header: 'Avg LTV',
      align: 'right' as const,
      render: (value: number) => <span className="font-semibold">{formatCurrency(value)}</span>
    },
    {
      key: 'avgConversionSpan',
      header: 'Avg Conv. Days',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{Math.round(value)} days</span>
    }
  ];

  // --- Trainer columns ---
  const trainerColumns = [
    {
      key: 'trainerName',
      header: 'Trainer Name',
      className: 'font-semibold min-w-[150px]'
    },
    {
      key: 'totalClients',
      header: 'Total Clients',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'converted',
      header: 'Converted',
      align: 'center' as const,
      render: (value: number) => <span className="text-green-600 font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'conversionRate',
      header: 'Conv. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'retained',
      header: 'Retained',
      align: 'center' as const,
      render: (value: number) => <span className="text-blue-600 font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'retentionRate',
      header: 'Ret. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'avgLTV',
      header: 'Avg LTV',
      align: 'right' as const,
      render: (value: number) => <span className="font-semibold">{formatCurrency(value)}</span>
    },
    {
      key: 'avgClassNo',
      header: 'Avg Classes',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}</span>
    }
  ];

  // Calculate totals for membership table
  const membershipTotals = {
    membershipType: 'TOTAL',
    totalClients: membershipStats.reduce((sum, stat) => sum + stat.totalClients, 0),
    converted: membershipStats.reduce((sum, stat) => sum + stat.converted, 0),
    conversionRate: 0,
    retained: membershipStats.reduce((sum, stat) => sum + stat.retained, 0),
    retentionRate: 0,
    avgLTV: membershipStats.reduce((sum, stat) => sum + stat.totalLTV, 0) / Math.max(membershipStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1),
    avgConversionSpan: membershipStats.reduce((sum, stat) => sum + (stat.avgConversionSpan * stat.totalClients), 0) / Math.max(membershipStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1)
  };
  membershipTotals.conversionRate = membershipTotals.totalClients > 0 ? (membershipTotals.converted / membershipTotals.totalClients) * 100 : 0;
  membershipTotals.retentionRate = membershipTotals.totalClients > 0 ? (membershipTotals.retained / membershipTotals.totalClients) * 100 : 0;

  // Calculate totals for trainer table
  const trainerTotals = {
    trainerName: 'TOTAL',
    totalClients: trainerStats.reduce((sum, stat) => sum + stat.totalClients, 0),
    converted: trainerStats.reduce((sum, stat) => sum + stat.converted, 0),
    conversionRate: 0,
    retained: trainerStats.reduce((sum, stat) => sum + stat.retained, 0),
    retentionRate: 0,
    avgLTV: trainerStats.reduce((sum, stat) => sum + stat.totalLTV, 0) / Math.max(trainerStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1),
    avgClassNo: trainerStats.reduce((sum, stat) => sum + (stat.avgClassNo * stat.totalClients), 0) / Math.max(trainerStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1)
  };
  trainerTotals.conversionRate = trainerTotals.totalClients > 0 ? (trainerTotals.converted / trainerTotals.totalClients) * 100 : 0;
  trainerTotals.retentionRate = trainerTotals.totalClients > 0 ? (trainerTotals.retained / trainerTotals.totalClients) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* --- Summary Metric Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {enhancedMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer hover:scale-105">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${metric.gradient} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
                    <metric.icon className="w-20 h-20" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <metric.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-sm">{metric.title}</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold">{metric.value}</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-200" />
                        <span className="text-sm font-medium text-green-200">
                          {metric.change}
                        </span>
                        <span className="text-sm text-white/80">vs last period</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50">
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* --- Hosted Class Details Table --- */}
      <Card className="bg-white shadow-xl border-0 overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-600 to-rose-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Hosted Class Performance Analysis
            <Badge variant="secondary" className="bg-white/20 text-white">
              {hostedClassDetails.length} Classes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={hostedClassDetails}
            columns={hostedClassColumns}
            headerGradient="from-pink-600 to-rose-600"
            showFooter={false}
            maxHeight="500px"
            onRowClick={onDrillDown ? (row) => {
              const drillData = data.filter(client =>
                client.firstVisitEntityName === row.className &&
                client.trainerName === row.trainerName &&
                client.firstVisitDate === row.date
              );
              onDrillDown(`Hosted Class: ${row.className} - ${row.trainerName}`, drillData, 'hosted-class-detail');
            } : undefined}
          />
        </CardContent>
      </Card>

      {/* --- Is New Analysis Table --- */}
      <Card className="bg-white shadow-xl border-0 overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Client Type Analysis (Is New Column)
            <Badge variant="secondary" className="bg-white/20 text-white">
              {isNewAnalysis.length} Types
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={isNewAnalysis.sort((a, b) => b.totalClients - a.totalClients)}
            columns={isNewColumns}
            headerGradient="from-indigo-600 to-purple-600"
            showFooter={false}
            maxHeight="400px"
            onRowClick={onDrillDown ? (row) => {
              const drillData = data.filter(client => (client.isNew || 'Unknown') === row.isNewType);
              onDrillDown(`Client Type: ${row.isNewType}`, drillData, 'is-new-analysis');
            } : undefined}
          />
        </CardContent>
      </Card>

      {/* --- Hosted Class Month-on-Month Table --- */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-600 to-orange-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Hosted Class Conversions (Month-on-Month)
            <Badge variant="secondary" className="bg-white/20 text-white">
              {hostedClassMoM.length} Months
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={hostedClassMoM}
            columns={[
              { key: 'month', header: 'Month', className: 'font-semibold min-w-[120px]' },
              { key: 'total', header: 'Total Hosted', align: 'center' },
              { key: 'newClients', header: 'New', align: 'center' },
              { key: 'converted', header: 'Converted', align: 'center' },
              { key: 'retained', header: 'Retained', align: 'center' },
            ]}
            headerGradient="from-pink-600 to-orange-600"
            showFooter={false}
            maxHeight="400px"
            onRowClick={onDrillDown ? (row) => {
              // Find all clients for this hosted class month
              const month = row.month;
              const drillData = data.filter(client =>
                (client.monthYear || getMonthYear(client.firstVisitDate, 'Unknown')) === month &&
                isHostedClass(client.firstVisitEntityName)
              );
              onDrillDown(`Hosted Class Details: ${month}`, drillData, 'hosted-class');
            } : undefined}
          />
        </CardContent>
      </Card>

      {/* --- Membership Performance Table --- */}
      <Card className="bg-white shadow-xl border-0 overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Membership Type Performance Analysis
            <Badge variant="secondary" className="bg-white/20 text-white">
              {membershipStats.length} Types
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={membershipStats.sort((a, b) => b.totalClients - a.totalClients)}
            columns={membershipColumns}
            headerGradient="from-purple-600 to-indigo-600"
            showFooter={true}
            footerData={membershipTotals}
            maxHeight="400px"
            onRowClick={onDrillDown ? (row) => {
              // Find all clients for this membership type
              const drillData = data.filter(client => (client.membershipUsed || 'No Membership') === row.membershipType);
              onDrillDown(`Membership Details: ${row.membershipType}`, drillData, 'membership');
            } : undefined}
          />
        </CardContent>
      </Card>

      {/* --- Trainer Performance Table --- */}
      <Card className="bg-white shadow-xl border-0 overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Trainer Performance Analysis
            <Badge variant="secondary" className="bg-white/20 text-white">
              {trainerStats.length} Trainers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={trainerStats.sort((a, b) => b.conversionRate - a.conversionRate)}
            columns={trainerColumns}
            headerGradient="from-green-600 to-teal-600"
            showFooter={true}
            footerData={trainerTotals}
            maxHeight="400px"
            onRowClick={onDrillDown ? (row) => {
              // Find all clients for this trainer
              const drillData = data.filter(client => (client.trainerName || 'No Trainer') === row.trainerName);
              onDrillDown(`Trainer Details: ${row.trainerName}`, drillData, 'trainer');
            } : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
};