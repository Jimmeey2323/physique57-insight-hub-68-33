import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Target, TrendingUp, BarChart3, LineChart as LineChartIcon, X } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';

interface ClassFormatComparisonProps {
  data: SessionData[];
  selectedFormats: string[];
  onFormatsChange: (formats: string[]) => void;
  compareWithTrainer: boolean;
  onCompareWithTrainerChange: (value: boolean) => void;
}

export const ClassFormatComparison: React.FC<ClassFormatComparisonProps> = ({
  data,
  selectedFormats,
  onFormatsChange,
  compareWithTrainer,
  onCompareWithTrainerChange
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [metric, setMetric] = useState<'attendance' | 'revenue' | 'fillRate'>('attendance');

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
          const key = `${format} - ${trainer}`;

          if (!acc[key]) {
            acc[key] = {
              name: key,
              format,
              trainer,
              totalSessions: 0,
              totalAttendance: 0,
              totalCapacity: 0,
              totalRevenue: 0
            };
          }

          acc[key].totalSessions += 1;
          acc[key].totalAttendance += session.checkedInCount || 0;
          acc[key].totalCapacity += session.capacity || 0;
          acc[key].totalRevenue += session.totalPaid || 0;

          return acc;
        }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => ({
        name: item.name,
        format: item.format,
        trainer: item.trainer,
        attendance: Math.round(item.totalAttendance / item.totalSessions),
        revenue: Math.round(item.totalRevenue / item.totalSessions),
        fillRate: Math.round((item.totalAttendance / item.totalCapacity) * 100),
        sessions: item.totalSessions
      }));
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
              totalRevenue: 0
            };
          }

          acc[format].totalSessions += 1;
          acc[format].totalAttendance += session.checkedInCount || 0;
          acc[format].totalCapacity += session.capacity || 0;
          acc[format].totalRevenue += session.totalPaid || 0;

          return acc;
        }, {} as Record<string, any>);

      return Object.values(grouped).map((item: any) => ({
        name: item.name,
        attendance: Math.round(item.totalAttendance / item.totalSessions),
        revenue: Math.round(item.totalRevenue / item.totalSessions),
        fillRate: Math.round((item.totalAttendance / item.totalCapacity) * 100),
        sessions: item.totalSessions
      }));
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
      default:
        return dataKey === 'value' ? 'attendance' : 'Avg Attendance';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Class Format Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Select Formats to Compare</h3>
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

        {/* Options */}
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
              <SelectTrigger className="w-40">
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
              <p>Select at least one format to compare</p>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedFormats.length > 0 && comparisonData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-medium text-slate-700">Name</th>
                  <th className="text-right py-2 font-medium text-slate-700">Sessions</th>
                  <th className="text-right py-2 font-medium text-slate-700">Avg Attendance</th>
                  <th className="text-right py-2 font-medium text-slate-700">Avg Revenue</th>
                  <th className="text-right py-2 font-medium text-slate-700">Fill Rate</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 font-medium text-slate-800">{item.name}</td>
                    <td className="text-right py-2 text-slate-600">{item.sessions}</td>
                    <td className="text-right py-2 text-slate-600">{item.attendance}</td>
                    <td className="text-right py-2 text-slate-600">₹{item.revenue.toLocaleString()}</td>
                    <td className="text-right py-2 text-slate-600">{item.fillRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};