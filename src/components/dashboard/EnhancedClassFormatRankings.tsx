import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, TrendingUp, Users, Star, ArrowUp, ArrowDown, Medal, Crown, 
  Award, Target, Filter, Settings, BarChart3 
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';

interface EnhancedClassFormatRankingsProps {
  data: SessionData[];
}

export const EnhancedClassFormatRankings: React.FC<EnhancedClassFormatRankingsProps> = ({ data }) => {
  const [sortBy, setSortBy] = useState<'attendance' | 'revenue' | 'fillRate' | 'consistency'>('attendance');
  const [minSessions, setMinSessions] = useState(5);
  const [excludeHosted, setExcludeHosted] = useState(true);
  const [showCount, setShowCount] = useState(10);

  const rankings = useMemo(() => {
    if (!data || data.length === 0) return { top: [], bottom: [] };

    // Filter data based on settings
    let filteredData = data;
    
    if (excludeHosted) {
      filteredData = data.filter(session => 
        !session.sessionName?.toLowerCase().includes('hosted') &&
        !session.sessionName?.toLowerCase().includes('myriad')
      );
    }

    const classStats = filteredData.reduce((acc, session) => {
      const className = session.cleanedClass || session.classType || 'Unknown';
      
      if (!acc[className]) {
        acc[className] = {
          name: className,
          totalSessions: 0,
          totalAttendance: 0,
          totalCapacity: 0,
          totalRevenue: 0,
          attendanceArray: [],
          trainers: new Set<string>(),
          locations: new Set<string>(),
          days: new Set<string>(),
          times: new Set<string>()
        };
      }

      acc[className].totalSessions += 1;
      acc[className].totalAttendance += session.checkedInCount || 0;
      acc[className].totalCapacity += session.capacity || 0;
      acc[className].totalRevenue += session.totalPaid || 0;
      acc[className].attendanceArray.push(session.checkedInCount || 0);
      
      if (session.trainerName) acc[className].trainers.add(session.trainerName);
      if (session.location) acc[className].locations.add(session.location);
      if (session.dayOfWeek) acc[className].days.add(session.dayOfWeek);
      if (session.time) acc[className].times.add(session.time);

      return acc;
    }, {} as Record<string, any>);

    const processedStats = Object.values(classStats)
      .filter((stats: any) => stats.totalSessions >= minSessions)
      .map((stats: any) => {
        const avgAttendance = Math.round(stats.totalAttendance / stats.totalSessions);
        const fillRate = Math.round((stats.totalAttendance / stats.totalCapacity) * 100);
        const avgRevenue = Math.round(stats.totalRevenue / stats.totalSessions);
        
        // Calculate consistency (lower standard deviation = higher consistency)
        const mean = stats.totalAttendance / stats.totalSessions;
        const variance = stats.attendanceArray.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / stats.totalSessions;
        const stdDev = Math.sqrt(variance);
        const consistency = Math.max(0, 100 - (stdDev / mean * 100)); // Convert to consistency score

        return {
          ...stats,
          avgAttendance,
          fillRate,
          avgRevenue,
          consistency: Math.round(consistency),
          stdDev: Math.round(stdDev),
          trainerCount: stats.trainers.size,
          locationCount: stats.locations.size,
          dayCount: stats.days.size,
          timeCount: stats.times.size,
          revenuePerAttendee: stats.totalAttendance > 0 ? Math.round(stats.totalRevenue / stats.totalAttendance) : 0
        };
      });

    const sortedStats = [...processedStats].sort((a, b) => {
      switch (sortBy) {
        case 'attendance':
          return b.avgAttendance - a.avgAttendance;
        case 'revenue':
          return b.avgRevenue - a.avgRevenue;
        case 'fillRate':
          return b.fillRate - a.fillRate;
        case 'consistency':
          return b.consistency - a.consistency;
        default:
          return b.avgAttendance - a.avgAttendance;
      }
    });

    return {
      top: sortedStats.slice(0, showCount),
      bottom: sortedStats.slice(-showCount).reverse()
    };
  }, [data, sortBy, minSessions, excludeHosted, showCount]);

  const getRankingIcon = (index: number, isBottom = false) => {
    if (isBottom) {
      return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-red-600">#{index + 1}</span>;
    }
    
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-600">#{index + 1}</span>;
  };

  const getRankingBadge = (index: number, isBottom = false) => {
    if (isBottom) {
      if (index === 0) return <Badge className="bg-red-100 text-red-800 border-red-200">⚠️ Needs Attention</Badge>;
      return <Badge variant="outline" className="text-red-600 border-red-200">Bottom {showCount}</Badge>;
    }
    
    if (index === 0) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">🏆 Champion</Badge>;
    if (index === 1) return <Badge className="bg-gray-100 text-gray-800 border-gray-200">🥈 Runner-up</Badge>;
    if (index === 2) return <Badge className="bg-orange-100 text-orange-800 border-orange-200">🥉 Third Place</Badge>;
    if (index < 5) return <Badge variant="secondary">Top 5</Badge>;
    return <Badge variant="outline">Top {showCount}</Badge>;
  };

  const getMetricValue = (item: any) => {
    switch (sortBy) {
      case 'attendance':
        return `${item.avgAttendance} avg`;
      case 'revenue':
        return `₹${item.avgRevenue.toLocaleString()}`;
      case 'fillRate':
        return `${item.fillRate}%`;
      case 'consistency':
        return `${item.consistency}% consistent`;
      default:
        return `${item.avgAttendance} avg`;
    }
  };

  const RankingCard = ({ item, index, isBottom = false }: { item: any; index: number; isBottom?: boolean }) => (
    <div
      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
        !isBottom && index === 0
          ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-md'
          : !isBottom && index === 1
          ? 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50'
          : !isBottom && index === 2
          ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-red-50'
          : isBottom && index === 0
          ? 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {getRankingIcon(index, isBottom)}
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 text-lg truncate">{item.name}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
              <span>{item.totalSessions} sessions</span>
              <span>{item.trainerCount} trainers</span>
              <span>{item.locationCount} locations</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {getMetricValue(item)}
            </div>
            <div className="text-xs text-slate-500">
              {item.totalAttendance.toLocaleString()} total
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {getRankingBadge(index, isBottom)}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Badge variant="outline" className="text-center">
                {item.fillRate}% fill
              </Badge>
              <Badge variant="outline" className="text-center">
                {item.consistency}% consistent
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional metrics row */}
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-4 text-xs text-slate-600">
        <div className="text-center">
          <div className="font-semibold">₹{item.revenuePerAttendee}</div>
          <div>per attendee</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">±{item.stdDev}</div>
          <div>std dev</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">{item.dayCount}</div>
          <div>days/week</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">{item.timeCount}</div>
          <div>time slots</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Ranking Settings & Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
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
                  <SelectItem value="consistency">
                    <BarChart3 className="w-4 h-4 mr-2 inline" />
                    Consistency
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Min Sessions</Label>
              <Input
                type="number"
                value={minSessions}
                onChange={(e) => setMinSessions(Number(e.target.value))}
                min="1"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Show Count</Label>
              <Select value={showCount.toString()} onValueChange={(value) => setShowCount(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top/Bottom 5</SelectItem>
                  <SelectItem value="10">Top/Bottom 10</SelectItem>
                  <SelectItem value="15">Top/Bottom 15</SelectItem>
                  <SelectItem value="20">Top/Bottom 20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Filters</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="exclude-hosted"
                  checked={excludeHosted}
                  onChange={(e) => setExcludeHosted(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="exclude-hosted" className="text-sm">
                  Exclude hosted classes
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <Badge variant="outline" className="text-slate-600">
                {rankings.top.length + rankings.bottom.length} classes ranked
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Top Performers
              <Badge className="bg-green-100 text-green-800">Best {showCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rankings.top.map((classFormat, index) => (
              <RankingCard key={classFormat.name} item={classFormat} index={index} />
            ))}
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ArrowDown className="w-6 h-6 text-red-600" />
              Needs Improvement
              <Badge className="bg-red-100 text-red-800">Bottom {showCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rankings.bottom.map((classFormat, index) => (
              <RankingCard key={classFormat.name} item={classFormat} index={index} isBottom />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};