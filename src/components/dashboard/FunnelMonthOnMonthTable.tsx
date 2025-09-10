
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3 } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FunnelMonthOnMonthTableProps {
  data: LeadsData[];
  onDrillDown?: (title: string, data: LeadsData[], type: string) => void;
}

type MetricType = 'totalLeads' | 'trialsCompleted' | 'trialsScheduled' | 'proximityIssues' | 'convertedLeads' | 'trialToMemberRate' | 'leadToTrialRate' | 'leadToMemberRate' | 'ltv' | 'avgVisits' | 'pipelineHealth';

export const FunnelMonthOnMonthTable: React.FC<FunnelMonthOnMonthTableProps> = ({ data, onDrillDown }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalLeads');

  // Generate months from current month back to Jan 2024
  const generateMonths = () => {
    const months = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Start from current month and go back to Jan 2024
    for (let year = currentYear; year >= 2024; year--) {
      const startMonth = year === currentYear ? currentMonth : 11;
      const endMonth = year === 2024 ? 0 : 0;
      
      for (let month = startMonth; month >= endMonth; month--) {
        const monthKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;
        const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        months.push({ key: monthKey, name: monthName, year, month: month + 1 });
      }
    }
    
    return months;
  };

  const months = generateMonths();

  // Process data by source and month
  const processedData = useMemo(() => {
    if (!data.length) return [];

    // Group by source
    const sourceData = data.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = {};
      }
      
      if (lead.createdAt) {
        const date = new Date(lead.createdAt);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!acc[source][monthKey]) {
          acc[source][monthKey] = {
            totalLeads: 0,
            trialsCompleted: 0,
            trialsScheduled: 0,
            proximityIssues: 0,
            convertedLeads: 0,
            totalLTV: 0,
            totalVisits: 0
          };
        }
        
        const monthData = acc[source][monthKey];
        monthData.totalLeads += 1;
        
        if (lead.stage === 'Trial Completed') monthData.trialsCompleted += 1;
        if (lead.stage?.includes('Trial')) monthData.trialsScheduled += 1;
        if (lead.stage === 'Proximity Issues') monthData.proximityIssues += 1;
        if (lead.conversionStatus === 'Converted') monthData.convertedLeads += 1;
        
        monthData.totalLTV += lead.ltv || 0;
        monthData.totalVisits += lead.visits || 0;
      }
      
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Convert to table format
    return Object.keys(sourceData).map(source => {
      const sourceStats = sourceData[source];
      const result: any = { source };
      
      months.forEach(month => {
        const monthData = sourceStats[month.key] || {
          totalLeads: 0,
          trialsCompleted: 0,
          trialsScheduled: 0,
          proximityIssues: 0,
          convertedLeads: 0,
          totalLTV: 0,
          totalVisits: 0
        };
        
        // Calculate derived metrics
        const trialToMemberRate = monthData.trialsCompleted > 0 ? (monthData.convertedLeads / monthData.trialsCompleted) * 100 : 0;
        const leadToTrialRate = monthData.totalLeads > 0 ? (monthData.trialsCompleted / monthData.totalLeads) * 100 : 0;
        const leadToMemberRate = monthData.totalLeads > 0 ? (monthData.convertedLeads / monthData.totalLeads) * 100 : 0;
        const avgLTV = monthData.totalLeads > 0 ? monthData.totalLTV / monthData.totalLeads : 0;
        const avgVisits = monthData.totalLeads > 0 ? monthData.totalVisits / monthData.totalLeads : 0;
        const pipelineHealth = monthData.totalLeads > 0 ? ((monthData.totalLeads - monthData.proximityIssues) / monthData.totalLeads) * 100 : 0;
        
        result[month.key] = {
          totalLeads: monthData.totalLeads,
          trialsCompleted: monthData.trialsCompleted,
          trialsScheduled: monthData.trialsScheduled,
          proximityIssues: monthData.proximityIssues,
          convertedLeads: monthData.convertedLeads,
          trialToMemberRate,
          leadToTrialRate,
          leadToMemberRate,
          ltv: avgLTV,
          avgVisits,
          pipelineHealth
        };
      });
      
      return result;
    }).filter(source => {
      // Filter out sources with no data
      return months.some(month => source[month.key]?.totalLeads > 0);
    });
  }, [data, months]);

  // Calculate totals for footer
  const totals = useMemo(() => {
    const result: any = { source: 'TOTALS' };
    
    months.forEach(month => {
      const monthTotals = processedData.reduce((acc, source) => {
        const monthData = source[month.key] || {};
        acc.totalLeads += monthData.totalLeads || 0;
        acc.trialsCompleted += monthData.trialsCompleted || 0;
        acc.trialsScheduled += monthData.trialsScheduled || 0;
        acc.proximityIssues += monthData.proximityIssues || 0;
        acc.convertedLeads += monthData.convertedLeads || 0;
        acc.totalLTV += (monthData.ltv || 0) * (monthData.totalLeads || 0);
        acc.totalVisits += (monthData.avgVisits || 0) * (monthData.totalLeads || 0);
        return acc;
      }, {
        totalLeads: 0,
        trialsCompleted: 0,
        trialsScheduled: 0,
        proximityIssues: 0,
        convertedLeads: 0,
        totalLTV: 0,
        totalVisits: 0
      });
      
      const trialToMemberRate = monthTotals.trialsCompleted > 0 ? (monthTotals.convertedLeads / monthTotals.trialsCompleted) * 100 : 0;
      const leadToTrialRate = monthTotals.totalLeads > 0 ? (monthTotals.trialsCompleted / monthTotals.totalLeads) * 100 : 0;
      const leadToMemberRate = monthTotals.totalLeads > 0 ? (monthTotals.convertedLeads / monthTotals.totalLeads) * 100 : 0;
      const avgLTV = monthTotals.totalLeads > 0 ? monthTotals.totalLTV / monthTotals.totalLeads : 0;
      const avgVisits = monthTotals.totalLeads > 0 ? monthTotals.totalVisits / monthTotals.totalLeads : 0;
      const pipelineHealth = monthTotals.totalLeads > 0 ? ((monthTotals.totalLeads - monthTotals.proximityIssues) / monthTotals.totalLeads) * 100 : 0;
      
      result[month.key] = {
        totalLeads: monthTotals.totalLeads,
        trialsCompleted: monthTotals.trialsCompleted,
        trialsScheduled: monthTotals.trialsScheduled,
        proximityIssues: monthTotals.proximityIssues,
        convertedLeads: monthTotals.convertedLeads,
        trialToMemberRate,
        leadToTrialRate,
        leadToMemberRate,
        ltv: avgLTV,
        avgVisits,
        pipelineHealth
      };
    });
    
    return result;
  }, [processedData, months]);

