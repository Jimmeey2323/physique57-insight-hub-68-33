import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { HeartHandshake, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface FunnelHealthMetricsTableProps {
  data: LeadsData[];
}

export const FunnelHealthMetricsTable: React.FC<FunnelHealthMetricsTableProps> = ({ data }) => {
  const healthMetrics = useMemo(() => {
    if (!data.length) return [];

    const totalLeads = data.length;
    const trialsScheduled = data.filter(l => l.stage?.includes('Trial')).length;
    const trialsCompleted = data.filter(l => l.stage === 'Trial Completed').length;
    const converted = data.filter(l => l.conversionStatus === 'Converted').length;
    const lost = data.filter(l => l.status === 'Lost').length;
    const proximityIssues = data.filter(l => l.stage === 'Proximity Issues').length;
    const followUps = data.filter(l => l.followUp1Date || l.followUp2Date || l.followUp3Date).length;
    
    const totalLTV = data.reduce((sum, l) => sum + (l.ltv || 0), 0);
    const totalVisits = data.reduce((sum, l) => sum + (l.visits || 0), 0);

    return [
      {
        metric: 'Lead Volume Health',
        value: totalLeads,
        benchmark: 1000,
        status: totalLeads >= 1000 ? 'Excellent' : totalLeads >= 500 ? 'Good' : 'Needs Attention',
        description: 'Total leads generated in period'
      },
      {
        metric: 'Trial Scheduling Rate',
        value: totalLeads > 0 ? (trialsScheduled / totalLeads) * 100 : 0,
        benchmark: 60,
        status: ((trialsScheduled / totalLeads) * 100) >= 60 ? 'Excellent' : ((trialsScheduled / totalLeads) * 100) >= 40 ? 'Good' : 'Needs Attention',
        description: 'Percentage of leads scheduling trials'
      },
      {
        metric: 'Trial Completion Rate',
        value: trialsScheduled > 0 ? (trialsCompleted / trialsScheduled) * 100 : 0,
        benchmark: 80,
        status: ((trialsCompleted / trialsScheduled) * 100) >= 80 ? 'Excellent' : ((trialsCompleted / trialsScheduled) * 100) >= 60 ? 'Good' : 'Needs Attention',
        description: 'Trials completed vs scheduled'
      },
      {
        metric: 'Conversion Efficiency',
        value: totalLeads > 0 ? (converted / totalLeads) * 100 : 0,
        benchmark: 25,
        status: ((converted / totalLeads) * 100) >= 25 ? 'Excellent' : ((converted / totalLeads) * 100) >= 15 ? 'Good' : 'Needs Attention',
        description: 'Overall lead to member conversion'
      },
      {
        metric: 'Proximity Issue Rate',
        value: totalLeads > 0 ? (proximityIssues / totalLeads) * 100 : 0,
        benchmark: 10,
        status: ((proximityIssues / totalLeads) * 100) <= 10 ? 'Excellent' : ((proximityIssues / totalLeads) * 100) <= 20 ? 'Good' : 'Needs Attention',
        description: 'Leads lost due to location issues'
      },
      {
        metric: 'Follow-up Coverage',
        value: totalLeads > 0 ? (followUps / totalLeads) * 100 : 0,
        benchmark: 70,
        status: ((followUps / totalLeads) * 100) >= 70 ? 'Excellent' : ((followUps / totalLeads) * 100) >= 50 ? 'Good' : 'Needs Attention',
        description: 'Leads receiving follow-up actions'
      },
      {
        metric: 'Average LTV',
        value: totalLeads > 0 ? totalLTV / totalLeads : 0,
        benchmark: 5000,
        status: (totalLTV / totalLeads) >= 5000 ? 'Excellent' : (totalLTV / totalLeads) >= 3000 ? 'Good' : 'Needs Attention',
        description: 'Revenue quality per lead'
      },
      {
        metric: 'Engagement Level',
        value: totalLeads > 0 ? totalVisits / totalLeads : 0,
        benchmark: 3,
        status: (totalVisits / totalLeads) >= 3 ? 'Excellent' : (totalVisits / totalLeads) >= 2 ? 'Good' : 'Needs Attention',
        description: 'Average visits per lead'
      }
    ];
  }, [data]);

  const formatValue = (metric: any) => {
    if (metric.metric.includes('Rate') || metric.metric.includes('Coverage') || metric.metric.includes('Efficiency')) {
      return `${metric.value.toFixed(1)}%`;
    } else if (metric.metric.includes('LTV')) {
      return formatCurrency(metric.value);
    } else if (metric.metric.includes('Volume')) {
      return formatNumber(metric.value);
    } else {
      return metric.value.toFixed(1);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Excellent':
        return <Badge className="w-24 justify-center bg-green-600 text-white hover:bg-green-700 font-bold">Excellent</Badge>;
      case 'Good':
        return <Badge className="w-24 justify-center bg-yellow-500 text-white hover:bg-yellow-600 font-bold">Good</Badge>;
      default:
        return <Badge className="w-24 justify-center bg-red-600 text-white hover:bg-red-700 font-bold">Needs Fix</Badge>;
    }
  };

  const columns = [
    {
      key: 'metric',
      header: 'Health Metric',
      render: (value: string) => (
        <div className="font-semibold text-slate-800 min-w-[200px] text-left">
          {value}
        </div>
      ),
      align: 'left' as const
    },
    {
      key: 'value',
      header: 'Current Value',
      render: (value: number, item: any) => (
        <div className="text-center font-bold text-blue-600">
          {formatValue(item)}
        </div>
      ),
      align: 'center' as const
    },
    {
      key: 'benchmark',
      header: 'Benchmark',
      render: (value: number, item: any) => (
        <div className="text-center font-medium text-slate-600">
          {item.metric.includes('Rate') || item.metric.includes('Coverage') || item.metric.includes('Efficiency') 
            ? `${value}%` 
            : item.metric.includes('LTV') 
            ? formatCurrency(value)
            : value.toLocaleString('en-IN')
          }
        </div>
      ),
      align: 'center' as const
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <div className="text-center">
          {getStatusBadge(value)}
        </div>
      ),
      align: 'center' as const
    },
    {
      key: 'description',
      header: 'Description',
      render: (value: string) => (
        <div className="text-sm text-slate-600 max-w-[200px]">
          {value}
        </div>
      ),
      align: 'left' as const
    }
  ];

  const healthScore = useMemo(() => {
    const scores = healthMetrics.map(metric => {
      switch (metric.status) {
        case 'Excellent': return 100;
        case 'Good': return 70;
        default: return 30;
      }
    });
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }, [healthMetrics]);

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <HeartHandshake className="w-6 h-6 text-red-600 animate-pulse" />
            Funnel Health Metrics
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Overall Health:</span>
            <Badge 
              className={cn(
                "text-lg px-4 py-2 font-black",
                healthScore >= 85 ? "bg-green-600 text-white" 
                : healthScore >= 70 ? "bg-yellow-500 text-white" 
                : "bg-red-600 text-white"
              )}
            >
              {healthScore}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-auto">
          <ModernDataTable
            data={healthMetrics}
            columns={columns}
            loading={false}
            stickyHeader={true}
            maxHeight="500px"
            className="rounded-none"
          />
        </div>

        {/* Health Summary */}
        <div className="p-6 bg-slate-50 border-t">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-slate-800">Health Assessment</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">Strengths</span>
              </div>
              <div className="text-sm text-green-600">
                {healthMetrics.filter(m => m.status === 'Excellent').length} metrics excellent
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Opportunities</span>
              </div>
              <div className="text-sm text-yellow-600">
                {healthMetrics.filter(m => m.status === 'Good').length} metrics good
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-red-800">Action Needed</span>
              </div>
              <div className="text-sm text-red-600">
                {healthMetrics.filter(m => m.status === 'Needs Attention').length} metrics need attention
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border">
            <h4 className="font-semibold text-slate-800 mb-2">Quick Recommendations:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              {healthScore < 70 && <li>• Focus on improving trial completion rates</li>}
              {healthMetrics.find(m => m.metric === 'Proximity Issue Rate' && m.status === 'Needs Attention') && 
                <li>• Address location accessibility concerns</li>}
              {healthMetrics.find(m => m.metric === 'Follow-up Coverage' && m.status === 'Needs Attention') && 
                <li>• Implement systematic follow-up processes</li>}
              {healthScore >= 85 && <li>• Excellent funnel health - maintain current strategies</li>}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
