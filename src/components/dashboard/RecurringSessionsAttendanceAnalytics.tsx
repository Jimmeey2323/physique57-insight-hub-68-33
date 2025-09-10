import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, Users, Activity } from 'lucide-react';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import { RecurringSessionData } from '@/hooks/useRecurringSessionsData';

interface RecurringSessionsAttendanceAnalyticsProps {
  data: RecurringSessionData[];
}

export const RecurringSessionsAttendanceAnalytics: React.FC<RecurringSessionsAttendanceAnalyticsProps> = ({ data }) => {
  const attendanceAnalytics = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const dailyStats: Record<string, {
      date: string;
      totalSessions: number;
      totalAttendance: number;
      avgFillRate: number;
      capacity: number;
    }> = {};

    data.forEach(session => {
      const date = session.date || 'Unknown';
      
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          totalSessions: 0,
          totalAttendance: 0,
          avgFillRate: 0,
          capacity: 0
        };
      }

      dailyStats[date].totalSessions += 1;
      dailyStats[date].totalAttendance += session.checkedIn;
      dailyStats[date].capacity += session.capacity;
    });

    return Object.values(dailyStats)
      .map(stat => ({
        ...stat,
        avgFillRate: stat.capacity > 0 ? (stat.totalAttendance / stat.capacity) * 100 : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  }, [data]);

  const totalAttendance = data.reduce((sum, session) => sum + session.checkedIn, 0);
  const totalCapacity = data.reduce((sum, session) => sum + session.capacity, 0);
  const overallFillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <Activity className="w-6 h-6" />
          Attendance Analytics
          <Badge className="bg-white/20 text-white border-white/30">
            {attendanceAnalytics.length} days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">{formatNumber(totalAttendance)}</div>
              <div className="text-sm text-blue-600">Total Attendance</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">{formatNumber(totalCapacity)}</div>
              <div className="text-sm text-green-600">Total Capacity</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">{formatPercentage(overallFillRate)}</div>
              <div className="text-sm text-purple-600">Overall Fill Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Trend */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Daily Attendance Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any, name: string) => [
                    formatNumber(value),
                    name === 'totalAttendance' ? 'Attendance' : 'Sessions'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalAttendance" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Fill Rate Trend */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Fill Rate Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={attendanceAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any) => [formatPercentage(value), 'Fill Rate']}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgFillRate" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};