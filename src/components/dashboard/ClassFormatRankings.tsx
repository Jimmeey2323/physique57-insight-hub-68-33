import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Users, Star, ArrowUp, ArrowDown, Medal } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';

interface ClassFormatRankingsProps {
  data: SessionData[];
}

export const ClassFormatRankings: React.FC<ClassFormatRankingsProps> = ({ data }) => {
  const [sortBy, setSortBy] = useState<'attendance' | 'revenue' | 'fillRate'>('attendance');

  const rankings = useMemo(() => {
    if (!data || data.length === 0) return [];

    const classStats = data.reduce((acc, session) => {
      const className = session.cleanedClass || session.classType || 'Unknown';
      
      if (!acc[className]) {
        acc[className] = {
          name: className,
          totalSessions: 0,
          totalAttendance: 0,
          totalCapacity: 0,
          totalRevenue: 0,
          trainers: new Set(),
          locations: new Set()
        };
      }

      acc[className].totalSessions += 1;
      acc[className].totalAttendance += session.checkedInCount || 0;
      acc[className].totalCapacity += session.capacity || 0;
      acc[className].totalRevenue += session.totalPaid || 0;
      if (session.trainerName) acc[className].trainers.add(session.trainerName);
      if (session.location) acc[className].locations.add(session.location);

      return acc;
    }, {} as Record<string, {
      name: string;
      totalSessions: number;
      totalAttendance: number;
      totalCapacity: number;
      totalRevenue: number;
      trainers: Set<string>;
      locations: Set<string>;
    }>);

    return Object.values(classStats).map(stats => ({
      ...stats,
      avgAttendance: Math.round(stats.totalAttendance / stats.totalSessions),
      fillRate: Math.round((stats.totalAttendance / stats.totalCapacity) * 100),
      avgRevenue: Math.round(stats.totalRevenue / stats.totalSessions),
      trainerCount: stats.trainers.size,
      locationCount: stats.locations.size
    })).sort((a, b) => {
      switch (sortBy) {
        case 'attendance':
          return b.avgAttendance - a.avgAttendance;
        case 'revenue':
          return b.avgRevenue - a.avgRevenue;
        case 'fillRate':
          return b.fillRate - a.fillRate;
        default:
          return b.avgAttendance - a.avgAttendance;
      }
    });
  }, [data, sortBy]);

  const getRankingIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-600">#{index + 1}</span>;
  };

  const getRankingBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">🏆 Champion</Badge>;
    if (index === 1) return <Badge className="bg-gray-100 text-gray-800 border-gray-200">🥈 Runner-up</Badge>;
    if (index === 2) return <Badge className="bg-orange-100 text-orange-800 border-orange-200">🥉 Third Place</Badge>;
    if (index < 5) return <Badge variant="secondary">Top 5</Badge>;
    return null;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Class Format Rankings
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'attendance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('attendance')}
            >
              <Users className="w-4 h-4 mr-1" />
              Attendance
            </Button>
            <Button
              variant={sortBy === 'revenue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('revenue')}
            >
              💰 Revenue
            </Button>
            <Button
              variant={sortBy === 'fillRate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('fillRate')}
            >
              <Star className="w-4 h-4 mr-1" />
              Fill Rate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rankings.slice(0, 10).map((classFormat, index) => (
            <div
              key={classFormat.name}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                index === 0
                  ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50'
                  : index === 1
                  ? 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50'
                  : index === 2
                  ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-red-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getRankingIcon(index)}
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">{classFormat.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-slate-600">
                        {classFormat.totalSessions} sessions
                      </span>
                      <span className="text-sm text-slate-600">
                        {classFormat.trainerCount} trainers
                      </span>
                      <span className="text-sm text-slate-600">
                        {classFormat.locationCount} locations
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">
                      {sortBy === 'attendance' && `${classFormat.avgAttendance}`}
                      {sortBy === 'revenue' && `₹${classFormat.avgRevenue.toLocaleString()}`}
                      {sortBy === 'fillRate' && `${classFormat.fillRate}%`}
                    </div>
                    <div className="text-xs text-slate-500">
                      {sortBy === 'attendance' && 'Avg Attendance'}
                      {sortBy === 'revenue' && 'Avg Revenue'}
                      {sortBy === 'fillRate' && 'Fill Rate'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getRankingBadge(index)}
                    <div className="flex gap-1 text-xs text-slate-500">
                      <span>{classFormat.totalAttendance.toLocaleString()} total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rankings.length > 10 && (
          <div className="mt-6 text-center">
            <Badge variant="outline" className="text-slate-600">
              Showing top 10 of {rankings.length} class formats
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};