import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Clock, 
  DollarSign, 
  Activity, 
  MapPin, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  UserCheck,
  Calendar,
  BarChart3
} from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FunnelAnalyticsTablesProps {
  data: LeadsData[];
  onDrillDown?: (title: string, data: LeadsData[], type: string) => void;
}

export const FunnelAnalyticsTables: React.FC<FunnelAnalyticsTablesProps> = ({ 
  data, 
  onDrillDown 
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Conversion by Source Analytics
  const conversionBySource = useMemo(() => {
    const sourceStats = data.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = {
          totalLeads: 0,
          trialsScheduled: 0,
          trialsCompleted: 0,
          converted: 0,
          totalLTV: 0,
          totalVisits: 0,
          proximityIssues: 0
        };
      }
      
      acc[source].totalLeads += 1;
      if (lead.stage?.includes('Trial')) acc[source].trialsScheduled += 1;
      if (lead.stage === 'Trial Completed') acc[source].trialsCompleted += 1;
      if (lead.conversionStatus === 'Converted') acc[source].converted += 1;
      if (lead.stage?.includes('Proximity')) acc[source].proximityIssues += 1;
      acc[source].totalLTV += lead.ltv || 0;
      acc[source].totalVisits += lead.visits || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(sourceStats).map(([source, stats]) => ({
      source,
      totalLeads: stats.totalLeads,
      trialsScheduled: stats.trialsScheduled,
      trialsCompleted: stats.trialsCompleted,
      converted: stats.converted,
      conversionRate: stats.totalLeads > 0 ? (stats.converted / stats.totalLeads) * 100 : 0,
      trialToMemberRate: stats.trialsCompleted > 0 ? (stats.converted / stats.trialsCompleted) * 100 : 0,
      avgLTV: stats.totalLeads > 0 ? stats.totalLTV / stats.totalLeads : 0,
      avgVisits: stats.totalLeads > 0 ? stats.totalVisits / stats.totalLeads : 0,
      proximityIssues: stats.proximityIssues,
      leadQuality: ((stats.converted * 0.4) + (stats.trialsCompleted * 0.3) + ((stats.totalLeads - stats.proximityIssues) * 0.3)) / stats.totalLeads * 100
    })).sort((a, b) => b.totalLeads - a.totalLeads);
  }, [data]);

  // Conversion by Stage Analytics
  const conversionByStage = useMemo(() => {
    const stageStats = data.reduce((acc, lead) => {
      const stage = lead.stage || 'Unknown';
      if (!acc[stage]) {
        acc[stage] = {
          totalLeads: 0,
          converted: 0,
          totalLTV: 0,
          avgDaysInStage: 0,
          retained: 0
        };
      }
      
      acc[stage].totalLeads += 1;
      if (lead.conversionStatus === 'Converted') acc[stage].converted += 1;
      if (lead.retentionStatus === 'Retained') acc[stage].retained += 1;
      acc[stage].totalLTV += lead.ltv || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(stageStats).map(([stage, stats]) => ({
      stage,
      totalLeads: stats.totalLeads,
      converted: stats.converted,
      conversionRate: stats.totalLeads > 0 ? (stats.converted / stats.totalLeads) * 100 : 0,
      retentionRate: stats.totalLeads > 0 ? (stats.retained / stats.totalLeads) * 100 : 0,
      avgLTV: stats.totalLeads > 0 ? stats.totalLTV / stats.totalLeads : 0,
      stageEfficiency: ((stats.converted * 0.5) + (stats.retained * 0.3) + (stats.totalLeads * 0.2)) / stats.totalLeads * 100
    })).sort((a, b) => b.totalLeads - a.totalLeads);
  }, [data]);

  // Conversion Span Analytics
  const conversionSpanAnalytics = useMemo(() => {
    const spanRanges = [
      { label: '0-7 days', min: 0, max: 7 },
      { label: '8-14 days', min: 8, max: 14 },
      { label: '15-30 days', min: 15, max: 30 },
      { label: '31-60 days', min: 31, max: 60 },
      { label: '60+ days', min: 61, max: Infinity }
    ];

    return spanRanges.map(range => {
      const leadsInRange = data.filter(lead => {
        if (!lead.createdAt || !lead.convertedToCustomerAt) return false;
        const created = new Date(lead.createdAt);
        const converted = new Date(lead.convertedToCustomerAt);
        const daysDiff = Math.ceil((converted.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= range.min && daysDiff <= range.max;
      });

      const convertedInRange = leadsInRange.filter(lead => lead.conversionStatus === 'Converted');
      
      return {
        timeRange: range.label,
        totalLeads: leadsInRange.length,
        converted: convertedInRange.length,
        conversionRate: leadsInRange.length > 0 ? (convertedInRange.length / leadsInRange.length) * 100 : 0,
        avgLTV: convertedInRange.length > 0 ? convertedInRange.reduce((sum, lead) => sum + (lead.ltv || 0), 0) / convertedInRange.length : 0,
        efficiency: leadsInRange.length > 0 ? ((convertedInRange.length * 0.6) + (leadsInRange.length * 0.4)) / leadsInRange.length * 100 : 0
      };
    });
  }, [data]);

  // LTV Analytics
  const ltvAnalytics = useMemo(() => {
    const ltvRanges = [
      { label: '₹0', min: 0, max: 0 },
      { label: '₹1-5k', min: 1, max: 5000 },
      { label: '₹5k-15k', min: 5001, max: 15000 },
      { label: '₹15k-30k', min: 15001, max: 30000 },
      { label: '₹30k+', min: 30001, max: Infinity }
    ];

    return ltvRanges.map(range => {
      const leadsInRange = data.filter(lead => {
        const ltv = lead.ltv || 0;
        return ltv >= range.min && ltv <= range.max;
      });

      const convertedInRange = leadsInRange.filter(lead => lead.conversionStatus === 'Converted');
      
      return {
        ltvRange: range.label,
        totalLeads: leadsInRange.length,
        converted: convertedInRange.length,
        conversionRate: leadsInRange.length > 0 ? (convertedInRange.length / leadsInRange.length) * 100 : 0,
        avgVisits: leadsInRange.length > 0 ? leadsInRange.reduce((sum, lead) => sum + (lead.visits || 0), 0) / leadsInRange.length : 0,
        totalRevenue: leadsInRange.reduce((sum, lead) => sum + (lead.ltv || 0), 0),
        valueScore: convertedInRange.length > 0 ? (convertedInRange.reduce((sum, lead) => sum + (lead.ltv || 0), 0) / convertedInRange.length) * (convertedInRange.length / leadsInRange.length) : 0
      };
    });
  }, [data]);

  // Most Common Stage Analytics
  const mostCommonStages = useMemo(() => {
    const stageCounts = data.reduce((acc, lead) => {
      const stage = lead.stage || 'Unknown';
      if (!acc[stage]) {
        acc[stage] = { count: 0, converted: 0, avgLTV: 0, totalLTV: 0 };
      }
      acc[stage].count += 1;
      if (lead.conversionStatus === 'Converted') acc[stage].converted += 1;
      acc[stage].totalLTV += lead.ltv || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(stageCounts)
      .map(([stage, data]) => ({
        stage,
        leadCount: data.count,
        percentage: (data.count / data.length) * 100,
        converted: data.converted,
        conversionRate: data.count > 0 ? (data.converted / data.count) * 100 : 0,
        avgLTV: data.count > 0 ? data.totalLTV / data.count : 0,
        stagePopularity: (data.count / data.length) * 100
      }))
      .sort((a, b) => b.leadCount - a.leadCount)
      .slice(0, 10);
  }, [data]);

  // Proximity Issues Analytics
  const proximityIssues = useMemo(() => {
    const proximityLeads = data.filter(lead => 
      lead.stage?.includes('Proximity') || 
      lead.remarks?.toLowerCase().includes('proximity') ||
      lead.remarks?.toLowerCase().includes('location') ||
      lead.remarks?.toLowerCase().includes('distance')
    );

    const locationStats = proximityLeads.reduce((acc, lead) => {
      const center = lead.center || 'Unknown';
      if (!acc[center]) {
        acc[center] = { count: 0, totalLeads: 0 };
      }
      acc[center].count += 1;
      return acc;
    }, {} as Record<string, any>);

    // Also count total leads per location
    data.forEach(lead => {
      const center = lead.center || 'Unknown';
      if (locationStats[center]) {
        locationStats[center].totalLeads += 1;
      } else {
        locationStats[center] = { count: 0, totalLeads: 1 };
      }
    });

    return Object.entries(locationStats).map(([location, stats]) => ({
      location,
      proximityIssues: stats.count,
      totalLeads: stats.totalLeads,
      proximityRate: stats.totalLeads > 0 ? (stats.count / stats.totalLeads) * 100 : 0,
      impactScore: stats.count * (stats.count / stats.totalLeads) * 100
    })).sort((a, b) => b.proximityIssues - a.proximityIssues);
  }, [data]);

  const handleRowClick = (tableName: string, rowData: any) => {
    if (!onDrillDown) return;
    
    let filteredData: LeadsData[] = [];
    let title = '';
    
    switch (tableName) {
      case 'source':
        filteredData = data.filter(lead => lead.source === rowData.source);
        title = `Source: ${rowData.source}`;
        break;
      case 'stage':
        filteredData = data.filter(lead => lead.stage === rowData.stage);
        title = `Stage: ${rowData.stage}`;
        break;
      case 'ltv':
        // Filter based on LTV range - need to parse the range
        title = `LTV Range: ${rowData.ltvRange}`;
        filteredData = data; // Would need more complex filtering based on range
        break;
      case 'proximity':
        filteredData = data.filter(lead => lead.center === rowData.location);
        title = `Location: ${rowData.location}`;
        break;
      default:
        filteredData = data;
        title = 'Funnel Analytics';
    }
    
    onDrillDown(title, filteredData, tableName);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="source" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-red-50 to-orange-50 p-2 rounded-2xl h-auto gap-2">
          <TabsTrigger value="source" className="rounded-xl px-4 py-3 font-semibold text-sm">
            <Target className="w-4 h-4 mr-2" />
            By Source
          </TabsTrigger>
          <TabsTrigger value="stage" className="rounded-xl px-4 py-3 font-semibold text-sm">
            <Activity className="w-4 h-4 mr-2" />
            By Stage
          </TabsTrigger>
          <TabsTrigger value="span" className="rounded-xl px-4 py-3 font-semibold text-sm">
            <Clock className="w-4 h-4 mr-2" />
            Conv. Span
          </TabsTrigger>
          <TabsTrigger value="ltv" className="rounded-xl px-4 py-3 font-semibold text-sm">
            <DollarSign className="w-4 h-4 mr-2" />
            LTV Analysis
          </TabsTrigger>
          <TabsTrigger value="stages" className="rounded-xl px-4 py-3 font-semibold text-sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Top Stages
          </TabsTrigger>
          <TabsTrigger value="proximity" className="rounded-xl px-4 py-3 font-semibold text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            Proximity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="source" className="mt-6">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-600 via-red-700 to-red-800">
              <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                <Target className="w-5 h-5" />
                Conversion by Source
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ModernDataTable
                data={conversionBySource}
                showFooter={true}
                footerData={{
                  source: 'TOTALS',
                  totalLeads: conversionBySource.reduce((sum, row) => sum + row.totalLeads, 0),
                  converted: conversionBySource.reduce((sum, row) => sum + row.converted, 0),
                  conversionRate: conversionBySource.length > 0 ? 
                    (conversionBySource.reduce((sum, row) => sum + row.converted, 0) / 
                     conversionBySource.reduce((sum, row) => sum + row.totalLeads, 0)) * 100 : 0,
                  avgLTV: conversionBySource.length > 0 ? 
                    conversionBySource.reduce((sum, row) => sum + row.avgLTV * row.totalLeads, 0) / 
                    conversionBySource.reduce((sum, row) => sum + row.totalLeads, 0) : 0
                }}
                columns={[
                  {
                    key: 'source',
                    header: 'Source',
                    render: (value: string) => (
                      <div className="font-semibold text-slate-800 min-w-[120px]">
                        {value}
                      </div>
                    )
                  },
                  {
                    key: 'totalLeads',
                    header: 'Total Leads',
                    align: 'center' as const,
                    render: (value: number) => (
                      <div className="font-medium text-blue-600">
                        {formatNumber(value)}
                      </div>
                    )
                  },
                  {
                    key: 'converted',
                    header: 'Converted',
                    align: 'center' as const,
                    render: (value: number) => (
                      <div className="font-medium text-green-600">
                        {formatNumber(value)}
                      </div>
                    )
                  },
                  {
                    key: 'conversionRate',
                    header: 'Conv. Rate',
                    align: 'center' as const,
                    render: (value: number, row: any) => (
                      <div 
                        className="relative group"
                        onMouseEnter={() => setHoveredRow(`${row.source}-conv`)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <Badge 
                          variant="outline" 
                          className={`${
                            value >= 15 ? 'text-green-600 border-green-200' :
                            value >= 8 ? 'text-yellow-600 border-yellow-200' :
                            'text-red-600 border-red-200'
                          }`}
                        >
                          {value.toFixed(1)}%
                        </Badge>
                        {hoveredRow === `${row.source}-conv` && (
                          <div className="absolute z-10 -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                            {value >= 15 ? '🔥 Excellent' : value >= 8 ? '👍 Good' : '⚠️ Needs Improvement'}
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'avgLTV',
                    header: 'Avg LTV',
                    align: 'right' as const,
                    render: (value: number) => (
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(value)}
                      </span>
                    )
                  }
                ]}
                onRowClick={(row) => handleRowClick('source', row)}
                headerGradient="from-red-600 to-red-700"
                maxHeight="400px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stage" className="mt-6">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-700 via-red-800 to-orange-700">
              <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                <Activity className="w-5 h-5" />
                Conversion by Stage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ModernDataTable
                data={conversionByStage}
                showFooter={true}
                footerData={{
                  stage: 'TOTALS',
                  totalLeads: conversionByStage.reduce((sum, row) => sum + row.totalLeads, 0),
                  converted: conversionByStage.reduce((sum, row) => sum + row.converted, 0),
                  conversionRate: conversionByStage.length > 0 ? 
                    (conversionByStage.reduce((sum, row) => sum + row.converted, 0) / 
                     conversionByStage.reduce((sum, row) => sum + row.totalLeads, 0)) * 100 : 0,
                  avgLTV: conversionByStage.length > 0 ? 
                    conversionByStage.reduce((sum, row) => sum + row.avgLTV * row.totalLeads, 0) / 
                    conversionByStage.reduce((sum, row) => sum + row.totalLeads, 0) : 0
                }}
                columns={[
                  {
                    key: 'stage',
                    header: 'Stage',
                    render: (value: string) => (
                      <div className="font-semibold text-slate-800 min-w-[150px]">
                        {value}
                      </div>
                    )
                  },
                  {
                    key: 'totalLeads',
                    header: 'Total Leads',
                    align: 'center' as const,
                    render: (value: number) => formatNumber(value)
                  },
                  {
                    key: 'converted',
                    header: 'Converted',
                    align: 'center' as const,
                    render: (value: number) => (
                      <span className="font-medium text-green-600">
                        {formatNumber(value)}
                      </span>
                    )
                  },
                  {
                    key: 'conversionRate',
                    header: 'Conv. Rate',
                    align: 'center' as const,
                    render: (value: number) => (
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        {value.toFixed(1)}%
                      </Badge>
                    )
                  },
                  {
                    key: 'avgLTV',
                    header: 'Avg LTV',
                    align: 'right' as const,
                    render: (value: number) => formatCurrency(value)
                  }
                ]}
                onRowClick={(row) => handleRowClick('stage', row)}
                headerGradient="from-red-700 to-orange-700"
                maxHeight="400px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="span" className="mt-6">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600">
              <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                <Clock className="w-5 h-5" />
                Conversion Span Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ModernDataTable
                data={conversionSpanAnalytics}
                columns={[
                  {
                    key: 'timeRange',
                    header: 'Time Range',
                    render: (value: string) => (
                      <div className="font-semibold text-slate-800">
                        {value}
                      </div>
                    )
                  },
                  {
                    key: 'totalLeads',
                    header: 'Total Leads',
                    align: 'center' as const,
                    render: (value: number) => formatNumber(value)
                  },
                  {
                    key: 'converted',
                    header: 'Converted',
                    align: 'center' as const,
                    render: (value: number) => formatNumber(value)
                  },
                  {
                    key: 'conversionRate',
                    header: 'Conv. Rate',
                    align: 'center' as const,
                    render: (value: number) => `${value.toFixed(1)}%`
                  },
                  {
                    key: 'avgLTV',
                    header: 'Avg LTV',
                    align: 'right' as const,
                    render: (value: number) => formatCurrency(value)
                  }
                ]}
                headerGradient="from-orange-600 to-pink-600"
                maxHeight="400px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ltv" className="mt-6">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
              <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                <DollarSign className="w-5 h-5" />
                LTV Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ModernDataTable
                data={ltvAnalytics}
                columns={[
                  {
                    key: 'ltvRange',
                    header: 'LTV Range',
                    render: (value: string) => (
                      <div className="font-semibold text-slate-800">
                        {value}
                      </div>
                    )
                  },
                  {
                    key: 'totalLeads',
                    header: 'Total Leads',
                    align: 'center' as const,
                    render: (value: number) => formatNumber(value)
                  },
                  {
                    key: 'converted',
                    header: 'Converted',
                    align: 'center' as const,
                    render: (value: number) => formatNumber(value)
                  },
                  {
                    key: 'totalRevenue',
                    header: 'Total Revenue',
                    align: 'right' as const,
                    render: (value: number) => formatCurrency(value)
                  },
                  {
                    key: 'avgVisits',
                    header: 'Avg Visits',
                    align: 'center' as const,
                    render: (value: number) => value.toFixed(1)
                  }
                ]}
                onRowClick={(row) => handleRowClick('ltv', row)}
                headerGradient="from-green-600 to-emerald-600"
                maxHeight="400px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="mt-6">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600">
              <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                <BarChart3 className="w-5 h-5" />
                Most Common Stages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ModernDataTable
                data={mostCommonStages}
                columns={[
                  {
                    key: 'stage',
                    header: 'Stage',
                    render: (value: string) => (
                      <div className="font-semibold text-slate-800">
                        {value}
                      </div>
                    )
                  },
                  {
                    key: 'leadCount',
                    header: 'Lead Count',
                    align: 'center' as const,
                    render: (value: number) => formatNumber(value)
                  },
                  {
                    key: 'converted',
                    header: 'Converted',
                    align: 'center' as const,
                    render: (value: number) => formatNumber(value)
                  },
                  {
                    key: 'conversionRate',
                    header: 'Conv. Rate',
                    align: 'center' as const,
                    render: (value: number) => `${value.toFixed(1)}%`
                  },
                  {
                    key: 'avgLTV',
                    header: 'Avg LTV',
                    align: 'right' as const,
                    render: (value: number) => formatCurrency(value)
                  }
                ]}
                headerGradient="from-indigo-600 to-blue-600"
                maxHeight="400px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proximity" className="mt-6">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600">
              <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                <AlertTriangle className="w-5 h-5" />
                Proximity Issues Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ModernDataTable
                data={proximityIssues}
                columns={[
                  {
                    key: 'location',
                    header: 'Location',
                    render: (value: string) => (
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {value}
                      </div>
                    )
                  },
                  {
                    key: 'proximityIssues',
                    header: 'Proximity Issues',
                    align: 'center' as const,
                    render: (value: number) => (
                      <span className="font-medium text-red-600">
                        {formatNumber(value)}
                      </span>
                    )
                  },
                  {
                    key: 'totalLeads',
                    header: 'Total Leads',
                    align: 'center' as const,
                    render: (value: number) => formatNumber(value)
                  },
                  {
                    key: 'proximityRate',
                    header: 'Proximity Rate',
                    align: 'center' as const,
                    render: (value: number) => (
                      <Badge 
                        variant="outline" 
                        className={`${
                          value >= 20 ? 'text-red-600 border-red-200' :
                          value >= 10 ? 'text-yellow-600 border-yellow-200' :
                          'text-green-600 border-green-200'
                        }`}
                      >
                        {value.toFixed(1)}%
                      </Badge>
                    )
                  },
                  {
                    key: 'impactScore',
                    header: 'Impact Score',
                    align: 'right' as const,
                    render: (value: number) => (
                      <span className="font-medium text-orange-600">
                        {value.toFixed(1)}
                      </span>
                    )
                  }
                ]}
                onRowClick={(row) => handleRowClick('proximity', row)}
                headerGradient="from-red-600 to-orange-600"
                maxHeight="400px"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};