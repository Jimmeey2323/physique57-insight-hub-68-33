import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { ExpirationData } from '@/types/dashboard';
import { formatNumber, formatPercentage } from '@/utils/formatters';
import { format, parseISO } from 'date-fns';

interface ExpirationAdditionalAnalyticsProps {
  data: ExpirationData[];
}

export const ExpirationAdditionalAnalytics: React.FC<ExpirationAdditionalAnalyticsProps> = ({ data }) => {
  // Location Performance Analysis
  const locationAnalysis = data.reduce((acc, item) => {
    const location = item.homeLocation || 'Unknown';
    if (!acc[location]) {
      acc[location] = { name: location, total: 0, active: 0, churned: 0, frozen: 0, churnRate: 0 };
    }
    acc[location].total++;
    if (item.status === 'Active') acc[location].active++;
    if (item.status === 'Churned') acc[location].churned++;
    if (item.status === 'Frozen') acc[location].frozen++;
    return acc;
  }, {} as Record<string, { name: string; total: number; active: number; churned: number; frozen: number; churnRate: number }>);

  // Calculate churn rates
  Object.values(locationAnalysis).forEach(location => {
    location.churnRate = location.total > 0 ? (location.churned / location.total) * 100 : 0;
  });

  const locationData = Object.values(locationAnalysis).sort((a, b) => b.total - a.total);

  // Sales Rep Performance
  const salesRepAnalysis = data.reduce((acc, item) => {
    const rep = item.soldBy || 'Unknown';
    if (!acc[rep]) {
      acc[rep] = { name: rep, total: 0, active: 0, churned: 0, frozen: 0, churnRate: 0 };
    }
    acc[rep].total++;
    if (item.status === 'Active') acc[rep].active++;
    if (item.status === 'Churned') acc[rep].churned++;
    if (item.status === 'Frozen') acc[rep].frozen++;
    return acc;
  }, {} as Record<string, { name: string; total: number; active: number; churned: number; frozen: number; churnRate: number }>);

  // Calculate churn rates for sales reps
  Object.values(salesRepAnalysis).forEach(rep => {
    rep.churnRate = rep.total > 0 ? (rep.churned / rep.total) * 100 : 0;
  });

  const topSalesReps = Object.values(salesRepAnalysis)
    .filter(rep => rep.name !== 'Unknown' && rep.name !== '-')
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Monthly Trend Analysis (based on end dates)
  const monthlyTrend = data.reduce((acc, item) => {
    if (item.endDate) {
      try {
        const date = new Date(item.endDate);
        const monthYear = format(date, 'MMM yyyy');
        if (!acc[monthYear]) {
          acc[monthYear] = { month: monthYear, active: 0, churned: 0, frozen: 0, total: 0 };
        }
        acc[monthYear].total++;
        if (item.status === 'Active') acc[monthYear].active++;
        if (item.status === 'Churned') acc[monthYear].churned++;
        if (item.status === 'Frozen') acc[monthYear].frozen++;
      } catch (error) {
        // Skip invalid dates
      }
    }
    return acc;
  }, {} as Record<string, { month: string; active: number; churned: number; frozen: number; total: number }>);

  const trendData = Object.values(monthlyTrend)
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-12); // Last 12 months

  // High Value vs Low Value Analysis (based on paid amount)
  const valueAnalysis = data.reduce((acc, item) => {
    const paidAmount = parseFloat(item.paid) || 0;
    const category = paidAmount >= 10000 ? 'High Value (₹10K+)' : paidAmount >= 5000 ? 'Medium Value (₹5K-10K)' : 'Low Value (<₹5K)';
    
    if (!acc[category]) {
      acc[category] = { category, total: 0, active: 0, churned: 0, frozen: 0, churnRate: 0 };
    }
    acc[category].total++;
    if (item.status === 'Active') acc[category].active++;
    if (item.status === 'Churned') acc[category].churned++;
    if (item.status === 'Frozen') acc[category].frozen++;
    return acc;
  }, {} as Record<string, { category: string; total: number; active: number; churned: number; frozen: number; churnRate: number }>);

  Object.values(valueAnalysis).forEach(segment => {
    segment.churnRate = segment.total > 0 ? (segment.churned / segment.total) * 100 : 0;
  });

  const valueSegments = Object.values(valueAnalysis);

  const getChurnRateColor = (rate: number) => {
    if (rate >= 50) return 'text-red-600';
    if (rate >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Location Performance */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
            Location Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" stackId="a" fill="#10b981" name="Active" />
                  <Bar dataKey="frozen" stackId="a" fill="#f59e0b" name="Frozen" />
                  <Bar dataKey="churned" stackId="a" fill="#ef4444" name="Churned" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Location Stats Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-700">Location</th>
                    <th className="text-center py-2 px-3 font-medium text-slate-700">Total</th>
                    <th className="text-center py-2 px-3 font-medium text-slate-700">Churn Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {locationData.map((location, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-xs">{location.name}</td>
                      <td className="py-2 px-3 text-center">{formatNumber(location.total)}</td>
                      <td className={`py-2 px-3 text-center font-medium ${getChurnRateColor(location.churnRate)}`}>
                        {formatPercentage(location.churnRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Rep Performance */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
            Top Sales Representatives by Membership Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-medium text-slate-700">Sales Rep</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-700">Total Sold</th>
                  <th className="text-center py-2 px-3 font-medium text-green-600">Active</th>
                  <th className="text-center py-2 px-3 font-medium text-yellow-600">Frozen</th>
                  <th className="text-center py-2 px-3 font-medium text-red-600">Churned</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-700">Churn Rate</th>
                </tr>
              </thead>
              <tbody>
                {topSalesReps.map((rep, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-xs">{rep.name}</td>
                    <td className="py-2 px-3 text-center font-medium">{formatNumber(rep.total)}</td>
                    <td className="py-2 px-3 text-center text-green-600">{formatNumber(rep.active)}</td>
                    <td className="py-2 px-3 text-center text-yellow-600">{formatNumber(rep.frozen)}</td>
                    <td className="py-2 px-3 text-center text-red-600">{formatNumber(rep.churned)}</td>
                    <td className={`py-2 px-3 text-center font-medium ${getChurnRateColor(rep.churnRate)}`}>
                      {formatPercentage(rep.churnRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend & Value Segment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
              Monthly Status Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="churned" stackId="1" stroke="#ef4444" fill="#ef4444" />
                <Area type="monotone" dataKey="frozen" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                <Area type="monotone" dataKey="active" stackId="1" stroke="#10b981" fill="#10b981" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Value Segment Analysis */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
              Value Segment Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {valueSegments.map((segment, index) => (
                <div key={index} className="p-4 bg-slate-50/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-slate-700">{segment.category}</h4>
                    <Badge variant="outline" className={`${getChurnRateColor(segment.churnRate)} border-current`}>
                      {formatPercentage(segment.churnRate)} Churn
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-slate-500">Total</div>
                      <div className="font-medium">{formatNumber(segment.total)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-green-600">Active</div>
                      <div className="font-medium text-green-600">{formatNumber(segment.active)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-yellow-600">Frozen</div>
                      <div className="font-medium text-yellow-600">{formatNumber(segment.frozen)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-red-600">Churned</div>
                      <div className="font-medium text-red-600">{formatNumber(segment.churned)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};