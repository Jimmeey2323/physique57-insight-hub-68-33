import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, Search, Calendar, Users, DollarSign, Filter, ArrowUpDown, 
  TrendingUp, BarChart3, MapPin, Clock, Target, Award
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface EnhancedHostedClassesTableProps {
  data: SessionData[];
}

export const EnhancedHostedClassesTable: React.FC<EnhancedHostedClassesTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'attendance' | 'revenue' | 'trainer' | 'fillRate'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [activeTab, setActiveTab] = useState('table');

  const { filteredData, monthlyData, summaryStats, locations, months } = useMemo(() => {
    if (!data) return { filteredData: [], monthlyData: [], summaryStats: null, locations: [], months: [] };

    const locations = [...new Set(data.map(session => session.location).filter(Boolean))];
    const months = [...new Set(data.map(session => {
      const date = new Date(session.date || '');
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().reverse();

    const filtered = data.filter(session => {
      // Search filter
      const matchesSearch = !searchTerm || 
        session.sessionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.cleanedClass?.toLowerCase().includes(searchTerm.toLowerCase());

      // Location filter
      const matchesLocation = filterLocation === 'all' || session.location === filterLocation;

      // Month filter
      const sessionMonth = `${new Date(session.date || '').getFullYear()}-${String(new Date(session.date || '').getMonth() + 1).padStart(2, '0')}`;
      const matchesMonth = filterMonth === 'all' || sessionMonth === filterMonth;

      return matchesSearch && matchesLocation && matchesMonth;
    }).sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date || '');
          bValue = new Date(b.date || '');
          break;
        case 'attendance':
          aValue = a.checkedInCount || 0;
          bValue = b.checkedInCount || 0;
          break;
        case 'revenue':
          aValue = a.totalPaid || 0;
          bValue = b.totalPaid || 0;
          break;
        case 'trainer':
          aValue = a.trainerName || '';
          bValue = b.trainerName || '';
          break;
        case 'fillRate':
          aValue = (a.checkedInCount || 0) / (a.capacity || 1);
          bValue = (b.checkedInCount || 0) / (b.capacity || 1);
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Group by month for analytics
    const monthlyData = months.map(month => {
      const monthSessions = filtered.filter(session => {
        const sessionMonth = `${new Date(session.date || '').getFullYear()}-${String(new Date(session.date || '').getMonth() + 1).padStart(2, '0')}`;
        return sessionMonth === month;
      });

      const totalSessions = monthSessions.length;
      const totalAttendance = monthSessions.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
      const totalRevenue = monthSessions.reduce((sum, session) => sum + (session.totalPaid || 0), 0);
      const totalCapacity = monthSessions.reduce((sum, session) => sum + (session.capacity || 0), 0);
      const avgAttendance = totalSessions > 0 ? Math.round(totalAttendance / totalSessions) : 0;
      const fillRate = totalCapacity > 0 ? Math.round((totalAttendance / totalCapacity) * 100) : 0;

      const [year, monthNum] = month.split('-');
      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      return {
        month: monthName,
        totalSessions,
        totalAttendance,
        totalRevenue,
        avgAttendance,
        fillRate,
        avgRevenue: totalSessions > 0 ? Math.round(totalRevenue / totalSessions) : 0
      };
    });

    // Summary statistics
    const totalSessions = filtered.length;
    const totalAttendance = filtered.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const totalRevenue = filtered.reduce((sum, session) => sum + (session.totalPaid || 0), 0);
    const totalCapacity = filtered.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const avgAttendance = totalSessions > 0 ? Math.round(totalAttendance / totalSessions) : 0;
    const avgFillRate = totalCapacity > 0 ? Math.round((totalAttendance / totalCapacity) * 100) : 0;

    // Top performers
    const trainerPerformance = filtered.reduce((acc, session) => {
      const trainer = session.trainerName || 'Unknown';
      if (!acc[trainer]) {
        acc[trainer] = { sessions: 0, attendance: 0, revenue: 0 };
      }
      acc[trainer].sessions += 1;
      acc[trainer].attendance += session.checkedInCount || 0;
      acc[trainer].revenue += session.totalPaid || 0;
      return acc;
    }, {} as Record<string, any>);

    const topTrainer = Object.entries(trainerPerformance)
      .map(([name, stats]) => ({ name, ...stats, avgAttendance: Math.round(stats.attendance / stats.sessions) }))
      .sort((a, b) => b.avgAttendance - a.avgAttendance)[0];

    const summaryStats = {
      totalSessions,
      totalAttendance,
      totalRevenue,
      avgAttendance,
      avgFillRate,
      topTrainer,
      uniqueTrainers: [...new Set(filtered.map(s => s.trainerName).filter(Boolean))].length,
      uniqueFormats: [...new Set(filtered.map(s => s.cleanedClass || s.classType).filter(Boolean))].length
    };

    return { filteredData: filtered, monthlyData, summaryStats, locations, months };
  }, [data, searchTerm, sortBy, sortOrder, filterLocation, filterMonth]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (!summaryStats) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hosted classes found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            Hosted Classes Analytics
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {summaryStats.totalSessions} sessions
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {summaryStats.totalAttendance} attendees
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="table">Detailed Table</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Total Sessions</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{summaryStats.totalSessions}</div>
                  <div className="text-xs text-purple-700">{summaryStats.uniqueFormats} unique formats</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Total Attendance</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{summaryStats.totalAttendance.toLocaleString()}</div>
                  <div className="text-xs text-blue-700">Avg: {summaryStats.avgAttendance} per session</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Total Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">₹{summaryStats.totalRevenue.toLocaleString()}</div>
                  <div className="text-xs text-green-700">Avg: ₹{Math.round(summaryStats.totalRevenue / summaryStats.totalSessions).toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Fill Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">{summaryStats.avgFillRate}%</div>
                  <div className="text-xs text-orange-700">{summaryStats.uniqueTrainers} trainers</div>
                </CardContent>
              </Card>
            </div>

            {summaryStats.topTrainer && (
              <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">Top Performing Trainer</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-yellow-900">{summaryStats.topTrainer.name}</div>
                      <div className="text-sm text-yellow-700">
                        {summaryStats.topTrainer.sessions} sessions • Avg {summaryStats.topTrainer.avgAttendance} attendees
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-yellow-900">
                        ₹{summaryStats.topTrainer.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-yellow-700">Total revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Monthly View Tab */}
          <TabsContent value="monthly" className="space-y-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalSessions" name="Sessions" fill="#8884d8" />
                  <Bar dataKey="totalAttendance" name="Attendance" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 font-medium text-slate-700">Month</th>
                    <th className="text-center py-3 font-medium text-slate-700">Sessions</th>
                    <th className="text-center py-3 font-medium text-slate-700">Total Attendance</th>
                    <th className="text-center py-3 font-medium text-slate-700">Avg Attendance</th>
                    <th className="text-center py-3 font-medium text-slate-700">Fill Rate</th>
                    <th className="text-right py-3 font-medium text-slate-700">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 font-medium text-slate-800">{month.month}</td>
                      <td className="text-center py-3 text-slate-700">{month.totalSessions}</td>
                      <td className="text-center py-3 text-slate-700">{month.totalAttendance.toLocaleString()}</td>
                      <td className="text-center py-3 text-slate-700">{month.avgAttendance}</td>
                      <td className="text-center py-3">
                        <Badge variant={month.fillRate >= 75 ? 'default' : month.fillRate >= 50 ? 'secondary' : 'outline'}>
                          {month.fillRate}%
                        </Badge>
                      </td>
                      <td className="text-right py-3 font-semibold text-green-600">
                        ₹{month.totalRevenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgAttendance" name="Avg Attendance" stroke="#8884d8" strokeWidth={3} />
                  <Line type="monotone" dataKey="fillRate" name="Fill Rate %" stroke="#82ca9d" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Detailed Table Tab */}
          <TabsContent value="table" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by session, trainer, or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map(month => {
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    return (
                      <SelectItem key={month} value={month}>{monthName}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 font-medium text-slate-700">Session Details</th>
                    <th className="text-left py-3 font-medium text-slate-700 cursor-pointer" onClick={() => handleSort('trainer')}>
                      <div className="flex items-center gap-1">
                        Trainer
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="text-center py-3 font-medium text-slate-700 cursor-pointer" onClick={() => handleSort('date')}>
                      <div className="flex items-center justify-center gap-1">
                        Date
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="text-center py-3 font-medium text-slate-700 cursor-pointer" onClick={() => handleSort('attendance')}>
                      <div className="flex items-center justify-center gap-1">
                        Attendance
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="text-center py-3 font-medium text-slate-700 cursor-pointer" onClick={() => handleSort('fillRate')}>
                      <div className="flex items-center justify-center gap-1">
                        Fill Rate
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="text-right py-3 font-medium text-slate-700 cursor-pointer" onClick={() => handleSort('revenue')}>
                      <div className="flex items-center justify-end gap-1">
                        Revenue
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((session, index) => {
                    const fillRate = Math.round(((session.checkedInCount || 0) / (session.capacity || 1)) * 100);
                    return (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4">
                          <div>
                            <div className="font-medium text-slate-800">{session.sessionName}</div>
                            <div className="text-sm text-slate-600">{session.cleanedClass || session.classType}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.location}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium text-slate-700">{session.trainerName}</div>
                        </td>
                        <td className="py-4 text-center">
                          <div className="text-slate-700">{new Date(session.date || '').toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.time}
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <div className="font-medium text-slate-700">
                            {session.checkedInCount || 0} / {session.capacity || 0}
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <Badge variant={
                            fillRate > 80 ? 'default' :
                            fillRate > 60 ? 'secondary' : 'outline'
                          }>
                            {fillRate}%
                          </Badge>
                        </td>
                        <td className="py-4 text-right">
                          <div className="font-medium text-slate-700">
                            ₹{(session.totalPaid || 0).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hosted classes match your filters</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};