import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { ExpirationData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';

interface ExpirationChartsGridProps {
  data: ExpirationData[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];

export const ExpirationChartsGrid: React.FC<ExpirationChartsGridProps> = ({ data }) => {
  // Chart 1: Status Distribution
  const statusData = data.reduce((acc, item) => {
    const status = item.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  // Chart 2: Membership Types Distribution
  const membershipData = data.reduce((acc, item) => {
    const type = item.membershipName || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const membershipChartData = Object.entries(membershipData)
    .map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Chart 3: Monthly Expiration Trend (simulated data based on end dates)
  const monthlyData = data.reduce((acc, item) => {
    if (item.endDate) {
      const month = new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const trendData = Object.entries(monthlyData)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(0, 12);

  // Chart 4: Location vs Status Analysis
  const locationStatusData = data.reduce((acc, item) => {
    const location = item.homeLocation || 'Unknown';
    const status = item.status || 'Unknown';
    
    if (!acc[location]) acc[location] = {};
    acc[location][status] = (acc[location][status] || 0) + 1;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const locationChartData = Object.entries(locationStatusData).map(([location, statuses]) => ({
    location: location.length > 15 ? location.substring(0, 15) + '...' : location,
    ...statuses
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Status Distribution */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
            Membership Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatNumber(value as number), 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Top Membership Types */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
            Top Membership Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={membershipChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [formatNumber(value as number), 'Members']} />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 3: Monthly Expiration Trend */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
            Monthly Expiration Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatNumber(value as number), 'Expirations']} />
              <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 4: Location vs Status */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
            Status by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Active" stackId="a" fill="#10b981" />
              <Bar dataKey="Churned" stackId="a" fill="#ef4444" />
              <Bar dataKey="Frozen" stackId="a" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};