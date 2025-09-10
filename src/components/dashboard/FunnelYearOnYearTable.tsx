import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface FunnelYearOnYearTableProps {
  allData: LeadsData[]; // Use all data, not filtered
  onDrillDown?: (title: string, data: LeadsData[], type: string) => void;
}
type MetricType = 'totalLeads' | 'trialsCompleted' | 'trialsScheduled' | 'proximityIssues' | 'convertedLeads' | 'trialToMemberRate' | 'leadToTrialRate' | 'leadToMemberRate' | 'ltv' | 'avgVisits' | 'pipelineHealth';
export const FunnelYearOnYearTable: React.FC<FunnelYearOnYearTableProps> = ({
  allData,
  onDrillDown
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalLeads');
  const processedData = useMemo(() => {
    if (!allData.length) return [];
    const sourceData = allData.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = {};
      }
      if (lead.createdAt) {
        const date = new Date(lead.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const yearMonthKey = `${year}-${String(month).padStart(2, '0')}`;
        if (!acc[source][yearMonthKey]) {
          acc[source][yearMonthKey] = {
            totalLeads: 0,
            trialsCompleted: 0,
            trialsScheduled: 0,
            proximityIssues: 0,
            convertedLeads: 0,
            totalLTV: 0,
            totalVisits: 0
          };
        }
        const yearMonthData = acc[source][yearMonthKey];
        yearMonthData.totalLeads += 1;
        if (lead.stage === 'Trial Completed') yearMonthData.trialsCompleted += 1;
        if (lead.stage?.includes('Trial')) yearMonthData.trialsScheduled += 1;
        if (lead.stage === 'Proximity Issues') yearMonthData.proximityIssues += 1;
        if (lead.conversionStatus === 'Converted') yearMonthData.convertedLeads += 1;
        yearMonthData.totalLTV += lead.ltv || 0;
        yearMonthData.totalVisits += lead.visits || 0;
      }
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Generate months for current year and previous year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const months = [];
    for (let month = currentMonth; month >= 1; month--) {
      const monthName = new Date(2025, month - 1).toLocaleString('default', {
        month: 'short'
      });
      months.push({
        month,
        name: monthName,
        current: `${currentYear}-${String(month).padStart(2, '0')}`,
        previous: `${currentYear - 1}-${String(month).padStart(2, '0')}`
      });
    }
    return Object.keys(sourceData).map(source => {
      const sourceStats = sourceData[source];
      const result: any = {
        source
      };
      months.forEach(monthInfo => {
        const currentData = sourceStats[monthInfo.current] || {
          totalLeads: 0,
          trialsCompleted: 0,
          trialsScheduled: 0,
          proximityIssues: 0,
          convertedLeads: 0,
          totalLTV: 0,
          totalVisits: 0
        };
        const previousData = sourceStats[monthInfo.previous] || {
          totalLeads: 0,
          trialsCompleted: 0,
          trialsScheduled: 0,
          proximityIssues: 0,
          convertedLeads: 0,
          totalLTV: 0,
          totalVisits: 0
        };
        const calculateMetric = (data: any) => {
          const trialToMemberRate = data.trialsCompleted > 0 ? data.convertedLeads / data.trialsCompleted * 100 : 0;
          const leadToTrialRate = data.totalLeads > 0 ? data.trialsCompleted / data.totalLeads * 100 : 0;
          const leadToMemberRate = data.totalLeads > 0 ? data.convertedLeads / data.totalLeads * 100 : 0;
          const avgLTV = data.totalLeads > 0 ? data.totalLTV / data.totalLeads : 0;
          const avgVisits = data.totalLeads > 0 ? data.totalVisits / data.totalLeads : 0;
          const pipelineHealth = data.totalLeads > 0 ? (data.totalLeads - data.proximityIssues) / data.totalLeads * 100 : 0;
          return {
            totalLeads: data.totalLeads,
            trialsCompleted: data.trialsCompleted,
            trialsScheduled: data.trialsScheduled,
            proximityIssues: data.proximityIssues,
            convertedLeads: data.convertedLeads,
            trialToMemberRate,
            leadToTrialRate,
            leadToMemberRate,
            ltv: avgLTV,
            avgVisits,
            pipelineHealth
          };
        };
        const currentMetrics = calculateMetric(currentData);
        const previousMetrics = calculateMetric(previousData);
        result[`${monthInfo.name}_${currentYear}`] = currentMetrics;
        result[`${monthInfo.name}_${currentYear - 1}`] = previousMetrics;
      });
      return result;
    }).filter(source => {
      return months.some(monthInfo => source[`${monthInfo.name}_${currentYear}`]?.totalLeads > 0 || source[`${monthInfo.name}_${currentYear - 1}`]?.totalLeads > 0);
    });
  }, [allData]);
  const totals = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const months = [];
    for (let month = currentMonth; month >= 1; month--) {
      const monthName = new Date(2025, month - 1).toLocaleString('default', {
        month: 'short'
      });
      months.push({
        month,
        name: monthName
      });
    }
    const result: any = {
      source: 'TOTALS'
    };
    months.forEach(monthInfo => {
      const currentTotals = processedData.reduce((acc, source) => {
        const data = source[`${monthInfo.name}_${currentYear}`] || {};
        acc.totalLeads += data.totalLeads || 0;
        acc.trialsCompleted += data.trialsCompleted || 0;
        acc.trialsScheduled += data.trialsScheduled || 0;
        acc.proximityIssues += data.proximityIssues || 0;
        acc.convertedLeads += data.convertedLeads || 0;
        acc.totalLTV += (data.ltv || 0) * (data.totalLeads || 0);
        acc.totalVisits += (data.avgVisits || 0) * (data.totalLeads || 0);
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
      const previousTotals = processedData.reduce((acc, source) => {
        const data = source[`${monthInfo.name}_${currentYear - 1}`] || {};
        acc.totalLeads += data.totalLeads || 0;
        acc.trialsCompleted += data.trialsCompleted || 0;
        acc.trialsScheduled += data.trialsScheduled || 0;
        acc.proximityIssues += data.proximityIssues || 0;
        acc.convertedLeads += data.convertedLeads || 0;
        acc.totalLTV += (data.ltv || 0) * (data.totalLeads || 0);
        acc.totalVisits += (data.avgVisits || 0) * (data.totalLeads || 0);
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
      const calculateTotalMetrics = (totals: any) => {
        const trialToMemberRate = totals.trialsCompleted > 0 ? totals.convertedLeads / totals.trialsCompleted * 100 : 0;
        const leadToTrialRate = totals.totalLeads > 0 ? totals.trialsCompleted / totals.totalLeads * 100 : 0;
        const leadToMemberRate = totals.totalLeads > 0 ? totals.convertedLeads / totals.totalLeads * 100 : 0;
        const avgLTV = totals.totalLeads > 0 ? totals.totalLTV / totals.totalLeads : 0;
        const avgVisits = totals.totalLeads > 0 ? totals.totalVisits / totals.totalLeads : 0;
        const pipelineHealth = totals.totalLeads > 0 ? (totals.totalLeads - totals.proximityIssues) / totals.totalLeads * 100 : 0;
        return {
          totalLeads: totals.totalLeads,
          trialsCompleted: totals.trialsCompleted,
          trialsScheduled: totals.trialsScheduled,
          proximityIssues: totals.proximityIssues,
          convertedLeads: totals.convertedLeads,
          trialToMemberRate,
          leadToTrialRate,
          leadToMemberRate,
          ltv: avgLTV,
          avgVisits,
          pipelineHealth
        };
      };
      result[`${monthInfo.name}_${currentYear}`] = calculateTotalMetrics(currentTotals);
      result[`${monthInfo.name}_${currentYear - 1}`] = calculateTotalMetrics(previousTotals);
    });
    return result;
  }, [processedData]);
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
        return metricValue.toLocaleString('en-IN');
    }
  };
  const metricTabs = [{
    value: 'totalLeads',
    label: 'Total Leads'
  }, {
    value: 'trialsCompleted',
    label: 'Trials Completed'
  }, {
    value: 'trialsScheduled',
    label: 'Trials Scheduled'
  }, {
    value: 'proximityIssues',
    label: 'Proximity Issues'
  }, {
    value: 'convertedLeads',
    label: 'Converted Leads'
  }, {
    value: 'trialToMemberRate',
    label: 'Trial → Member Rate'
  }, {
    value: 'leadToTrialRate',
    label: 'Lead → Trial Rate'
  }, {
    value: 'leadToMemberRate',
    label: 'Lead → Member Rate'
  }, {
    value: 'ltv',
    label: 'Average LTV'
  }, {
    value: 'avgVisits',
    label: 'Avg Visits/Lead'
  }, {
    value: 'pipelineHealth',
    label: 'Pipeline Health'
  }];

  // Generate columns
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const months = [];
  for (let month = currentMonth; month >= 1; month--) {
    const monthName = new Date(2025, month - 1).toLocaleString('default', {
      month: 'short'
    });
    months.push({
      month,
      name: monthName
    });
  }
  const columns = [{
    key: 'source',
    header: 'Source',
    render: (value: string) => <div className="font-semibold text-slate-800 min-w-[120px] truncate">
          {value}
        </div>,
    align: 'left' as const
  }, ...months.flatMap(monthInfo => [{
    key: `${monthInfo.name}_${currentYear}`,
    header: `${monthInfo.name} ${currentYear}`,
    render: (value: any) => <div className="text-center font-medium text-xs my-0 py-0 mx-[20px]">
            {formatValue(value, selectedMetric)}
          </div>,
    align: 'center' as const
  }, {
    key: `${monthInfo.name}_${currentYear - 1}`,
    header: `${monthInfo.name} ${currentYear - 1}`,
    render: (value: any, row: any) => {
      const currentValue = row[`${monthInfo.name}_${currentYear}`];
      const previousValue = value;
      let growth = null;
      if (currentValue && previousValue) {
        const current = currentValue[selectedMetric];
        const previous = previousValue[selectedMetric];
        if (current && previous && previous !== 0) {
          growth = (current - previous) / previous * 100;
        }
      }
      return <div className="text-center group">
          <div className="font-medium text-slate-600 text-xs text-center mx-[20px]">
            {formatValue(value, selectedMetric)}
          </div>
          {growth !== null && Math.abs(growth) > 0.1}
        </div>;
    },
    align: 'center' as const
  }])];
  return <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
        <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
          <Calendar className="w-5 h-5" />
          Year-on-Year Source Performance (All Data)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Metric Selector */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <Tabs value={selectedMetric} onValueChange={value => setSelectedMetric(value as MetricType)}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 gap-1 h-auto p-1 bg-white">
              {metricTabs.map(tab => <TabsTrigger key={tab.value} value={tab.value} className="text-xs p-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  {tab.label}
                </TabsTrigger>)}
            </TabsList>
          </Tabs>
          
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="text-purple-600 border-purple-200">
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
          <ModernDataTable data={processedData} columns={columns} loading={false} stickyHeader={true} showFooter={true} footerData={totals} maxHeight="400px" className="rounded-none" headerGradient="from-purple-600 to-pink-600" onRowClick={row => {
          const filteredData = allData.filter(lead => lead.source === row.source);
          onDrillDown?.(`Source: ${row.source} - Year Analysis`, filteredData, 'year-source');
        }} />
        </div>
      </CardContent>
    </Card>;
};