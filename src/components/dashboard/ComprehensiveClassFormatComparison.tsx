import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  Users, Target, TrendingUp, BarChart3, LineChart as LineChartIcon, X, 
  ChevronDown, Award, Calendar, MapPin, Clock
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { ModernDrillDownModal } from './ModernDrillDownModal';

interface ComprehensiveClassFormatComparisonProps {
  data: SessionData[];
  selectedFormats: string[];
  onFormatsChange: (formats: string[]) => void;
  compareWithTrainer: boolean;
  onCompareWithTrainerChange: (value: boolean) => void;
}

export const ComprehensiveClassFormatComparison: React.FC<ComprehensiveClassFormatComparisonProps> = ({
  data,
  selectedFormats,
  onFormatsChange,
  compareWithTrainer,
  onCompareWithTrainerChange
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [metric, setMetric] = useState<'attendance' | 'revenue' | 'fillRate' | 'conversion' | 'retention'>('attendance');
  const [activeTab, setActiveTab] = useState<'charts' | 'table' | 'comparison'>('charts');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDrillDown, setShowDrillDown] = useState(false);

  const availableFormats = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(session => session.cleanedClass || session.classType).filter(Boolean))];
  }, [data]);

  const comparisonData = useMemo(() => {
    if (!data || selectedFormats.length === 0) return [];

    if (compareWithTrainer) {
      // Group by format and trainer
      const grouped = data
        .filter(session => selectedFormats.includes(session.cleanedClass || session.classType || ''))
        .reduce((acc, session) => {
          const format = session.cleanedClass || session.classType || 'Unknown';
          const trainer = session.trainerName || 'Unknown';
          const key = `${format} • ${trainer}`;

          if (!acc[key]) {
            acc[key] = {
              name: key,
              format,
              trainer,
              totalSessions: 0,
              totalAttendance: 0,
              totalCapacity: 0,
              totalRevenue: 0,
              totalNew: 0,
              totalBooked: 0,
              totalCancelled: 0,
              sessions: []
            };
          }

          acc[key].totalSessions += 1;
          acc[key].totalAttendance += session.checkedInCount || 0;
          acc[key].totalCapacity += session.capacity || 0;
          acc[key].totalRevenue += session.totalPaid || 0;
          acc[key].totalNew += (session as any).newClientCount || 0;
          acc[key].totalBooked += session.bookedCount || 0;
          acc[key].totalCancelled += session.lateCancelledCount || 0;
          acc[key].sessions.push(session);

          return acc;
        }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => {
        const avgAttendance = Math.round(item.totalAttendance / item.totalSessions);
        const avgRevenue = Math.round(item.totalRevenue / item.totalSessions);
        const fillRate = Math.round((item.totalAttendance / item.totalCapacity) * 100);
        const conversionRate = item.totalAttendance > 0 ? Math.round((item.totalNew / item.totalAttendance) * 100) : 0;
        const retentionRate = item.totalAttendance > 0 ? Math.round(((item.totalAttendance - item.totalNew) / item.totalAttendance) * 100) : 0;
        const cancellationRate = item.totalBooked > 0 ? Math.round((item.totalCancelled / item.totalBooked) * 100) : 0;
        const score = Math.round((fillRate * 0.3 + (100 - cancellationRate) * 0.25 + retentionRate * 0.25 + conversionRate * 0.2));

        return {
          name: item.name,
          format: item.format,
          trainer: item.trainer,
          sessions: item.totalSessions,
          attendance: avgAttendance,
          totalAttendance: item.totalAttendance,
          revenue: avgRevenue,
          totalRevenue: item.totalRevenue,
          fillRate,
          conversion: conversionRate,
          retention: retentionRate,
          cancellation: cancellationRate,
          score,
          rawSessions: item.sessions
        };
      });
    } else {
      // Group by format only
      const grouped = data
        .filter(session => selectedFormats.includes(session.cleanedClass || session.classType || ''))
        .reduce((acc, session) => {
          const format = session.cleanedClass || session.classType || 'Unknown';

          if (!acc[format]) {
            acc[format] = {
              name: format,
              totalSessions: 0,
              totalAttendance: 0,
              totalCapacity: 0,
              totalRevenue: 0,
              totalNew: 0,
              totalBooked: 0,
              totalCancelled: 0,
              sessions: []
            };
          }

          acc[format].totalSessions += 1;
          acc[format].totalAttendance += session.checkedInCount || 0;
          acc[format].totalCapacity += session.capacity || 0;
          acc[format].totalRevenue += session.totalPaid || 0;
          acc[format].totalNew += (session as any).newClientCount || 0;
          acc[format].totalBooked += session.bookedCount || 0;
          acc[format].totalCancelled += session.lateCancelledCount || 0;
          acc[format].sessions.push(session);

          return acc;
        }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => {
        const avgAttendance = Math.round(item.totalAttendance / item.totalSessions);
        const avgRevenue = Math.round(item.totalRevenue / item.totalSessions);
        const fillRate = Math.round((item.totalAttendance / item.totalCapacity) * 100);
        const conversionRate = item.totalAttendance > 0 ? Math.round((item.totalNew / item.totalAttendance) * 100) : 0;
        const retentionRate = item.totalAttendance > 0 ? Math.round(((item.totalAttendance - item.totalNew) / item.totalAttendance) * 100) : 0;
        const cancellationRate = item.totalBooked > 0 ? Math.round((item.totalCancelled / item.totalBooked) * 100) : 0;
        const score = Math.round((fillRate * 0.3 + (100 - cancellationRate) * 0.25 + retentionRate * 0.25 + conversionRate * 0.2));

        return {
          name: item.name,
          sessions: item.totalSessions,
          attendance: avgAttendance,
          totalAttendance: item.totalAttendance,
          revenue: avgRevenue,
          totalRevenue: item.totalRevenue,
          fillRate,
          conversion: conversionRate,
          retention: retentionRate,
          cancellation: cancellationRate,
          score,
          rawSessions: item.sessions
        };
      });
    }
  }, [data, selectedFormats, compareWithTrainer]);

  const handleFormatToggle = (format: string) => {
    if (selectedFormats.includes(format)) {
      onFormatsChange(selectedFormats.filter(f => f !== format));
    } else {
      onFormatsChange([...selectedFormats, format]);
    }
  };

  const removeFormat = (format: string) => {
    onFormatsChange(selectedFormats.filter(f => f !== format));
  };

  const getMetricValue = (dataKey: string) => {
    switch (metric) {
      case 'attendance':
        return dataKey === 'value' ? 'attendance' : 'Avg Attendance';
      case 'revenue':
        return dataKey === 'value' ? 'revenue' : 'Avg Revenue (₹)';
      case 'fillRate':
        return dataKey === 'value' ? 'fillRate' : 'Fill Rate (%)';
      case 'conversion':
        return dataKey === 'value' ? 'conversion' : 'Conversion Rate (%)';
      case 'retention':
        return dataKey === 'value' ? 'retention' : 'Retention Rate (%)';
      default:
        return dataKey === 'value' ? 'attendance' : 'Avg Attendance';
    }
  };

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setShowDrillDown(true);
  };

  const tableColumns = [
    {
      key: 'name' as const,
      header: compareWithTrainer ? 'Format • Trainer' : 'Format',
      render: (value: string, item: any) => (
        <div className="font-medium text-slate-800">
          <div>{compareWithTrainer ? item.format : value}</div>
          {compareWithTrainer && (
            <div className="text-xs text-slate-500">{item.trainer}</div>
          )}
        </div>
      ),
      className: 'min-w-[160px]'
    },
    {
      key: 'sessions' as const,
      header: 'Sessions',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant="secondary">{value}</Badge>
      )
    },
    {
      key: 'attendance' as const,
      header: 'Avg Attendance',
      align: 'center' as const,
      render: (value: number) => (
        <div className="font-semibold text-blue-600">{value}</div>
      )
    },
    {
      key: 'revenue' as const,
      header: 'Avg Revenue',
      align: 'right' as const,
      render: (value: number) => (
        <div className="font-semibold text-green-600">₹{value.toLocaleString()}</div>
      )
    },
    {
      key: 'fillRate' as const,
      header: 'Fill Rate',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value >= 80 ? 'default' : value >= 60 ? 'secondary' : 'outline'}>
          {value}%
        </Badge>
      )
    },
    {
      key: 'conversion' as const,
      header: 'Conversion',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value >= 25 ? 'default' : value >= 15 ? 'secondary' : 'outline'}>
          {value}%
        </Badge>
      )
    },
    {
      key: 'retention' as const,
      header: 'Retention',
      align: 'center' as const,
      render: (value: number) => (
        <Badge variant={value >= 70 ? 'default' : value >= 50 ? 'secondary' : 'outline'}>
          {value}%
        </Badge>
      )
    },
    {
      key: 'score' as const,
      header: 'Score',
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          <Award className={`w-4 h-4 ${value >= 80 ? 'text-yellow-500' : value >= 60 ? 'text-blue-500' : 'text-slate-400'}`} />
          <span className={`font-bold ${value >= 80 ? 'text-yellow-600' : value >= 60 ? 'text-blue-600' : 'text-slate-500'}`}>
            {value}
          </span>
        </div>
      )
    }
  ];

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Comprehensive Class Format Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Select Formats to Analyze</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {availableFormats.map(format => (
                <Button
                  key={format}
                  variant={selectedFormats.includes(format) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFormatToggle(format)}
                >
                  {format}
                  {selectedFormats.includes(format) && (
                    <X className="w-3 h-3 ml-2" onClick={(e) => { e.stopPropagation(); removeFormat(format); }} />
                  )}
                </Button>
              ))}
            </div>
            
            {/* Selected formats display */}
            {selectedFormats.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-medium text-slate-600">Selected:</span>
                {selectedFormats.map(format => (
                  <Badge key={format} variant="secondary" className="flex items-center gap-1">
                    {format}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeFormat(format)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="table">Detailed Table</TabsTrigger>
              <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="space-y-6">
              {/* Chart Options */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trainer-comparison"
                    checked={compareWithTrainer}
                    onCheckedChange={onCompareWithTrainerChange}
                  />
                  <label htmlFor="trainer-comparison" className="text-sm font-medium text-slate-700">
                    Include trainer breakdown
                  </label>
                </div>

                <div className="flex gap-2">
                  <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance">
                        <Users className="w-4 h-4 mr-2 inline" />
                        Attendance
                      </SelectItem>
                      <SelectItem value="revenue">💰 Revenue</SelectItem>
                      <SelectItem value="fillRate">
                        <Target className="w-4 h-4 mr-2 inline" />
                        Fill Rate
                      </SelectItem>
                      <SelectItem value="conversion">
                        <TrendingUp className="w-4 h-4 mr-2 inline" />
                        Conversion
                      </SelectItem>
                      <SelectItem value="retention">
                        <Award className="w-4 h-4 mr-2 inline" />
                        Retention
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-1">
                    <Button
                      variant={chartType === 'bar' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('bar')}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={chartType === 'line' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('line')}
                    >
                      <LineChartIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chart */}
              {selectedFormats.length > 0 && comparisonData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          interval={0}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey={getMetricValue('value')} 
                          name={getMetricValue('label')} 
                          fill="#3B82F6" 
                        />
                      </BarChart>
                    ) : (
                      <LineChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          interval={0}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey={getMetricValue('value')} 
                          name={getMetricValue('label')} 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ r: 6 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                  <div className="text-center text-slate-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select at least one format to analyze</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="table" className="space-y-6">
              {selectedFormats.length > 0 && comparisonData.length > 0 ? (
                <OptimizedTable
                  data={comparisonData}
                  columns={tableColumns}
                  maxHeight="600px"
                  stickyHeader={true}
                  onRowClick={handleRowClick}
                />
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select formats to view detailed comparison table</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              {selectedFormats.length > 1 && comparisonData.length > 1 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {comparisonData.slice(0, 4).map((item, index) => (
                    <Card key={index} className="border-2 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => handleRowClick(item)}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-blue-${(index + 1) * 200}`}></div>
                          {item.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{item.attendance}</div>
                            <div className="text-xs text-slate-500">Avg Attendance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">₹{item.revenue.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Avg Revenue</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant={item.fillRate >= 80 ? 'default' : 'secondary'}>
                            {item.fillRate}% Fill Rate
                          </Badge>
                          <Badge variant={item.score >= 80 ? 'default' : 'secondary'} className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {item.score}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 text-center">
                          {item.sessions} sessions • Click for details
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select at least 2 formats for side-by-side comparison</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Drill Down Modal */}
      {showDrillDown && selectedItem && (
        <ModernDrillDownModal
          data={selectedItem.rawSessions || []}
          isOpen={showDrillDown}
          onClose={() => {
            setShowDrillDown(false);
            setSelectedItem(null);
          }}
          type="class"
        />
      )}
    </>
  );
};