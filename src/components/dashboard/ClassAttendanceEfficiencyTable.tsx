import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Zap, Target, TrendingUp, AlertTriangle, CheckCircle, XCircle, BarChart3, Activity } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { formatNumber, formatCurrency, formatPercentage } from '@/utils/formatters';
import { DisplayedDataExportControls } from '@/components/ui/DisplayedDataExportControls';

interface ClassAttendanceEfficiencyTableProps {
  data: SessionData[];
}

export const ClassAttendanceEfficiencyTable: React.FC<ClassAttendanceEfficiencyTableProps> = ({ data }) => {
  const [selectedView, setSelectedView] = useState('overall');

  const efficiencyData = useMemo(() => {
    if (!data || data.length === 0) return { overall: [], timeEfficiency: [], performance: [] };

    // Overall efficiency analysis
    const formatStats = data.reduce((acc, session) => {
      const format = session.cleanedClass || session.classType || 'Unknown';
      if (!acc[format]) {
        acc[format] = {
          format,
          totalSessions: 0,
          totalCapacity: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          totalBooked: 0,
          totalLateCancelled: 0,
          emptySessions: 0,
          underutilizedSessions: 0, // <50% capacity
          optimizedSessions: 0, // 70-90% capacity
          oversoldSessions: 0, // >90% capacity
          revenueGeneratingSessions: 0
        };
      }
      
      acc[format].totalSessions += 1;
      acc[format].totalCapacity += session.capacity || 0;
      acc[format].totalAttendance += session.checkedInCount || 0;
      acc[format].totalRevenue += session.totalPaid || 0;
      acc[format].totalBooked += session.bookedCount || 0;
      acc[format].totalLateCancelled += session.lateCancelledCount || 0;
      
      const attendance = session.checkedInCount || 0;
      const capacity = session.capacity || 0;
      const fillRate = capacity > 0 ? (attendance / capacity) * 100 : 0;
      
      if (attendance === 0) acc[format].emptySessions += 1;
      else if (fillRate < 50) acc[format].underutilizedSessions += 1;
      else if (fillRate >= 70 && fillRate <= 90) acc[format].optimizedSessions += 1;
      else if (fillRate > 90) acc[format].oversoldSessions += 1;
      
      if ((session.totalPaid || 0) > 0) acc[format].revenueGeneratingSessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const overallData = Object.values(formatStats).map((stat: any) => ({
      ...stat,
      fillRate: stat.totalCapacity > 0 ? (stat.totalAttendance / stat.totalCapacity) * 100 : 0,
      showUpRate: stat.totalBooked > 0 ? (stat.totalAttendance / stat.totalBooked) * 100 : 0,
      utilizationRate: stat.totalSessions > 0 ? ((stat.totalSessions - stat.emptySessions) / stat.totalSessions) * 100 : 0,
      optimizationRate: stat.totalSessions > 0 ? (stat.optimizedSessions / stat.totalSessions) * 100 : 0,
      efficiencyScore: stat.totalSessions > 0 ? (
        (stat.optimizedSessions * 100 + stat.oversoldSessions * 90 + stat.underutilizedSessions * 40) / 
        (stat.totalSessions * 100)
      ) * 100 : 0,
      revenueEfficiency: stat.totalSessions > 0 ? (stat.revenueGeneratingSessions / stat.totalSessions) * 100 : 0,
      avgRevenue: stat.totalSessions > 0 ? stat.totalRevenue / stat.totalSessions : 0,
      revenuePerCapacity: stat.totalCapacity > 0 ? stat.totalRevenue / stat.totalCapacity : 0
    })).sort((a, b) => b.efficiencyScore - a.efficiencyScore);

    // Time efficiency analysis
    const timeStats = data.reduce((acc, session) => {
      const timeSlot = session.time || 'Unknown';
      if (!acc[timeSlot]) {
        acc[timeSlot] = {
          timeSlot,
          totalSessions: 0,
          totalCapacity: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          emptySessions: 0,
          optimizedSessions: 0,
          formats: new Set()
        };
      }
      
      acc[timeSlot].totalSessions += 1;
      acc[timeSlot].totalCapacity += session.capacity || 0;
      acc[timeSlot].totalAttendance += session.checkedInCount || 0;
      acc[timeSlot].totalRevenue += session.totalPaid || 0;
      acc[timeSlot].formats.add(session.cleanedClass || session.classType);
      
      const attendance = session.checkedInCount || 0;
      const capacity = session.capacity || 0;
      const fillRate = capacity > 0 ? (attendance / capacity) * 100 : 0;
      
      if (attendance === 0) acc[timeSlot].emptySessions += 1;
      else if (fillRate >= 70 && fillRate <= 90) acc[timeSlot].optimizedSessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const timeEfficiencyData = Object.values(timeStats).map((stat: any) => ({
      ...stat,
      formatCount: stat.formats.size,
      fillRate: stat.totalCapacity > 0 ? (stat.totalAttendance / stat.totalCapacity) * 100 : 0,
      utilizationRate: stat.totalSessions > 0 ? ((stat.totalSessions - stat.emptySessions) / stat.totalSessions) * 100 : 0,
      optimizationRate: stat.totalSessions > 0 ? (stat.optimizedSessions / stat.totalSessions) * 100 : 0,
      avgRevenue: stat.totalSessions > 0 ? stat.totalRevenue / stat.totalSessions : 0,
      efficiencyScore: stat.totalSessions > 0 && stat.totalCapacity > 0 ? 
        (stat.totalAttendance / stat.totalCapacity) * (stat.totalRevenue / stat.totalSessions) : 0
    })).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    // Performance categories
    const performanceData = overallData.map(item => {
      let category = 'Needs Improvement';
      let categoryColor = 'bg-red-100 text-red-800';
      let recommendations = [];

      if (item.efficiencyScore >= 80) {
        category = 'Excellent';
        categoryColor = 'bg-green-100 text-green-800';
        recommendations.push('Maintain current performance');
      } else if (item.efficiencyScore >= 60) {
        category = 'Good';
        categoryColor = 'bg-yellow-100 text-yellow-800';
        recommendations.push('Minor optimizations needed');
      } else {
        recommendations.push('Major improvements required');
      }

      if (item.fillRate < 60) recommendations.push('Increase marketing');
      if (item.emptySessions > item.totalSessions * 0.1) recommendations.push('Review scheduling');
      if (item.revenueEfficiency < 70) recommendations.push('Improve monetization');

      return {
        ...item,
        category,
        categoryColor,
        recommendations: recommendations.slice(0, 2)
      };
    });

    return {
      overall: overallData,
      timeEfficiency: timeEfficiencyData,
      performance: performanceData
    };
  }, [data]);

  const views = [
    { id: 'overall', label: 'Overall Efficiency', icon: Zap },
    { id: 'timeEfficiency', label: 'Time Slot Analysis', icon: BarChart3 },
    { id: 'performance', label: 'Performance Categories', icon: Target }
  ];

  const getEfficiencyBadge = (score: number) => {
    if (score >= 80) return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Excellent' };
    if (score >= 60) return { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Good' };
    return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Needs Work' };
  };

  const currentData = efficiencyData[selectedView as keyof typeof efficiencyData] || [];

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex justify-between items-center w-full">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-600" />
              Efficiency & Optimization Analysis
              <Badge variant="outline" className="text-yellow-600">
                {currentData.length} items
              </Badge>
            </CardTitle>
            <DisplayedDataExportControls 
              tableData={currentData.map(row => ({
                [selectedView === 'timeEfficiency' ? 'Time Slot' : 'Class Format']: selectedView === 'timeEfficiency' ? row.timeSlot : row.format,
                'Sessions': formatNumber(row.totalSessions),
                'Fill Rate': formatPercentage(row.fillRate),
                'Utilization': formatPercentage(row.utilizationRate),
                'Efficiency Score': formatPercentage(row.efficiencyScore || 0),
                'Revenue': formatCurrency(row.totalRevenue || 0),
                'Avg Revenue': formatCurrency(row.avgRevenue || 0),
                'Empty Sessions': formatNumber(row.emptySessions),
                'Optimized Sessions': formatNumber(row.optimizedSessions || 0),
                'Underutilized Sessions': formatNumber(row.underutilizedSessions || 0),
                'Oversold Sessions': formatNumber(row.oversoldSessions || 0)
              }))}
              tableHeaders={[
                selectedView === 'timeEfficiency' ? 'Time Slot' : 'Class Format',
                'Sessions', 'Fill Rate', 'Utilization', 'Efficiency Score', 'Revenue', 'Avg Revenue',
                'Empty Sessions', 'Optimized Sessions', 'Underutilized Sessions', 'Oversold Sessions'
              ]}
              tableName={`Class Attendance Efficiency - ${views.find(v => v.id === selectedView)?.label}`}
              filename={`class-attendance-efficiency-${selectedView}`}
            />
          </div>
        </div>
        
        {/* View Selector */}
        <div className="flex flex-wrap gap-2 mt-4">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <Button
                key={view.id}
                variant={selectedView === view.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView(view.id)}
                className="gap-1 text-xs"
              >
                <Icon className="w-3 h-3" />
                {view.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                  {selectedView === 'timeEfficiency' ? 'Time Slot' : 'Class Format'}
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Sessions</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Fill Rate</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Utilization</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Efficiency Score</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Session Distribution</TableHead>
                <TableHead className="text-center font-semibold text-gray-900">Revenue</TableHead>
                {selectedView === 'performance' && (
                  <TableHead className="text-center font-semibold text-gray-900">Recommendations</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row: any, index) => {
                const efficiencyBadge = getEfficiencyBadge(row.efficiencyScore || 0);
                const EfficiencyIcon = efficiencyBadge.icon;
                
                return (
                  <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium sticky left-0 bg-white z-10 border-r">
                      <div className="flex flex-col">
                        <span className="text-gray-900">
                          {selectedView === 'timeEfficiency' ? row.timeSlot : row.format}
                        </span>
                        <span className="text-xs text-gray-500">
                          {selectedView === 'timeEfficiency' 
                            ? `${row.formatCount} formats` 
                            : `${formatNumber(row.totalCapacity)} capacity`
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatNumber(row.totalSessions)}</span>
                        <span className="text-xs text-gray-500">
                          {row.emptySessions} empty
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={
                          row.fillRate >= 80 ? 'bg-green-100 text-green-800' :
                          row.fillRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {formatPercentage(row.fillRate)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={
                          row.utilizationRate >= 90 ? 'bg-green-100 text-green-800' :
                          row.utilizationRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {formatPercentage(row.utilizationRate)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <EfficiencyIcon className="w-4 h-4" />
                        <Badge className={efficiencyBadge.color}>
                          {formatPercentage(row.efficiencyScore || 0)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1">
                        {row.optimizedSessions > 0 && (
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs">{row.optimizedSessions} optimal</span>
                          </div>
                        )}
                        {row.underutilizedSessions > 0 && (
                          <div className="flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-yellow-600" />
                            <span className="text-xs">{row.underutilizedSessions} underused</span>
                          </div>
                        )}
                        {row.oversoldSessions > 0 && (
                          <div className="flex items-center justify-center gap-1">
                            <Activity className="w-3 h-3 text-blue-600" />
                            <span className="text-xs">{row.oversoldSessions} oversold</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatCurrency(row.totalRevenue || 0)}</span>
                        <span className="text-xs text-gray-500">
                          {formatCurrency(row.avgRevenue || 0)} avg
                        </span>
                      </div>
                    </TableCell>
                    {selectedView === 'performance' && (
                      <TableCell className="text-center">
                        <div className="flex flex-col gap-1">
                          <Badge className={row.categoryColor}>
                            {row.category}
                          </Badge>
                          {row.recommendations.map((rec: string, idx: number) => (
                            <span key={idx} className="text-xs text-gray-600">
                              {rec}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};