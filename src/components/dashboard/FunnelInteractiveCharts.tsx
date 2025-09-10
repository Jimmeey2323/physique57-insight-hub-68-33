
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Users, Target, Calendar } from 'lucide-react';
import { LeadsData } from '@/types/leads';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface FunnelInteractiveChartsProps {
  data: LeadsData[];
}

export const FunnelInteractiveCharts: React.FC<FunnelInteractiveChartsProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'source' | 'stage' | 'timeline'>('source');
  const [metricType, setMetricType] = useState<'volume' | 'conversion' | 'ltv'>('volume');

  const chartData = useMemo(() => {
    if (!data || !data.length) return [];

    switch (chartType) {
      case 'source': {
        const sourceStats = data.reduce((acc, lead) => {
          const source = lead.source || 'Unknown';
          if (!acc[source]) {
            acc[source] = { name: source, leads: 0, converted: 0, totalLTV: 0 };
          }
          acc[source].leads += 1;
          if (lead.conversionStatus === 'Converted') acc[source].converted += 1;
          acc[source].totalLTV += lead.ltv || 0;
          return acc;
        }, {} as Record<string, any>);

        return Object.values(sourceStats)
          .map((source: any) => ({
            name: source.name,
            volume: source.leads,
            conversion: source.leads > 0 ? (source.converted / source.leads) * 100 : 0,
            ltv: source.leads > 0 ? source.totalLTV / source.leads : 0
          }))
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 10);
      }

      case 'stage': {
        const stageStats = data.reduce((acc, lead) => {
          const stage = lead.stage || 'Unknown';
          if (!acc[stage]) {
            acc[stage] = { name: stage, leads: 0, converted: 0, totalLTV: 0 };
          }
          acc[stage].leads += 1;
          if (lead.conversionStatus === 'Converted') acc[stage].converted += 1;
          acc[stage].totalLTV += lead.ltv || 0;
          return acc;
        }, {} as Record<string, any>);

        return Object.values(stageStats)
          .map((stage: any) => ({
            name: stage.name,
            volume: stage.leads,
            conversion: stage.leads > 0 ? (stage.converted / stage.leads) * 100 : 0,
            ltv: stage.leads > 0 ? stage.totalLTV / stage.leads : 0
          }))
          .sort((a, b) => b.volume - a.volume);
      }

      case 'timeline': {
        const monthlyStats = data.reduce((acc, lead) => {
          if (!lead.createdAt) return acc;
          
          const date = new Date(lead.createdAt);
          if (isNaN(date.getTime())) return acc;
          
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!acc[monthKey]) {
            acc[monthKey] = { name: monthKey, leads: 0, converted: 0, totalLTV: 0 };
          }
          acc[monthKey].leads += 1;
          if (lead.conversionStatus === 'Converted') acc[monthKey].converted += 1;
          acc[monthKey].totalLTV += lead.ltv || 0;
          return acc;
        }, {} as Record<string, any>);

        return Object.values(monthlyStats)
          .map((month: any) => ({
            name: month.name,
            volume: month.leads,
            conversion: month.leads > 0 ? (month.converted / month.leads) * 100 : 0,
            ltv: month.leads > 0 ? month.totalLTV / month.leads : 0
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(-12);
      }

      default:
        return [];
    }
  }, [data, chartType]);

  const pieData = useMemo(() => {
    if (!data || !data.length) return [];

    const conversionStats = data.reduce((acc, lead) => {
      const status = lead.conversionStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    return Object.entries(conversionStats)
      .map(([status, count], index) => ({
        name: status,
        value: count,
        percentage: ((count / data.length) * 100).toFixed(1),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const getMetricValue = (item: any) => {
    switch (metricType) {
      case 'volume': return item.volume;
      case 'conversion': return item.conversion;
      case 'ltv': return item.ltv;
      default: return item.volume;
    }
  };

  const getMetricLabel = () => {
    switch (metricType) {
      case 'volume': return 'Lead Volume';
      case 'conversion': return 'Conversion Rate (%)';
      case 'ltv': return 'Average LTV (₹)';
      default: return 'Lead Volume';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          <p className="text-sm text-slate-600">
            {getMetricLabel()}: {
              metricType === 'ltv' 
                ? formatCurrency(payload[0].value)
                : metricType === 'conversion'
                ? `${payload[0].value.toFixed(1)}%`
                : payload[0].value.toLocaleString('en-IN')
            }
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="font-semibold text-slate-800 mb-2">{data.name}</p>
          <p className="text-sm text-slate-600">
            Count: {data.value.toLocaleString('en-IN')} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || !data.length) {
    return (
      <Card className="w-full bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-12">
          <div className="text-center py-8 text-slate-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No data available for charts</p>
            <p className="text-sm">Adjust your filters to see analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Chart - Full Width */}
      <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white border-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center gap-3 text-white text-xl font-bold">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              {chartType === 'source' ? 'Lead Source Analytics' : chartType === 'stage' ? 'Funnel Stage Analytics' : 'Timeline Trend Analysis'}
            </CardTitle>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={chartType === 'source' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setChartType('source')}
                className={cn(
                  "text-xs font-semibold transition-all duration-200",
                  chartType === 'source' 
                    ? "bg-white/30 text-white border-white/40 hover:bg-white/40" 
                    : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                )}
              >
                <Users className="w-3 h-3 mr-1" />
                Sources
              </Button>
              <Button
                variant={chartType === 'stage' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setChartType('stage')}
                className={cn(
                  "text-xs font-semibold transition-all duration-200",
                  chartType === 'stage' 
                    ? "bg-white/30 text-white border-white/40 hover:bg-white/40" 
                    : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                )}
              >
                <Target className="w-3 h-3 mr-1" />
                Stages
              </Button>
              <Button
                variant={chartType === 'timeline' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setChartType('timeline')}
                className={cn(
                  "text-xs font-semibold transition-all duration-200",
                  chartType === 'timeline' 
                    ? "bg-white/30 text-white border-white/40 hover:bg-white/40" 
                    : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                )}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Timeline
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge 
              variant={metricType === 'volume' ? 'secondary' : 'outline'}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:scale-105",
                metricType === 'volume' 
                  ? "bg-white/30 text-white border-white/40" 
                  : "bg-white/10 text-white/70 border-white/30 hover:bg-white/20"
              )}
              onClick={() => setMetricType('volume')}
            >
              Volume
            </Badge>
            <Badge 
              variant={metricType === 'conversion' ? 'secondary' : 'outline'}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:scale-105",
                metricType === 'conversion' 
                  ? "bg-white/30 text-white border-white/40" 
                  : "bg-white/10 text-white/70 border-white/30 hover:bg-white/20"
              )}
              onClick={() => setMetricType('conversion')}
            >
              Conversion
            </Badge>
            <Badge 
              variant={metricType === 'ltv' ? 'secondary' : 'outline'}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:scale-105",
                metricType === 'ltv' 
                  ? "bg-white/30 text-white border-white/40" 
                  : "bg-white/10 text-white/70 border-white/30 hover:bg-white/20"
              )}
              onClick={() => setMetricType('ltv')}
            >
              LTV
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 bg-gradient-to-br from-slate-50 to-white">
          <div className="h-96 relative">
            <div className="absolute top-0 right-0 text-xs text-slate-500 font-medium">
              {getMetricLabel()}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'timeline' ? (
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                      <stop offset="50%" stopColor="#ea580c" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569"
                    fontSize={11}
                    fontWeight={500}
                    tickFormatter={(value) => String(value).slice(-5)}
                  />
                  <YAxis stroke="#475569" fontSize={11} fontWeight={500} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey={metricType} 
                    stroke="#dc2626" 
                    strokeWidth={4}
                    dot={{ fill: '#dc2626', strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 10, fill: '#b91c1c', stroke: '#ffffff', strokeWidth: 3 }}
                    fill="url(#lineGradient)"
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.9}/>
                      <stop offset="50%" stopColor="#ea580c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569"
                    fontSize={11}
                    fontWeight={500}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#475569" fontSize={11} fontWeight={500} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey={metricType} 
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Pie Chart */}
      <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-800 via-red-800 to-red-900 text-white border-0">
          <CardTitle className="flex items-center gap-3 text-white text-xl font-bold">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <PieChartIcon className="w-6 h-6 text-white" />
            </div>
            Conversion Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-gradient-to-br from-slate-50 to-white">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={150}
                  paddingAngle={4}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={70}
                  wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color, fontWeight: 700 }}>
                      {value} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
