
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Users, Target } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';

interface SessionsAttendanceAnalyticsProps {
  data: SessionData[];
}

export const SessionsAttendanceAnalytics: React.FC<SessionsAttendanceAnalyticsProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by date and calculate daily metrics
    const dailyStats = data.reduce((acc, session) => {
      const sessionDate = new Date(session.date);
      if (isNaN(sessionDate.getTime())) return acc; // Skip invalid dates
      
      const date = sessionDate.toLocaleDateString();
      
      if (!acc[date]) {
        acc[date] = {
          date,
          totalSessions: 0,
          totalBooked: 0,
          totalCheckedIn: 0,
          totalCapacity: 0,
          avgFillRate: 0
        };
      }

      acc[date].totalSessions += 1;
      acc[date].totalBooked += session.bookedCount || 0;
      acc[date].totalCheckedIn += session.checkedInCount || 0;
      acc[date].totalCapacity += session.capacity || 0;

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate averages
    return Object.values(dailyStats).map((day: any) => ({
      ...day,
      avgFillRate: day.totalCapacity > 0 ? ((day.totalBooked / day.totalCapacity) * 100).toFixed(1) : 0,
      attendanceRate: day.totalBooked > 0 ? ((day.totalCheckedIn / day.totalBooked) * 100).toFixed(1) : 0
    })).slice(-30); // Last 30 days
  }, [data]);

  const weeklyTrends = useMemo(() => {
    if (!data || data.length === 0) return [];

    const weeklyStats = data.reduce((acc, session) => {
      const sessionDate = new Date(session.date);
      if (isNaN(sessionDate.getTime())) return acc; // Skip invalid dates
      
      const weekStart = new Date(sessionDate);
      weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: weekKey,
          sessions: 0,
          totalAttendance: 0,
          avgFillRate: 0,
          totalCapacity: 0
        };
      }

      acc[weekKey].sessions += 1;
      acc[weekKey].totalAttendance += session.checkedInCount || 0;
      acc[weekKey].totalCapacity += session.capacity || 0;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(weeklyStats).map((week: any) => ({
      ...week,
      avgFillRate: week.totalCapacity > 0 ? ((week.totalAttendance / week.totalCapacity) * 100).toFixed(1) : 0
    })).slice(-12); // Last 12 weeks
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {entry.value}
              {entry.dataKey.includes('Rate') || entry.dataKey.includes('Fill') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Daily Attendance Trends */}
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-white border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Daily Attendance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalCheckedIn" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Daily Check-ins"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgFillRate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Fill Rate %"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attendanceRate" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  name="Attendance Rate %"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance Trends */}
      <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Weekly Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="week" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="sessions" 
                  fill="#8b5cf6" 
                  name="Total Sessions"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="totalAttendance" 
                  fill="#06b6d4" 
                  name="Total Attendance"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
