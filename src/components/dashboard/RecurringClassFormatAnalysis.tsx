import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Users, Target } from 'lucide-react';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import { RecurringSessionData } from '@/hooks/useRecurringSessionsData';

interface RecurringClassFormatAnalysisProps {
  data: RecurringSessionData[];
}

export const RecurringClassFormatAnalysis: React.FC<RecurringClassFormatAnalysisProps> = ({ data }) => {
  const classAnalysis = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const classStats: Record<string, {
      name: string;
      totalSessions: number;
      totalAttendance: number;
      avgFillRate: number;
      revenue: number;
    }> = {};

    data.forEach(session => {
      const className = session.class || 'Unknown';
      
      if (!classStats[className]) {
        classStats[className] = {
          name: className,
          totalSessions: 0,
          totalAttendance: 0,
          avgFillRate: 0,
          revenue: 0
        };
      }

      classStats[className].totalSessions += 1;
      classStats[className].totalAttendance += session.checkedIn;
      classStats[className].revenue += session.revenue;
    });

    return Object.values(classStats)
      .map(stat => ({
        ...stat,
        avgFillRate: stat.totalSessions > 0 ? (stat.totalAttendance / stat.totalSessions) : 0
      }))
      .sort((a, b) => b.totalSessions - a.totalSessions)
      .slice(0, 10);
  }, [data]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <Activity className="w-6 h-6" />
          Class Format Analysis
          <Badge className="bg-white/20 text-white border-white/30">
            {classAnalysis.length} classes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Sessions by Class Type
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'totalSessions' ? formatNumber(value) : formatPercentage(value),
                    name === 'totalSessions' ? 'Sessions' : 'Fill Rate'
                  ]}
                />
                <Bar dataKey="totalSessions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Class Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classAnalysis.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalSessions"
                >
                  {classAnalysis.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatNumber(value), 'Sessions']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {classAnalysis.slice(0, 4).map((classType, index) => (
            <Card key={classType.name} className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold`} 
                       style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{classType.name}</h4>
                    <div className="text-sm text-gray-600">
                      {formatNumber(classType.totalSessions)} sessions
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatNumber(classType.totalAttendance)} attendees
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};