const formatValue = (value: any, metric: MetricType) => {
    if (typeof value !== 'object' || !value) return '-';
    
    const metricValue = value[metric];
    if (metricValue === undefined || metricValue === 0) return '-';
    
    switch (metric) {
      case 'ltv':
        return metricValue < 1000 ? `₹${Math.round(metricValue)}` : formatCurrency(metricValue);
      case 'trialToMemberRate':
      case 'leadToTrialRate':
      case 'leadToMemberRate':
      case 'pipelineHealth':
        return `${metricValue.toFixed(1)}%`;
      case 'avgVisits':
        return metricValue.toFixed(1);
      default:
        return formatNumber(metricValue);
    }
  };

  const columns = [
    {
      key: 'source',
      header: 'Source',
      render: (value: string) => (
        <div className="font-semibold text-slate-800 min-w-[120px] truncate">
          {value}
        </div>
      ),
      align: 'left' as const
    },
    ...months.map(month => ({
      key: month.key,
      header: month.name,
      render: (value: any) => (
        <div className="text-center font-medium text-xs">
          {formatValue(value, selectedMetric)}
        </div>
      ),
      align: 'center' as const
    }))
  ];

  const metricTabs = [
    { value: 'totalLeads', label: 'Total Leads' },
    { value: 'trialsCompleted', label: 'Trials Completed' },
    { value: 'trialsScheduled', label: 'Trials Scheduled' },
    { value: 'proximityIssues', label: 'Proximity Issues' },
    { value: 'convertedLeads', label: 'Converted Leads' },
    { value: 'trialToMemberRate', label: 'Trial → Member Rate' },
    { value: 'leadToTrialRate', label: 'Lead → Trial Rate' },
    { value: 'leadToMemberRate', label: 'Lead → Member Rate' },
    { value: 'ltv', label: 'Average LTV' },
    { value: 'avgVisits', label: 'Avg Visits/Lead' },
    { value: 'pipelineHealth', label: 'Pipeline Health' }
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-red-600 via-red-700 to-red-800">
        <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
          <Calendar className="w-5 h-5" />
          Month-on-Month Source Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Metric Selector */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricType)}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1 bg-white">
              {metricTabs.map(tab => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className="text-xs p-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="text-red-600 border-red-200">
              <BarChart3 className="w-3 h-3 mr-1" />
              {metricTabs.find(t => t.value === selectedMetric)?.label}
            </Badge>
            <span className="text-xs text-slate-600">
              Showing {processedData.length} sources across {months.length} months
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="max-h-[500px] overflow-auto">
          <ModernDataTable
            data={processedData}
            columns={columns}
            loading={false}
            stickyHeader={true}
            showFooter={true}
            footerData={totals}
            maxHeight="400px"
            className="rounded-none"
            headerGradient="from-red-600 to-red-700"
            onRowClick={(row) => {
              const filteredData = data.filter(lead => lead.source === row.source);
              onDrillDown?.(`Source: ${row.source} - Month Analysis`, filteredData, 'month-source');
            }}
          />
        </div>

        {/* Summary Section */}
        <div className="p-4 bg-slate-50 border-t">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-red-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Performance Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-600">Top Source (Volume):</span>
              <div className="font-bold text-red-600">
                {processedData.length > 0 ? processedData[0].source : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Active Sources:</span>
              <div className="font-bold text-slate-800">
                {processedData.length}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Current Month Total:</span>
              <div className="font-bold text-green-600">
                {months.length > 0 ? formatValue(totals[months[0].key], selectedMetric) : '-'}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Data Range:</span>
              <div className="font-bold text-slate-800">
                {months.length > 0 ? `${months[months.length - 1].name} - ${months[0].name}` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
