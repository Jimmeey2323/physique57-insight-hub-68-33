import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SessionData } from '@/hooks/useSessionsData';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  BarChart3, 
  DollarSign, 
  Activity, 
  Target,
  Clock,
  Star,
  Zap,
  X,
  ChevronRight
} from 'lucide-react';

interface ClassAttendanceDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  classFormat: string;
  sessionsData: SessionData[];
  overallStats: {
    totalSessions: number;
    totalCapacity: number;
    totalCheckedIn: number;
    totalRevenue: number;
    fillRate: number;
    showUpRate: number;
    avgRevenue: number;
    emptySessions: number;
  };
}

export const ClassAttendanceDrillDownModal: React.FC<ClassAttendanceDrillDownModalProps> = ({
  isOpen,
  onClose,
  classFormat,
  sessionsData,
  overallStats
}) => {
  // Filter sessions for this specific class format
  const filteredSessions = useMemo(() => {
    return sessionsData.filter(session => 
      (session.cleanedClass || session.classType) === classFormat
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessionsData, classFormat]);

  // Calculate location breakdown
  const locationStats = useMemo(() => {
    const stats = filteredSessions.reduce((acc, session) => {
      const location = session.location || 'Unknown';
      if (!acc[location]) {
        acc[location] = {
          location,
          sessions: 0,
          totalCapacity: 0,
          totalCheckedIn: 0,
          totalRevenue: 0,
          avgFillRate: 0
        };
      }
      acc[location].sessions += 1;
      acc[location].totalCapacity += session.capacity || 0;
      acc[location].totalCheckedIn += session.checkedInCount || 0;
      acc[location].totalRevenue += session.totalPaid || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(stats).map((stat: any) => ({
      ...stat,
      avgFillRate: stat.totalCapacity > 0 ? (stat.totalCheckedIn / stat.totalCapacity) * 100 : 0
    }));
  }, [filteredSessions]);

  // Calculate trainer breakdown
  const trainerStats = useMemo(() => {
    const stats = filteredSessions.reduce((acc, session) => {
      const trainer = session.trainerName || 'Unknown';
      if (!acc[trainer]) {
        acc[trainer] = {
          trainer,
          sessions: 0,
          totalCapacity: 0,
          totalCheckedIn: 0,
          totalRevenue: 0,
          avgFillRate: 0
        };
      }
      acc[trainer].sessions += 1;
      acc[trainer].totalCapacity += session.capacity || 0;
      acc[trainer].totalCheckedIn += session.checkedInCount || 0;
      acc[trainer].totalRevenue += session.totalPaid || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(stats).map((stat: any) => ({
      ...stat,
      avgFillRate: stat.totalCapacity > 0 ? (stat.totalCheckedIn / stat.totalCapacity) * 100 : 0
    })).sort((a, b) => b.sessions - a.sessions);
  }, [filteredSessions]);

  // Calculate time slot breakdown
  const timeSlotStats = useMemo(() => {
    const stats = filteredSessions.reduce((acc, session) => {
      const timeSlot = session.time || 'Unknown';
      if (!acc[timeSlot]) {
        acc[timeSlot] = {
          timeSlot,
          sessions: 0,
          totalCapacity: 0,
          totalCheckedIn: 0,
          totalRevenue: 0,
          avgFillRate: 0
        };
      }
      acc[timeSlot].sessions += 1;
      acc[timeSlot].totalCapacity += session.capacity || 0;
      acc[timeSlot].totalCheckedIn += session.checkedInCount || 0;
      acc[timeSlot].totalRevenue += session.totalPaid || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(stats).map((stat: any) => ({
      ...stat,
      avgFillRate: stat.totalCapacity > 0 ? (stat.totalCheckedIn / stat.totalCapacity) * 100 : 0
    })).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [filteredSessions]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-white to-slate-50/50">
        <DialogHeader className="border-b border-slate-200/60 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  {classFormat} - Deep Dive Analysis
                </DialogTitle>
                <p className="text-slate-600 mt-1">
                  Detailed performance insights and session breakdown
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full p-2 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Key Metrics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Total Sessions</p>
                      <p className="text-2xl font-bold text-blue-900">{formatNumber(overallStats.totalSessions)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Attendance</p>
                      <p className="text-2xl font-bold text-green-900">{formatNumber(overallStats.totalCheckedIn)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Fill Rate</p>
                      <p className="text-2xl font-bold text-purple-900">{formatPercentage(overallStats.fillRate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600 rounded-lg">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-700 font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-orange-900">{formatCurrency(overallStats.totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics Tabs */}
            <Tabs defaultValue="sessions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm border border-slate-200/60">
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="locations" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Locations
                </TabsTrigger>
                <TabsTrigger value="trainers" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Trainers
                </TabsTrigger>
                <TabsTrigger value="timeslots" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Slots
                </TabsTrigger>
              </TabsList>

              {/* Sessions Tab */}
              <TabsContent value="sessions" className="space-y-4">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Individual Session Details
                      <Badge variant="outline" className="text-blue-600">
                        {filteredSessions.length} sessions
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-slate-50 z-10">
                          <TableRow>
                            <TableHead className="font-semibold text-slate-700">Date</TableHead>
                            <TableHead className="font-semibold text-slate-700">Time</TableHead>
                            <TableHead className="font-semibold text-slate-700">Trainer</TableHead>
                            <TableHead className="font-semibold text-slate-700">Location</TableHead>
                            <TableHead className="text-center font-semibold text-slate-700">Capacity</TableHead>
                            <TableHead className="text-center font-semibold text-slate-700">Checked In</TableHead>
                            <TableHead className="text-center font-semibold text-slate-700">Fill Rate</TableHead>
                            <TableHead className="text-center font-semibold text-slate-700">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSessions.slice(0, 50).map((session, index) => (
                            <TableRow key={index} className="hover:bg-slate-50/80 transition-colors">
                              <TableCell className="font-medium">
                                <div>
                                  <div className="text-slate-900">{session.date}</div>
                                  <div className="text-xs text-slate-500">{session.dayOfWeek}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-slate-700">
                                  {session.time}
                                </Badge>
                              </TableCell>
                              <TableCell>{session.trainerName}</TableCell>
                              <TableCell className="text-sm text-slate-600">{session.location}</TableCell>
                              <TableCell className="text-center font-medium">{session.capacity}</TableCell>
                              <TableCell className="text-center font-medium">{session.checkedInCount}</TableCell>
                              <TableCell className="text-center">
                                <Badge className={
                                  (session.fillPercentage || 0) >= 80 ? 'bg-green-100 text-green-800' :
                                  (session.fillPercentage || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {formatPercentage(session.fillPercentage || 0)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-medium text-green-700">
                                {formatCurrency(session.totalPaid || 0)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {filteredSessions.length > 50 && (
                        <div className="p-4 text-center text-slate-500 border-t">
                          Showing first 50 sessions of {filteredSessions.length} total
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Locations Tab */}
              <TabsContent value="locations" className="space-y-4">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <MapPin className="w-5 h-5 text-green-600" />
                      Performance by Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      {locationStats.map((location, index) => (
                        <Card key={index} className="bg-gradient-to-r from-white to-green-50/30 border border-green-100">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <MapPin className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800">{location.location}</h3>
                                  <p className="text-sm text-slate-600">{location.sessions} sessions</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="text-center">
                                  <p className="font-medium text-slate-700">{formatNumber(location.totalCheckedIn)}</p>
                                  <p className="text-xs text-slate-500">Attendance</p>
                                </div>
                                <div className="text-center">
                                  <Badge className={
                                    location.avgFillRate >= 80 ? 'bg-green-100 text-green-800' :
                                    location.avgFillRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {formatPercentage(location.avgFillRate)}
                                  </Badge>
                                  <p className="text-xs text-slate-500 mt-1">Fill Rate</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-green-600">{formatCurrency(location.totalRevenue)}</p>
                                  <p className="text-xs text-slate-500">Revenue</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trainers Tab */}
              <TabsContent value="trainers" className="space-y-4">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Users className="w-5 h-5 text-purple-600" />
                      Performance by Trainer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      {trainerStats.map((trainer, index) => (
                        <Card key={index} className="bg-gradient-to-r from-white to-purple-50/30 border border-purple-100">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                  <Users className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800">{trainer.trainer}</h3>
                                  <p className="text-sm text-slate-600">{trainer.sessions} sessions</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="text-center">
                                  <p className="font-medium text-slate-700">{formatNumber(trainer.totalCheckedIn)}</p>
                                  <p className="text-xs text-slate-500">Attendance</p>
                                </div>
                                <div className="text-center">
                                  <Badge className={
                                    trainer.avgFillRate >= 80 ? 'bg-green-100 text-green-800' :
                                    trainer.avgFillRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {formatPercentage(trainer.avgFillRate)}
                                  </Badge>
                                  <p className="text-xs text-slate-500 mt-1">Fill Rate</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-purple-600">{formatCurrency(trainer.totalRevenue)}</p>
                                  <p className="text-xs text-slate-500">Revenue</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Time Slots Tab */}
              <TabsContent value="timeslots" className="space-y-4">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Performance by Time Slot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      {timeSlotStats.map((timeSlot, index) => (
                        <Card key={index} className="bg-gradient-to-r from-white to-orange-50/30 border border-orange-100">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                  <Clock className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800">{timeSlot.timeSlot}</h3>
                                  <p className="text-sm text-slate-600">{timeSlot.sessions} sessions</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="text-center">
                                  <p className="font-medium text-slate-700">{formatNumber(timeSlot.totalCheckedIn)}</p>
                                  <p className="text-xs text-slate-500">Attendance</p>
                                </div>
                                <div className="text-center">
                                  <Badge className={
                                    timeSlot.avgFillRate >= 80 ? 'bg-green-100 text-green-800' :
                                    timeSlot.avgFillRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {formatPercentage(timeSlot.avgFillRate)}
                                  </Badge>
                                  <p className="text-xs text-slate-500 mt-1">Fill Rate</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-orange-600">{formatCurrency(timeSlot.totalRevenue)}</p>
                                  <p className="text-xs text-slate-500">Revenue</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};