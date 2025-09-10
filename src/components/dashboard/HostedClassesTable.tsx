import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Search, Calendar, Users, DollarSign, Filter, ArrowUpDown } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';

interface HostedClassesTableProps {
  data: SessionData[];
}

export const HostedClassesTable: React.FC<HostedClassesTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'attendance' | 'revenue' | 'trainer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterLocation, setFilterLocation] = useState('all');

  const locations = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(session => session.location).filter(Boolean))];
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data
      .filter(session => {
        // Search filter
        const matchesSearch = !searchTerm || 
          session.sessionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.cleanedClass?.toLowerCase().includes(searchTerm.toLowerCase());

        // Location filter
        const matchesLocation = filterLocation === 'all' || session.location === filterLocation;

        return matchesSearch && matchesLocation;
      })
      .sort((a, b) => {
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
          default:
            return 0;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [data, searchTerm, sortBy, sortOrder, filterLocation]);

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalSessions = data.length;
    const totalAttendance = data.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const totalRevenue = data.reduce((sum, session) => sum + (session.totalPaid || 0), 0);
    const avgAttendance = totalSessions > 0 ? Math.round(totalAttendance / totalSessions) : 0;

    return {
      totalSessions,
      totalAttendance,
      totalRevenue,
      avgAttendance
    };
  }, [data]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (!stats) {
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
            Hosted Classes Analysis
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {stats.totalSessions} sessions
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {stats.totalAttendance} attendees
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.totalSessions}</div>
            <div className="text-sm text-purple-700">Total Sessions</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAttendance.toLocaleString()}</div>
            <div className="text-sm text-blue-700">Total Attendance</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-green-700">Total Revenue</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.avgAttendance}</div>
            <div className="text-sm text-orange-700">Avg Attendance</div>
          </div>
        </div>

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
                <th className="text-right py-3 font-medium text-slate-700 cursor-pointer" onClick={() => handleSort('revenue')}>
                  <div className="flex items-center justify-end gap-1">
                    Revenue
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-center py-3 font-medium text-slate-700">Fill Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((session, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4">
                    <div>
                      <div className="font-medium text-slate-800">{session.sessionName}</div>
                      <div className="text-sm text-slate-600">{session.cleanedClass || session.classType}</div>
                      <div className="text-xs text-slate-500">{session.location}</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium text-slate-700">{session.trainerName}</div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="text-slate-700">{new Date(session.date || '').toLocaleDateString()}</div>
                    <div className="text-xs text-slate-500">{session.time}</div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="font-medium text-slate-700">
                      {session.checkedInCount || 0} / {session.capacity || 0}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="font-medium text-slate-700">
                      ₹{(session.totalPaid || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <Badge variant={
                      ((session.checkedInCount || 0) / (session.capacity || 1)) > 0.8 ? 'default' :
                      ((session.checkedInCount || 0) / (session.capacity || 1)) > 0.6 ? 'secondary' : 'outline'
                    }>
                      {Math.round(((session.checkedInCount || 0) / (session.capacity || 1)) * 100)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hosted classes match your filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};